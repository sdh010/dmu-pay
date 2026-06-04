<?php
// backend/AdminMerchantSettle.php
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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('잘못된 요청 방식입니다.');
    }
    
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $code = trim($input['code'] ?? '');

    if (!$code) {
        throw new Exception('가맹점 코드가 없습니다.');
    }

    // --- 월 주기 정산 확정 로직 ---
    // 이번 달에 해당하는 정산 기록을 '정산완료' 상태로 생성하거나 업데이트합니다.
    $current_year = date('Y');
    $current_month = date('m');
    $note = "{$current_year}년 {$current_month}월 정산 완료";

    // ON DUPLICATE KEY UPDATE를 사용하기 위해 merchant_points 테이블에 unique key가 필요합니다.
    // ALTER TABLE `merchant_points` ADD UNIQUE `unique_monthly_settlement`(`merchant_code`, `settle_year`, `settle_month`);
    // 위와 같은 키가 없다고 가정하고, INSERT 전에 SELECT로 확인하는 로직을 사용합니다.

    // 이번 달 정산 기록이 있는지 확인
    $stmt_check = $conn->prepare("
        SELECT mp_id FROM merchant_points 
        WHERE merchant_code = ? 
          AND YEAR(reg_date) = ? 
          AND MONTH(reg_date) = ?
    ");
    $stmt_check->bind_param('sii', $code, $current_year, $current_month);
    $stmt_check->execute();
    $existing_settlement = $stmt_check->get_result()->fetch_assoc();
    $stmt_check->close();

    if ($existing_settlement) {
        // 이미 이번 달 기록이 있으면 '완료'로 업데이트만 함
        $stmt_update = $conn->prepare("
            UPDATE merchant_points
               SET settle_status = 0, 
                   settle_date = CURDATE(),
                   note = ?
             WHERE mp_id = ?
        ");
        $stmt_update->bind_param('si', $note, $existing_settlement['mp_id']);
        $stmt_update->execute();
        $stmt_update->close();
    } else {
        // 이번 달 기록이 없으면 새로 '완료'된 상태로 생성
        $stmt_insert = $conn->prepare("
            INSERT INTO merchant_points (merchant_code, reg_date, settle_date, settle_status, note) 
            VALUES (?, CURDATE(), CURDATE(), 0, ?)
        ");
        $stmt_insert->bind_param('ss', $code, $note);
        $stmt_insert->execute();
        $stmt_insert->close();
    }
    
    $conn->close();

    echo json_encode(['success' => true, 'message' => "{$current_month}월 정산이 완료 처리되었습니다."]);

} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

