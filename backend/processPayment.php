<?php
require_once 'cors.php';
session_start();

if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 1) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '학생만 결제할 수 있습니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) throw new Exception('DB 연결 실패');

    $input = json_decode(file_get_contents('php://input'), true);
    $merchant_code = $input['merchant_code'] ?? '';
    $amount = (int)($input['amount'] ?? 0);
    $password = $input['password'] ?? '';
    $student_no = $_SESSION['student_no'] ?? '';

    if (!$merchant_code || $amount <= 0 || !$password || !$student_no) {
        throw new Exception('결제 정보가 올바르지 않습니다.');
    }

    $conn->begin_transaction();

    // 1. Student info check
    $stmt = $conn->prepare("SELECT name, points, pay_pin FROM students WHERE student_no = ?");
    $stmt->bind_param('s', $student_no);
    $stmt->execute();
    $student = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$student) throw new Exception('학생 정보를 찾을 수 없습니다.');
    if ($student['pay_pin'] !== $password) throw new Exception('결제 비밀번호가 일치하지 않습니다.');
    if ($student['points'] < $amount) throw new Exception('포인트 잔액이 부족합니다.');
    $customer_name = $student['name'];

    // 2. Merchant info check
    $stmt = $conn->prepare("SELECT store_name FROM merchants WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchant_code);
    $stmt->execute();
    $merchant = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$merchant) throw new Exception('존재하지 않는 가맹점 코드입니다.');
    $store_name = $merchant['store_name'];

    // 3. Deduct student points
    $stmt = $conn->prepare("UPDATE students SET points = points - ? WHERE student_no = ?");
    $stmt->bind_param('is', $amount, $student_no);
    if (!$stmt->execute()) throw new Exception('포인트 차감 실패');
    $stmt->close();
    
    // 4. Log student point usage
    $stmt = $conn->prepare("INSERT INTO student_points (student_no, point_type, point_amount, reason) VALUES (?, 2, ?, ?)");
    $stmt->bind_param('sis', $student_no, $amount, $store_name);
    if (!$stmt->execute()) throw new Exception('포인트 사용 내역 기록 실패');
    $stmt->close();

    // 5. Log merchant payment
    // --- FIX: 'menu_item' column removed from INSERT statement as it does not exist in the database. ---
    $stmt = $conn->prepare("INSERT INTO merchants_payments (merchant_code, store_name, cost, customer_name) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('ssis', $merchant_code, $store_name, $amount, $customer_name);
    if (!$stmt->execute()) throw new Exception('가맹점 결제 내역 기록 실패');
    $stmt->close();
    
    $conn->commit();
    $conn->close();

    echo json_encode(['success' => true, 'message' => '결제가 완료되었습니다.']);

} catch (Exception $e) {
    if (isset($conn) && $conn->ping()) {
        $conn->rollback();
        $conn->close();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

