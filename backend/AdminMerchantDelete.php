<?php
require_once 'cors.php';

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
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $merchantCode = trim($input['merchant_code'] ?? '');
    
    if (!$merchantCode) {
        throw new Exception('가맹점 코드가 필요합니다.');
    }

    // 트랜잭션 시작
    $conn->autocommit(false);

    // 1. 가맹점과 관련된 사용자 계정 찾기
    $stmt = $conn->prepare("SELECT user_id FROM merchants WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $result = $stmt->get_result();
    $merchant = $result->fetch_assoc();
    $stmt->close();

    if (!$merchant) {
        throw new Exception('가맹점을 찾을 수 없습니다.');
    }

    $userId = $merchant['user_id'];

    // 2. 관련 데이터 삭제 (외래키 제약 조건 고려)
    // 가맹점 결제 내역
    $stmt = $conn->prepare("DELETE FROM merchants_payments WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $stmt->close();

    // 가맹점 매출 내역
    $stmt = $conn->prepare("DELETE FROM merchant_sales WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $stmt->close();

    // 가맹점 정산 내역
    $stmt = $conn->prepare("DELETE FROM merchant_points WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $stmt->close();

    // 3. 가맹점 정보 삭제
    $stmt = $conn->prepare("DELETE FROM merchants WHERE merchant_code = ?");
    $stmt->bind_param('s', $merchantCode);
    $stmt->execute();
    $stmt->close();

    // 4. 사용자 계정 삭제
    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();

    // 트랜잭션 커밋
    $conn->commit();
    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => '가맹점이 성공적으로 삭제되었습니다.'
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
        $conn->close();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
