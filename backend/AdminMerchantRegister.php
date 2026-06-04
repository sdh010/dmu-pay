<?php
require_once 'cors.php';
session_start();
if(!isset($_SESSION['user'])||$_SESSION['user']['user_type']!==0){
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'권한이 없습니다.']);
    exit;
}
if($_SERVER['REQUEST_METHOD']!=='POST'){
    http_response_code(405);
    echo json_encode(['success'=>false,'message'=>'잘못된 요청 방식입니다.']);
    exit;
}
try{
    $conn=new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
    if($conn->connect_error) throw new Exception('DB 연결 실패');
    $storeName     = trim($_POST['storeName'] ?? '');
    $merchantCode  = trim($_POST['merchantCode'] ?? '');
    $username      = trim($_POST['username'] ?? '');
    $password      = trim($_POST['password'] ?? '');
    $phone         = trim($_POST['phone'] ?? '');
    $address       = trim($_POST['address'] ?? '');
    $accountHolder = trim($_POST['accountHolder'] ?? '');
    $bankName      = trim($_POST['bankName'] ?? '');
    $accountNumber = trim($_POST['accountNumber'] ?? '');
    $businessNo    = trim($_POST['businessNumber'] ?? '');
    $category      = trim($_POST['category'] ?? '일반');
    $note          = trim($_POST['note'] ?? '');
    if(!$storeName||!$merchantCode||!$username||!$password||!$phone||!$accountHolder||!$bankName||!$accountNumber){
        throw new Exception('필수 항목이 누락되었습니다.');
    }
    $check=$conn->prepare("SELECT COUNT(*) AS cnt FROM users WHERE username=?");
    $check->bind_param('s',$username);
    $check->execute();
    if($check->get_result()->fetch_assoc()['cnt']>0) throw new Exception('이미 사용 중인 아이디입니다.');
    $check->close();
    $conn->begin_transaction();
    $hash=password_hash($password,PASSWORD_DEFAULT);
    $u=$conn->prepare("INSERT INTO users(user_type,username,password) VALUES(2,?,?)");
    $u->bind_param('ss',$username,$hash);
    if(!$u->execute()) throw new Exception('계정 생성 실패');
    $userId=$conn->insert_id;
    $u->close();
    $m=$conn->prepare(
        "INSERT INTO merchants(user_id,store_name,merchant_code,phone,address,account_holder,bank_name,account_number,business_no,category)
         VALUES(?,?,?,?,?,?,?,?,?,?)"
    );
    $m->bind_param('isssssssss',
        $userId,$storeName,$merchantCode,$phone,$address,
        $accountHolder,$bankName,$accountNumber,$businessNo,$category
    );
    if(!$m->execute()) throw new Exception('가맹점 등록 실패');
    $m->close();
    $p=$conn->prepare("INSERT INTO merchant_points(merchant_code,reg_date,settle_status,note) VALUES(?,CURDATE(),1,?)");
    $p->bind_param('ss',$merchantCode,$note);
    if(!$p->execute()) throw new Exception('정산 초기화 실패');
    $p->close();
    $conn->commit();
    echo json_encode(['success'=>true,'message'=>'가맹점이 등록되었습니다.']);
    $conn->close();
}catch(Exception$e){
    if(isset($conn)&&$conn instanceof mysqli){
        $conn->rollback();
        $conn->close();
    }
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>
