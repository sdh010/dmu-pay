<?php
require_once 'cors.php';

session_start();

// DB 연결
$dbHost = 'localhost';
$dbUser = 'dmupay01';
$dbPass = 'tkddbs0130!';
$dbName = 'dmu_pay'; //변경

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'message' => '데이터베이스 연결에 실패했습니다.'
    ]);
    exit;
}

$conn->begin_transaction();

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $username = trim($input['username']);
    $password = $input['password'];
    $name     = trim($input['name']);
    $user_type     = 'student';
    $student_no = trim($input['student_no']);
    $major = trim($input['major']);

    // 필수 항목 확인
    if (!$username || !$password || !$name || !$student_no || !$major) {
        throw new Exception('모든 항목을 입력해주세요.');
    }

    // 1. 사전 등록된 학생 정보 확인
    $stmt = $conn->prepare("SELECT * FROM dongyang WHERE name = ? AND student_no = ? AND major = ?"); //student_info로 되어있었음
    $stmt->bind_param("sss", $name, $student_no, $major);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows !== 1) {
        throw new Exception('등록되지 않은 학생 정보입니다. 이름, 학번, 전공을 다시 확인하세요.');
    }
    $stmt->close();

    // 2. 아이디 중복 확인
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        throw new Exception('이미 존재하는 아이디입니다.');
    }
    $stmt->close();

    // 3. 학번 중복 확인
    $stmt = $conn->prepare("SELECT user_id FROM students WHERE student_no = ?");
    $stmt->bind_param("s", $student_no);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        throw new Exception('이미 가입된 회원입니다.');
    }
    $stmt->close();

    // 4. users 테이블 저장
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);


    $user_type = 1; // 학생: 1
    $stmt = $conn->prepare("INSERT INTO users ( user_type, username, password ) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $user_type, $username, $hashedPassword);
    if (!$stmt->execute()) {
        throw new Exception('회원정보 등록 실패: ' . $stmt->error);
    }
    $user_id = $stmt->insert_id;
    $stmt->close();

    // 5. students 테이블 저장
    $stmt = $conn->prepare("INSERT INTO students (user_id, name, major, student_no, points, pay_pin) VALUES (?, ?, ?, ?, 0,'')");
    $stmt->bind_param("isss", $user_id, $name, $major, $student_no);
    if (!$stmt->execute()) {
        throw new Exception('학생 상세정보 등록 실패: ' . $stmt->error);
    }

    $stmt->close();
    $conn->commit();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $conn->close();
}
