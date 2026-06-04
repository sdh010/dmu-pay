<?php
require_once 'cors.php';

/* -------------------------------------------------
   1) 세션 설정
---------------------------------------------------*/
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'samesite' => 'Lax'
]);
session_start();

/* -------------------------------------------------
   2) DB 연결
---------------------------------------------------*/
$db = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($db->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB 연결 실패']);
    exit;
}

/* -------------------------------------------------
   3) 파라미터·세션 검사
---------------------------------------------------*/
$student_no = $_SESSION['student_no'] ?? null;
if (!$student_no) {
    echo json_encode(['success' => false, 'message' => 'NOT_LOGGED_IN']);
    exit;
}

$page = max(1, (int)($_GET['page'] ?? 1));
$type = $_GET['type'] ?? 'all';                // all | earn | use
$limit  = 10;
$offset = ($page - 1) * $limit;

/* -------------------------------------------------
   4) SQL 조건 동적 생성
---------------------------------------------------*/
$where = "student_no = '$student_no'";
if ($type === 'earn') $where .= " AND point_type = 1";
if ($type === 'use')  $where .= " AND point_type = 2";

/* -------------------------------------------------
   5) 총 레코드·잔액·차트·목록 쿼리
---------------------------------------------------*/
$total = $db->query("SELECT COUNT(*) FROM student_points WHERE $where")
            ->fetch_row()[0];

$balance = $db->query("
    SELECT COALESCE(SUM(IF(point_type = 1, point_amount, -point_amount)), 0)
    FROM student_points
    WHERE student_no = '$student_no'
")->fetch_row()[0];

$list = $db->query("
    SELECT 
        DATE_FORMAT(trx_date,'%Y.%m.%d') AS date_fmt,
        point_type,
        reason,
        point_amount
    FROM student_points
    WHERE $where
    ORDER BY trx_date DESC, sp_id DESC
    LIMIT $limit OFFSET $offset
")->fetch_all(MYSQLI_ASSOC);

$chart = $db->query("
    SELECT 
        DATE_FORMAT(trx_date,'%m.%d') AS label,
        SUM(IF(point_type = 1, point_amount, 0)) AS earn,
        SUM(IF(point_type = 2, point_amount, 0)) AS useAmt
    FROM student_points
    WHERE student_no = '$student_no'
    GROUP BY trx_date
    ORDER BY trx_date
")->fetch_all(MYSQLI_ASSOC);

/* -------------------------------------------------
   6) 최종 JSON 응답
---------------------------------------------------*/
echo json_encode([
    'success' => true,
    'balance' => (int)$balance,
    'total'   => (int)$total,
    'list'    => $list,
    'chart'   => $chart
]);
?>
