<?php
require_once 'cors.php';

session_start();

if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 2 || !isset($_SESSION['merchant_code'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

// 세션에 저장된 정보를 바로 사용
$data = [
    'store_name' => $_SESSION['store_name'] ?? '가게 이름',
    'owner_name' => $_SESSION['owner_name'] ?? '사장님'
];

echo json_encode(['success' => true, 'data' => $data]);
?>
