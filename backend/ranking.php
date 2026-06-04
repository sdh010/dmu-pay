<?php
require_once 'cors.php';
session_start();

// 세션 디버깅 로그 (임시 - 문제 해결 후 제거)
file_put_contents('session_debug.txt', 
    "Session ID: " . session_id() . "\n" .
    "Student_no: " . ($_SESSION['student_no'] ?? 'NOT_SET') . "\n" .
    "Full session: " . print_r($_SESSION, true) . "\n" .
    "Time: " . date('Y-m-d H:i:s') . "\n\n", 
    FILE_APPEND
);

// 세션 검증
if (empty($_SESSION['student_no'])) {
    echo json_encode(['success' => false, 'message' => 'NOT_LOGGED_IN']);
    exit;
}

$student_no = $_SESSION['student_no'];

// DB 연결
$db = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($db->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB 연결 실패: ' . $db->connect_error]);
    exit;
}

// 날짜 범위 계산 (현재는 2025년 1학기 예시, 실제는 동적으로 계산 권장)
$start = '2025-03-01';
$end   = '2025-07-01';

// 랭킹 Top 10 (real_rank 포함)
$stmt = $db->prepare("
    SELECT s.name, 
           SUM(sp.point_amount) AS total_point,
           RANK() OVER (ORDER BY SUM(sp.point_amount) DESC) AS real_rank
    FROM students s
    JOIN student_points sp ON s.student_no = sp.student_no
    WHERE sp.point_type = 1
      AND sp.trx_date >= ? AND sp.trx_date < ?
    GROUP BY s.student_no
    ORDER BY total_point DESC
    LIMIT 10
");
$stmt->bind_param("ss", $start, $end);
$stmt->execute();
$ranking = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

// 전체 학생 수
$res = $db->query("SELECT COUNT(*) FROM students");
$total_students = $res->fetch_row()[0];

// 내 랭킹 계산
$my_rank = null;
$my_point = null;
$sql = "
SELECT student_no, my_point, rank FROM (
    SELECT 
      s.student_no,
      s.name,
      SUM(sp.point_amount) AS my_point,
      RANK() OVER (ORDER BY SUM(sp.point_amount) DESC) AS rank
    FROM students s
    JOIN student_points sp ON s.student_no = sp.student_no
    WHERE sp.point_type = 1 AND sp.trx_date >= '$start' AND sp.trx_date < '$end'
    GROUP BY s.student_no
) t
WHERE student_no = '$student_no'
";
$result = $db->query($sql);
if ($row = $result->fetch_assoc()) {
    $my_rank = $row['rank'];
    $my_point = $row['my_point'];
}

echo json_encode([
    'success' => true,
    'ranking' => $ranking,
    'my_rank' => $my_rank,
    'my_point' => $my_point,
    'total_students' => $total_students
]);

$db->close();
?>
