<?php
// backend/getMerchantStats.php
require_once 'cors.php'; // Handles all CORS settings.

ini_set('display_errors', 0);
error_reporting(0);
session_start();

// Check for merchant authorization.
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 2 || !isset($_SESSION['merchant_code'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $merchant_code = $_SESSION['merchant_code'];
    $period = $_GET['period'] ?? 'today'; // 'today', 'week', 'month'

    // --- Calculate Date Ranges ---
    $start_date = '';
    $end_date = '';

    // Use the SQL function for business date calculation.
    $today_biz_date_res = $conn->query("SELECT calculate_business_date(NOW()) as biz_date");
    $today_biz_date = $today_biz_date_res->fetch_assoc()['biz_date'];
    $today_biz_date_res->close();

    if ($period === 'today') {
        $start_date = $today_biz_date;
        $end_date = $today_biz_date;
    } elseif ($period === 'week') {
        // Monday of the current week (day 1) to Sunday (day 7)
        $day_of_week = date('N'); // 1 (for Monday) through 7 (for Sunday)
        $start_date = date('Y-m-d', strtotime("-" . ($day_of_week - 1) . " days"));
        $end_date = date('Y-m-d', strtotime("+" . (7 - $day_of_week) . " days"));
    } elseif ($period === 'month') {
        $start_date = date('Y-m-01');
        $end_date = date('Y-m-t');
    } else {
        throw new Exception('Invalid period specified.');
    }

    // --- Fetch Statistics Data ---
    $stats = [
        'sales' => 0,
        'returns' => 0,
        'orders' => 0,
        'average' => 0,
        'settlement' => 0,
    ];

    // Calculate stats for the selected period (today, week, month) from merchant_sales.
    $stmt_period = $conn->prepare(
        "SELECT 
            IFNULL(SUM(daily_sales), 0) as total_sales,
            IFNULL(SUM(order_cnt), 0) as total_orders,
            IFNULL(SUM(cancel_cnt), 0) as total_cancels
         FROM merchant_sales
         WHERE merchant_code = ? AND sales_date BETWEEN ? AND ?"
    );
    $stmt_period->bind_param('sss', $merchant_code, $start_date, $end_date);
    $stmt_period->execute();
    $period_data = $stmt_period->get_result()->fetch_assoc();
    $stmt_period->close();
    
    if ($period_data) {
        $stats['sales'] = (int)$period_data['total_sales'];
        $stats['orders'] = (int)$period_data['total_orders'];
        // We need the value of returns, which is in merchants_payments.
        $stmt_returns = $conn->prepare(
            "SELECT IFNULL(SUM(cost), 0) as total_return_cost
             FROM merchants_payments
             WHERE merchant_code = ? AND is_cancelled = TRUE AND calculate_business_date(txn_at) BETWEEN ? AND ?"
        );
        $stmt_returns->bind_param('sss', $merchant_code, $start_date, $end_date);
        $stmt_returns->execute();
        $stats['returns'] = (int)$stmt_returns->get_result()->fetch_assoc()['total_return_cost'];
        $stmt_returns->close();

        if ($stats['orders'] > 0) {
            $stats['average'] = round($stats['sales'] / $stats['orders']);
        }
    }

    // Calculate this month's total settlement amount (always for the current month).
    $month_start = date('Y-m-01');
    $month_end = date('Y-m-t');
    $stmt_month = $conn->prepare(
        "SELECT IFNULL(SUM(daily_sales), 0) as monthly_sales
         FROM merchant_sales
         WHERE merchant_code = ? AND sales_date BETWEEN ? AND ?"
    );
    $stmt_month->bind_param('sss', $merchant_code, $month_start, $month_end);
    $stmt_month->execute();
    $stats['settlement'] = (int)$stmt_month->get_result()->fetch_assoc()['monthly_sales'];
    $stmt_month->close();

    $conn->close();
    echo json_encode(['success' => true, 'data' => $stats]);

} catch (Exception $e) {
    if (isset($conn)) $conn->close();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
