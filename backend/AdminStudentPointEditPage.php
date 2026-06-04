<?php
require_once 'cors.php';

// 세션 검사
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

// 디버그 로그 함수
function dbg($msg) {
    error_log("[DBG] " . $msg);
}

try {
    // DB 연결
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패: ' . $conn->connect_error);
    }

    // GET 요청: 학생 기본 정보 조회
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (empty($_GET['student_no'])) {
            throw new Exception('학번(student_no) 파라미터가 없습니다.');
        }
        $studentNo = $_GET['student_no'];

        $stmt = $conn->prepare(
            "SELECT name, student_no, major, points
               FROM students
              WHERE student_no = ?"
        );
        $stmt->bind_param('s', $studentNo);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            throw new Exception('해당 학번의 학생을 찾을 수 없습니다.');
        }

        echo json_encode([
            'success'     => true,
            'studentInfo' => [
                'name'      => $row['name'],
                'studentNo' => $row['student_no'],
                'major'     => $row['major'],
                'points'    => (int)$row['points'],
            ],
        ]);
        exit;
    }

    // POST 요청: 포인트 지급/차감 처리
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action    = $_POST['action']    ?? '';
        $studentNo = $_POST['studentNo'] ?? '';
        $typeLabel = $_POST['type']      ?? '';
        $amount    = intval($_POST['amount'] ?? 0);
        $reason    = trim($_POST['reason'] ?? '');

        dbg("POST 호출: action={$action}, studentNo={$studentNo}, type={$typeLabel}, amount={$amount}");

        if (
            !in_array($action, ['grant','deduct'], true) ||
            empty($studentNo) ||
            empty($typeLabel) ||
            $amount <= 0
        ) {
            throw new Exception('잘못된 파라미터입니다.');
        }

        // 지급 → 1, 차감 → 0
        $pointType = $action === 'grant' ? 1 : 0;
        $delta     = $pointType === 1 ? $amount : -$amount;

        // 파일 업로드 (선택적)
        for ($i = 1; $i <= 2; $i++) {
            if (!empty($_FILES["file{$i}"]["tmp_name"])) {
                $destDir = __DIR__ . '/uploads/';
                if (!is_dir($destDir)) {
                    mkdir($destDir, 0777, true);
                }
                $origName = basename($_FILES["file{$i}"]["name"]);
                $newName  = "{$studentNo}_{$i}_{$origName}";
                move_uploaded_file($_FILES["file{$i}"]["tmp_name"], $destDir . $newName);
                dbg("파일 {$i} 업로드: {$newName}");
            }
        }

        // student_points 내역 기록
        dbg("INSERT 시작");
        $stmt1 = $conn->prepare(
            "INSERT INTO student_points
                (student_no, trx_date, point_type, point_amount, reason)
             VALUES (?, NOW(), ?, ?, ?)"
        );
        $stmt1->bind_param('siis', $studentNo, $pointType, $amount, $reason);
        if (!$stmt1->execute()) {
            dbg("INSERT 실패: " . $stmt1->error);
            throw new Exception('내역 저장 실패: ' . $stmt1->error);
        }
        dbg("INSERT 성공, ID=" . $conn->insert_id);
        $stmt1->close();

        // students.points 업데이트
        dbg("UPDATE 시작, delta={$delta}");
        $stmt2 = $conn->prepare(
            "UPDATE students
                SET points = points + ?
              WHERE student_no = ?"
        );
        $stmt2->bind_param('is', $delta, $studentNo);
        if (!$stmt2->execute()) {
            dbg("UPDATE 실패: " . $stmt2->error);
            throw new Exception('학생 포인트 업데이트 실패: ' . $stmt2->error);
        }
        dbg("UPDATE 성공, 영향행 수=" . $stmt2->affected_rows);
        $stmt2->close();

        dbg("POST 처리 완료");
        echo json_encode(['success' => true, 'message' => '처리 완료']);
        exit;
    }

    throw new Exception('허용되지 않는 요청 방식입니다.');
} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    error_log("[ERR] " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}
?>
