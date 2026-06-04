<?php
// backend/login.php
require_once 'cors.php'; // Handles all CORS settings.

ini_set('display_errors', 0);
error_reporting(0);
session_start();

try {
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        throw new Exception('아이디와 비밀번호를 입력해주세요.');
    }

    $stmt = $conn->prepare("SELECT user_id, user_type, password FROM users WHERE username = ?");
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($password, $user['password'])) {
        throw new Exception('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    $_SESSION['user'] = [
        'user_id'   => (int)$user['user_id'],
        'username'  => $username,
        'user_type' => (int)$user['user_type'],
    ];

    $user_type = (int)$user['user_type'];
    
    // 학생(1) 또는 가맹점(2)에 따라 추가 세션 정보 저장
    if ($user_type === 1) { // 학생
        $stmt = $conn->prepare("SELECT student_no FROM students WHERE user_id = ?");
        $stmt->bind_param('i', $user['user_id']);
        $stmt->execute();
        $student = $stmt->get_result()->fetch_assoc();
        if ($student) {
            $_SESSION['student_no'] = $student['student_no'];
        }
        $stmt->close();
    } elseif ($user_type === 2) { // 가맹점
        $stmt = $conn->prepare("SELECT m.merchant_code, m.store_name, u.username FROM merchants m JOIN users u ON m.user_id = u.user_id WHERE m.user_id = ?");
        $stmt->bind_param('i', $user['user_id']);
        $stmt->execute();
        $merchant = $stmt->get_result()->fetch_assoc();
        if ($merchant) {
            $_SESSION['merchant_code'] = $merchant['merchant_code'];
            $_SESSION['store_name'] = $merchant['store_name'];
            $_SESSION['owner_name'] = $merchant['username']; // 예금주를 사장님 이름으로 사용
        }
        $stmt->close();
    }

    $conn->close();
    echo json_encode(['success' => true, 'user_type' => $user_type]);

} catch (Exception $e) {
    if (isset($conn)) $conn->close();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

