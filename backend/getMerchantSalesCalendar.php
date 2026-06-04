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
    $year = $_GET['year'] ?? date('Y');
    $month = $_GET['month'] ?? date('m');

    if (!checkdate($month, 1, $year)) {
        throw new Exception('유효하지 않은 날짜입니다.');
    }

    $stmt = $conn->prepare(
        "SELECT sales_date, daily_sales
         FROM merchant_sales
         WHERE merchant_code = ? AND YEAR(sales_date) = ? AND MONTH(sales_date) = ?"
    );
    $stmt->bind_param('sii', $merchant_code, $year, $month);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $salesData = [];
    $totalSales = 0;
    while($row = $result->fetch_assoc()) {
        $salesData[$row['sales_date']] = (int)$row['daily_sales'];
        $totalSales += (int)$row['daily_sales'];
    }
    
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success' => true, 
        'salesData' => $salesData,
        'totalSales' => $totalSales
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->close();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
