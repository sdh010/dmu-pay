<?php
require_once 'cors.php';

session_start();


if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 2) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $merchantCode = $_SESSION['merchant_code'];
    $period = $_GET['period'] ?? 'today'; // today, yesterday, week, month

    $dateCondition = '';
    $params = [$merchantCode];
    
    switch ($period) {
        case 'today':
            $dateCondition = "AND DATE(p.trx_date) = CURDATE()";
            break;
        case 'yesterday':
            $dateCondition = "AND DATE(p.trx_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            break;
        case 'week':
            $dateCondition = "AND p.trx_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            break;
        case 'month':
            $dateCondition = "AND YEAR(p.trx_date) = YEAR(CURDATE()) AND MONTH(p.trx_date) = MONTH(CURDATE())";
            break;
    }

    // 매출, 주문건, 환불 통계
    $stmt = $conn->prepare("
        SELECT 
            SUM(CASE WHEN p.is_cancelled = FALSE THEN p.cost ELSE 0 END) as total_sales,
            COUNT(CASE WHEN p.is_cancelled = FALSE THEN 1 END) as total_orders,
            SUM(CASE WHEN p.is_cancelled = TRUE THEN p.cost ELSE 0 END) as total_refunds,
            COUNT(CASE WHEN p.is_cancelled = TRUE THEN 1 END) as refund_count,
            AVG(CASE WHEN p.is_cancelled = FALSE THEN p.cost END) as avg_payment
        FROM merchants_payments p 
        WHERE p.merchant_code = ? $dateCondition
    ");
    
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode([
        'success' => true,
        'data' => [
            'sales' => (int)($result['total_sales'] ?? 0),
            'orders' => (int)($result['total_orders'] ?? 0),
            'refunds' => (int)($result['total_refunds'] ?? 0),
            'avgPayment' => (int)($result['avg_payment'] ?? 0)
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
