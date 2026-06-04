<?php
// backend/AdminMerchantPage.php
require_once 'cors.php';

ini_set('display_errors', 0);
error_reporting(0);

session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) throw new Exception('DB 연결 실패: ' . $conn->connect_error);

    $searchName = trim($_GET['search_name'] ?? '');
    $page       = max(1, intval($_GET['page'] ?? 1));
    $limit      = 10;
    $offset     = ($page - 1) * $limit;

    $whereClause = '';
    $params      = [];
    $types       = '';
    if ($searchName !== '') {
        $whereClause = "WHERE m.store_name LIKE ?";
        $params[]    = "%{$searchName}%";
        $types      .= 's';
    }

    $countSql = "SELECT COUNT(*) AS total FROM merchants m $whereClause";
    $stmtCount = $conn->prepare($countSql);
    if ($params) $stmtCount->bind_param($types, ...$params);
    $stmtCount->execute();
    $totalCount = (int)$stmtCount->get_result()->fetch_assoc()['total'];
    $stmtCount->close();
    $totalPages = (int)ceil($totalCount / $limit);

    // --- 새로운 월 주기 정산 상태 로직 ---
    $sql = "
        SELECT 
            m.store_name,
            m.merchant_code,
            m.phone,
            m.reg_date,
            CASE
                -- 1. 오늘이 20일 이후이고, 이번 달에 완료된 정산이 없으면 '정산대기'로 표시
                WHEN DAY(NOW()) >= 20 AND NOT EXISTS (
                    SELECT 1 FROM merchant_points mp
                    WHERE mp.merchant_code = m.merchant_code
                      AND mp.settle_status = 0
                      AND YEAR(mp.settle_date) = YEAR(NOW())
                      AND MONTH(mp.settle_date) = MONTH(NOW())
                ) THEN '정산대기'
                
                -- 2. 그 외의 경우, 가장 최근 정산 기록의 상태를 따름
                WHEN latest_mp.settle_status = 0 THEN '정산완료'
                WHEN latest_mp.settle_status = 1 THEN '정산대기' -- (예: 지난달 정산을 아직 안한 경우)
                WHEN latest_mp.settle_status = 2 THEN '정산오류'
                
                -- 3. 정산 기록이 전혀 없는 신규 가맹점은 항상 '정산대기'
                ELSE '정산대기'
            END AS settle_status
        FROM merchants m
        LEFT JOIN (
            -- 각 가맹점별 가장 최근 정산 기록 조회
            SELECT mp1.*
            FROM merchant_points mp1
            INNER JOIN (
                SELECT merchant_code, MAX(mp_id) as max_id
                FROM merchant_points
                GROUP BY merchant_code
            ) mp2 ON mp1.merchant_code = mp2.merchant_code AND mp1.mp_id = mp2.max_id
        ) latest_mp ON m.merchant_code = latest_mp.merchant_code
        $whereClause
        ORDER BY m.m_id DESC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);
    $allParams = array_merge($params, [$limit, $offset]);
    $allTypes  = $types . 'ii';
    if ($allParams) $stmt->bind_param($allTypes, ...$allParams);

    $stmt->execute();
    $result = $stmt->get_result();
    $merchants = [];
    while ($row = $result->fetch_assoc()) {
        $merchants[] = [
            'store_name'    => $row['store_name'],
            'merchant_code' => $row['merchant_code'],
            'phone'         => $row['phone'] ?? '',
            'reg_date'      => $row['reg_date'] ?? '',
            'settle_status' => $row['settle_status']
        ];
    }
    $stmt->close();
    $conn->close();

    echo json_encode([
        'success'     => true,
        'merchants'   => $merchants,
        'totalPages'  => $totalPages,
        'currentPage' => $page,
        'totalCount'  => $totalCount
    ]);

} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) $conn->close();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

