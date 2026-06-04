<?php
// backend/updatePaymentStatus.php
require_once 'cors.php'; // Handles all CORS settings.

ini_set('display_errors', 0);
error_reporting(0);

session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 2 || !isset($_SESSION['merchant_code'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('잘못된 요청 방식입니다.');
    }

    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) throw new Exception('DB 연결 실패');

    $input = json_decode(file_get_contents('php://input'), true);
    $payment_id = $input['payment_id'] ?? 0;

    if ($payment_id <= 0) {
        throw new Exception('잘못된 요청입니다.');
    }
    
    // Get the current business date using the DB function.
    $today_business_date_result = $conn->query("SELECT calculate_business_date(NOW()) as biz_date");
    $today_business_date = $today_business_date_result->fetch_assoc()['biz_date'];
    $today_business_date_result->close();

    // Check if the transaction belongs to the merchant, is not cancelled, and occurred 'today'.
    $merchant_code = $_SESSION['merchant_code'];
    $stmt_check = $conn->prepare(
        "SELECT payment_id FROM merchants_payments 
         WHERE payment_id = ? AND merchant_code = ? AND is_cancelled = FALSE AND calculate_business_date(txn_at) = ?"
    );
    $stmt_check->bind_param('iss', $payment_id, $merchant_code, $today_business_date);
    $stmt_check->execute();
    if ($stmt_check->get_result()->num_rows === 0) {
        throw new Exception('환불 기간이 지났거나 이미 처리된 거래입니다.');
    }
    $stmt_check->close();

    $conn->begin_transaction();

    // 1. Update merchants_payments status.
    $stmt = $conn->prepare("UPDATE merchants_payments SET is_cancelled = TRUE WHERE payment_id = ?");
    $stmt->bind_param('i', $payment_id);
    if(!$stmt->execute()) throw new Exception('거래 취소에 실패했습니다.');
    $stmt->close();
    
    // 2. Refund points to the student.
    $stmt = $conn->prepare("
        SELECT p.cost, s.student_no, m.store_name
        FROM merchants_payments p
        JOIN students s ON p.customer_name = s.name
        JOIN merchants m ON p.merchant_code = m.merchant_code
        WHERE p.payment_id = ?
    ");
    $stmt->bind_param('i', $payment_id);
    $stmt->execute();
    $payment_info = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if($payment_info) {
        $refund_amount = $payment_info['cost'];
        $student_no = $payment_info['student_no'];
        $store_name = $payment_info['store_name'];

        // Restore student points.
        $stmt_refund = $conn->prepare("UPDATE students SET points = points + ? WHERE student_no = ?");
        $stmt_refund->bind_param('is', $refund_amount, $student_no);
        if(!$stmt_refund->execute()) throw new Exception('포인트 환불 실패');
        $stmt_refund->close();

        // Log the point refund transaction for the student.
        $reason = "{$store_name} 결제 환불";
        $stmt_log = $conn->prepare("INSERT INTO student_points (student_no, point_type, point_amount, reason) VALUES (?, 1, ?, ?)");
        $stmt_log->bind_param('sis', $student_no, $refund_amount, $reason);
        if(!$stmt_log->execute()) throw new Exception('포인트 환불 내역 기록 실패');
        $stmt_log->close();
    }

    $conn->commit();
    $conn->close();
    echo json_encode(['success' => true, 'message' => '환불 처리되었습니다.']);

} catch (Exception $e) {
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
        $conn->close();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

