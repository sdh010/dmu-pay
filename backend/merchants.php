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

// 파라미터 받기
$page = max(1, (int)($_GET['page'] ?? 1));
$category = $_GET['category'] ?? 'all';  // all | 음식점 | 상점 | 기타
$search = $_GET['search'] ?? '';
$limit = 10;
$offset = ($page - 1) * $limit;

// WHERE 조건 구성
$where = "1=1";
$params = [];
$types = "";

// 업종 필터링
if ($category !== 'all') {
    $where .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}

// 검색어 필터링
if (!empty($search)) {
    $where .= " AND store_name LIKE ?";
    $params[] = "%$search%";
    $types .= "s";
}

// 총 개수 조회
$countSql = "SELECT COUNT(*) FROM merchants WHERE $where";
if (!empty($params)) {
    $countStmt = $db->prepare($countSql);
    $countStmt->bind_param($types, ...$params);
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_row()[0];
    $countStmt->close();
} else {
    $total = $db->query($countSql)->fetch_row()[0];
}

// 가맹점 목록 조회
$listSql = "
    SELECT m.store_name, m.category, m.address, m.phone, m.merchant_code
    FROM merchants m
    WHERE $where
    ORDER BY m.store_name
    LIMIT $limit OFFSET $offset
";

if (!empty($params)) {
    $listStmt = $db->prepare($listSql);
    $listStmt->bind_param($types, ...$params);
    $listStmt->execute();
    $merchants = $listStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $listStmt->close();
} else {
    $merchants = $db->query($listSql)->fetch_all(MYSQLI_ASSOC);
}

// 업종 목록 조회 (필터 옵션용)
$categories = $db->query("
    SELECT DISTINCT category 
    FROM merchants 
    WHERE category IS NOT NULL AND category != ''
    ORDER BY category
")->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'merchants' => $merchants,
    'total' => (int)$total,
    'page' => $page,
    'totalPages' => ceil($total / $limit),
    'categories' => array_column($categories, 'category')
]);

$db->close();
?>
