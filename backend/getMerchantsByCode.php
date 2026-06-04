<?php
require_once 'cors.php';
session_start();
$db = new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
$code = $_GET['code'] ?? '';
$stmt = $db->prepare("SELECT store_name, merchant_code FROM merchants WHERE merchant_code=?");
$stmt->bind_param('s',$code);
$stmt->execute();
$res = $stmt->get_result();
if($row=$res->fetch_assoc()){
  echo json_encode(['success'=>true,'merchant'=>$row]);
} else {
  echo json_encode(['success'=>false,'message'=>'가맹점을 찾을 수 없습니다.']);
}
$stmt->close();
$db->close();
?>
