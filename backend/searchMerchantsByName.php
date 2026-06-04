<?php
// backend/searchMerchantsByName.php
// 가게 이름으로 가맹점을 검색하는 API
require_once 'cors.php'; // 공용 CORS 설정 포함
session_start();

// 학생 또는 관리자만 이 API를 사용할 수 있도록 기본 권한 확인
if (!isset($_SESSION['user'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '로그인이 필요합니다.']);
    exit;
}

try {
    $term = trim($_GET['term'] ?? '');

    // 검색어가 1글자 미만이면 검색하지 않음
    if (mb_strlen($term, 'utf-8') < 1) {
        echo json_encode(['success' => true, 'merchants' => []]);
        exit;
    }

    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $searchTerm = "%{$term}%";
    
    // store_name (상호명)으로 LIKE 검색을 수행, 상위 5개만 반환
    $stmt = $conn->prepare("
        SELECT store_name, merchant_code 
        FROM merchants 
        WHERE store_name LIKE ? 
        LIMIT 5
    ");
    $stmt->bind_param('s', $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'merchants' => $result]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
