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
    $year = $_GET['year'] ?? date('Y');
    $month = $_GET['month'] ?? date('n');

    // 해당 월의 일별 매출
    $stmt = $conn->prepare("
        SELECT 
            DAY(p.trx_date) as day,
            SUM(CASE WHEN p.is_cancelled = FALSE THEN p.cost ELSE 0 END) as daily_sales
        FROM merchants_payments p 
        WHERE p.merchant_code = ? 
          AND YEAR(p.trx_date) = ? 
          AND MONTH(p.trx_date) = ?
          AND p.is_cancelled = FALSE
        GROUP BY DAY(p.trx_date)
        ORDER BY day
    ");
    
    $stmt->bind_param('sii', $merchantCode, $year, $month);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $dailySales = [];
    $totalSales = 0;
    $maxSales = 0;
    $minSales = PHP_INT_MAX;
    
    while ($row = $result->fetch_assoc()) {
        $sales = (int)$row['daily_sales'];
        $dailySales[$row['day']] = $sales;
        $totalSales += $sales;
        $maxSales = max($maxSales, $sales);
        if ($sales > 0) $minSales = min($minSales, $sales);
    }
    $stmt->close();

    if ($minSales === PHP_INT_MAX) $minSales = 0;

    // 해당 월의 일수 계산
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
    
    // 1일부터 말일까지 배열 생성 (없는 날은 0)
    $calendarData = [];
    for ($day = 1; $day <= $daysInMonth; $day++) {
        $calendarData[] = [
            'day' => $day,
            'sales' => $dailySales[$day] ?? 0
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'year' => (int)$year,
            'month' => (int)$month,
            'totalSales' => $totalSales,
            'maxSales' => $maxSales,
            'minSales' => $minSales,
            'calendar' => $calendarData
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
