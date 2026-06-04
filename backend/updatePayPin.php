<?php
require_once 'cors.php';

session_start();
$db = new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
if ($db->connect_error) {
  echo json_encode(['success'=>false,'message'=>'DB 연결 실패']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$old = $input['old_pin'] ?? '';
$new = $input['new_pin'] ?? '';
$student_no = $_SESSION['student_no'] ?? null;

if (!$student_no || !$new || strlen($new) !== 6) {
  echo json_encode(['success'=>false,'message'=>'잘못된 요청입니다.']);
  exit;
}

// 기존 PIN 조회
$stmt = $db->prepare("SELECT pay_pin FROM students WHERE student_no = ?");
$stmt->bind_param('s', $student_no);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

// 기존 PIN이 있으면 검증
if ($row['pay_pin'] !== null && $row['pay_pin'] !== '') {
  if ($row['pay_pin'] !== $old) {
    echo json_encode(['success'=>false,'message'=>'기존 비밀번호가 일치하지 않습니다.']);
    exit;
  }
}

// 새 PIN 업데이트
$stmt = $db->prepare("UPDATE students SET pay_pin = ? WHERE student_no = ?");
$stmt->bind_param('ss', $new, $student_no);
$stmt->execute();
$stmt->close();
$db->close();

echo json_encode(['success'=>true,'message'=>'결제 비밀번호가 설정되었습니다.']);
?>
