<?php
require_once 'cors.php';

session_set_cookie_params(['lifetime'=>0,'path'=>'/','samesite'=>'Lax']);
session_start();

$db = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
if ($db->connect_error) {
    echo json_encode(['success'=>false,'message'=>'DB 연결 실패']);
    exit;
}

// 파라미터
$page = max(1, (int)($_GET['page'] ?? 1));
$category = $_GET['category'] ?? 'all';
$search = $_GET['search'] ?? '';
$limit = 10;
$offset = ($page - 1) * $limit;

// WHERE 구성
$where = "1=1";
$params = [];
$types = "";

if ($category !== 'all') {
    $where .= " AND category = ?";
    $params[] = $category;
    $types .= "s";
}
if ($search !== '') {
    $where .= " AND store_name LIKE ?";
    $params[] = "%$search%";
    $types .= "s";
}

// 총개수
$countSql = "SELECT COUNT(*) FROM merchants WHERE $where";
if ($params) {
    $cntStmt = $db->prepare($countSql);
    $cntStmt->bind_param($types, ...$params);
    $cntStmt->execute();
    $total = $cntStmt->get_result()->fetch_row()[0];
    $cntStmt->close();
} else {
    $total = $db->query($countSql)->fetch_row()[0];
}

// 목록
$listSql = "
  SELECT store_name, category, address, phone, merchant_code
  FROM merchants
  WHERE $where
  ORDER BY store_name
  LIMIT $limit OFFSET $offset
";
if ($params) {
    $lstStmt = $db->prepare($listSql);
    $lstStmt->bind_param($types, ...$params);
    $lstStmt->execute();
    $merchants = $lstStmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $lstStmt->close();
} else {
    $merchants = $db->query($listSql)->fetch_all(MYSQLI_ASSOC);
}

// 업종 목록
$cats = $db->query("
  SELECT DISTINCT category FROM merchants
  WHERE category <> ''
  ORDER BY category
")->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'merchants' => $merchants,
    'total' => (int)$total,
    'page' => $page,
    'totalPages' => ceil($total / $limit),
    'categories' => array_column($cats, 'category')
]);

$db->close();
?>
