<?php
require_once 'cors.php';

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'samesite' => 'Lax'
]);
session_start();

$db = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($db->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB 연결 실패']);
    exit;
}

$student_no = $_SESSION['student_no'] ?? null;
if (!$student_no) {
    echo json_encode(['success' => false, 'message' => 'NOT_LOGGED_IN']);
    exit;
}

// 학생 기본 정보 조회
$stmt = $db->prepare("
    SELECT name, student_no, major
    FROM students 
    WHERE student_no = ?
");
$stmt->bind_param('s', $student_no);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $student = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'student' => $student
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '학생 정보를 찾을 수 없습니다.'
    ]);
}

$stmt->close();
$db->close();
?>
