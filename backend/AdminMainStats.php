<?php
// backend/AdminMainStats.php
require_once 'cors.php'; // Handles all CORS settings.

ini_set('display_errors', 0);
error_reporting(0);

session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

$conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB 연결 실패']);
    exit;
}

// 1. 전체 학생 수
$res = $conn->query("SELECT COUNT(*) AS cnt FROM students");
$studentsTotal = (int)($res->fetch_assoc()['cnt'] ?? 0);
$res->close();

// --- SQL Date Range Calculation ---
$date_range_condition = "AND trx_date >= DATE_FORMAT(NOW(), '%Y-%m-01') AND trx_date < DATE_FORMAT(NOW() + INTERVAL 1 MONTH, '%Y-%m-01')";

// 2. 이번 달 지급된 포인트 합계 (point_type = 1)
// 환불로 인한 지급은 제외 (reason에 '환불'이 포함되지 않은 경우만)
$sql_added = "
    SELECT IFNULL(SUM(point_amount), 0) AS sum_pts
    FROM student_points
    WHERE point_type = 1 
    AND reason NOT LIKE '%환불%'
    {$date_range_condition}
";
$res_added = $conn->query($sql_added);
$ptsAdded = (int)($res_added->fetch_assoc()['sum_pts'] ?? 0);
$res_added->close();


$sql_used = "
    SELECT IFNULL(SUM(sp.point_amount), 0) AS sum_use
    FROM student_points sp
    LEFT JOIN merchants_payments mp ON sp.student_no = (SELECT student_no FROM students WHERE name = mp.customer_name LIMIT 1) 
        AND ABS(TIMESTAMPDIFF(SECOND, sp.trx_date, mp.txn_at)) < 5 -- Assuming payment and point deduction happen almost simultaneously
    WHERE sp.point_type = 2 
    AND (mp.is_cancelled IS NULL OR mp.is_cancelled = FALSE) -- Exclude if cancelled
    {$date_range_condition}
";


$sql_used_final = "
    SELECT IFNULL(SUM(point_amount), 0) AS sum_use
    FROM student_points
    WHERE point_type = 2 {$date_range_condition}
";
$res_used = $conn->query($sql_used_final);
$ptsUsed = (int)($res_used->fetch_assoc()['sum_use'] ?? 0);
$res_used->close();


$conn->close();

echo json_encode([
    'success'       => true,
    'studentsTotal' => $studentsTotal,
    'ptsAdded'      => $ptsAdded,
    'ptsUsed'       => $ptsUsed
]);
?>

