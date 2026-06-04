<?php
require_once 'cors.php';
session_set_cookie_params(['lifetime'=>0,'path'=>'/','samesite'=>'Lax']);
session_start();

$db = new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
if ($db->connect_error) {
  echo json_encode(['success'=>false,'message'=>'DB 연결 실패']);
  exit;
}

$student_no = $_SESSION['student_no'] ?? null;
if (!$student_no) {
  echo json_encode(['success'=>false,'message'=>'NOT_LOGGED_IN']);
  exit;
}

$stmt = $db->prepare("
  SELECT
    s.name,
    s.student_no,
    s.major,
    s.pay_pin,  -- 결제 PIN 포함
    CASE u.user_type WHEN 1 THEN '재학생' ELSE '알 수 없음' END AS status
  FROM students s
  JOIN users u ON u.user_id = s.user_id
  WHERE s.student_no = ?
");
$stmt->bind_param('s',$student_no);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
  echo json_encode(['success'=>true,'student'=>$row]);
} else {
  echo json_encode(['success'=>false,'message'=>'학생 정보를 찾을 수 없습니다.']);
}
$stmt->close();
$db->close();
?>
