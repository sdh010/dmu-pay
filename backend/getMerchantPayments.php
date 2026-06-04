<?php
require_once 'cors.php';
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 2 || !isset($_SESSION['merchant_code'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) throw new Exception('DB 연결 실패');

    $merchant_code = $_SESSION['merchant_code'];
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 10;
    $offset = ($page - 1) * $limit;

    // 현재 영업일(오전 5시 기준)을 DB 함수를 통해 계산
    $today_business_date_result = $conn->query("SELECT calculate_business_date(NOW()) as biz_date");
    $today_business_date = $today_business_date_result->fetch_assoc()['biz_date'];
    $today_business_date_result->close();

    // 오늘의 환불되지 않은 거래 총 개수를 계산
    $stmt_count = $conn->prepare(
        "SELECT COUNT(payment_id) as total 
         FROM merchants_payments 
         WHERE merchant_code = ? AND is_cancelled = FALSE AND calculate_business_date(txn_at) = ?"
    );
    $stmt_count->bind_param('ss', $merchant_code, $today_business_date);
    $stmt_count->execute();
    $total_rows = $stmt_count->get_result()->fetch_assoc()['total'];
    $totalPages = ceil($total_rows / $limit);
    $stmt_count->close();
    
    // 거래 내역이 없으면 여기서 실행 종료
    if($total_rows == 0) {
        echo json_encode(['success' => false, 'message' => '오늘의 거래 내역이 없습니다.']);
        $conn->close();
        exit;
    }

    // 오늘의 환불되지 않은 거래 목록을 페이징하여 조회
    $stmt = $conn->prepare(
        "SELECT payment_id, '포인트 결제' AS menu_item, cost, customer_name, txn_at, 
                (calculate_business_date(txn_at) = ?) AS is_refundable
         FROM merchants_payments
         WHERE merchant_code = ? AND is_cancelled = FALSE AND calculate_business_date(txn_at) = ?
         ORDER BY txn_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->bind_param('sssii', $today_business_date, $merchant_code, $today_business_date, $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    $payments = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true, 
        'payments' => $payments,
        'currentPage' => $page,
        'totalPages' => $totalPages
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->close();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

