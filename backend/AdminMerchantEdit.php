<?php
// backend/AdminMerchantEdit.php
require_once 'cors.php'; // CORS 정책 파일 포함

ini_set('display_errors', 0);
error_reporting(0);
session_start();

if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '허용되지 않는 요청 방식입니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) throw new Exception('DB 연결 실패');

    // FormData에서 데이터 받기
    $name          = trim($_POST['name'] ?? '');
    $code          = trim($_POST['code'] ?? '');
    $phone         = trim($_POST['phone'] ?? '');
    $address       = trim($_POST['address'] ?? '');
    $accountHolder = trim($_POST['accountHolder'] ?? '');
    $bankName      = trim($_POST['bankName'] ?? '');
    $accountNumber = trim($_POST['accountNumber'] ?? '');
    $businessNo    = trim($_POST['businessNumber'] ?? '');
    $category      = trim($_POST['category'] ?? '기타');
    // 'note' 필드는 DB에 없으므로 제거됨

    if (!$code) {
        throw new Exception('가맹점 코드 누락');
    }

    $stmt = $conn->prepare("
        UPDATE merchants
           SET store_name=?,
               phone=?,
               address=?,
               account_holder=?,
               bank_name=?,
               account_number=?,
               business_no=?,
               category=?
         WHERE merchant_code=?
    ");
    
    // 'note'가 빠졌으므로 s 9개에서 8개로 변경
    $stmt->bind_param(
        'sssssssss', 
        $name,
        $phone,
        $address,
        $accountHolder,
        $bankName,
        $accountNumber,
        $businessNo,
        $category,
        $code
    );

    if (!$stmt->execute()) {
        throw new Exception('수정 실패: ' . $stmt->error);
    }
    
    $stmt->close();
    echo json_encode(['success' => true, 'message' => '수정되었습니다.']);
    $conn->close();

} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

