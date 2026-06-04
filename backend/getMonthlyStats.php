<?php
require_once 'cors.php';

// 2) 세션 시작
session_set_cookie_params(['lifetime'=>0,'path'=>'/','samesite'=>'Lax']);
session_start();

// 3) DB 연결
$db = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($db->connect_error) {
    echo json_encode(['success'=>false,'message'=>'DB 연결 실패']);
    exit;
}

// 4) 세션에서 학번 확인
$student_no = $_SESSION['student_no'] ?? null;
if (!$student_no) {
    echo json_encode(['success'=>false,'message'=>'NOT_LOGGED_IN']);
    exit;
}

// 5) 전체 잔액 계산
$balRes = $db->query("
    SELECT COALESCE(SUM(IF(point_type=1, point_amount, -point_amount)),0) 
    AS balance
    FROM student_points
    WHERE student_no = '$student_no'
");
$balance = $balRes->fetch_assoc()['balance'];

// 6) 월별 집계
$statsRes = $db->query("
    SELECT 
      DATE_FORMAT(trx_date, '%c월') AS month,
      SUM(IF(point_type=1, point_amount, 0)) AS earn,
      SUM(IF(point_type=2, point_amount, 0)) AS useAmt
    FROM student_points
    WHERE student_no = '$student_no'
    GROUP BY MONTH(trx_date)
    ORDER BY MONTH(trx_date)
");
$data = $statsRes->fetch_all(MYSQLI_ASSOC);

// 7) JSON 응답
echo json_encode(['success'=>true,'balance'=> (int)$balance,'data'=>$data]);

$db->close();
?>
