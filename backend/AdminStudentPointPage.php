<?php
require_once 'cors.php';
// 3) 세션 검사
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => '권한이 없습니다.']);
    exit;
}

try {
    // 4) DB 연결
    $conn = new mysqli('localhost', 'dmupay01', 'tkddbs0130!', 'dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패: ' . $conn->connect_error);
    }

    // 5) 필수 파라미터
    $studentNo = $_GET['student_no'] ?? '';
    if ($studentNo === '') {
        throw new Exception('학번(student_no) 파라미터가 없습니다.');
    }

    // 6) 필터 파라미터: 전체, 지급, 차감, 사용
    $typeParam = $_GET['type'] ?? '전체';
    // point_type 매핑: 지급→1, 차감→0, 사용→2
    $typeMap = ['지급' => 1, '차감' => 0, '사용' => 2];
    $hasFilter = isset($typeMap[$typeParam]);
    $filterType = $hasFilter ? $typeMap[$typeParam] : null;

    // 7) 페이징 파라미터
    $page  = max(1, intval($_GET['page'] ?? 1));
    $limit = 10;
    $offset = ($page - 1) * $limit;

    // 8) 학생 기본 정보 조회
    $stmtInfo = $conn->prepare(
        "SELECT name, student_no, major, points
           FROM students
          WHERE student_no = ?"
    );
    $stmtInfo->bind_param('s', $studentNo);
    $stmtInfo->execute();
    $infoRow = $stmtInfo->get_result()->fetch_assoc();
    $stmtInfo->close();
    if (!$infoRow) {
        throw new Exception('해당 학번의 학생을 찾을 수 없습니다.');
    }
    $studentInfo = [
        'name'      => $infoRow['name'],
        'studentNo' => $infoRow['student_no'],
        'major'     => $infoRow['major'],
        'points'    => (int)$infoRow['points']
    ];

    // 9) 전체 내역 수 조회 (필터 적용)
    if ($hasFilter) {
        $stmtCount = $conn->prepare(
            "SELECT COUNT(*) AS cnt
               FROM student_points
              WHERE student_no = ? AND point_type = ?"
        );
        $stmtCount->bind_param('si', $studentNo, $filterType);
    } else {
        $stmtCount = $conn->prepare(
            "SELECT COUNT(*) AS cnt
               FROM student_points
              WHERE student_no = ?"
        );
        $stmtCount->bind_param('s', $studentNo);
    }
    $stmtCount->execute();
    $total = (int)$stmtCount->get_result()->fetch_assoc()['cnt'];
    $stmtCount->close();

    $totalPages = (int)ceil($total / $limit);

    // 10) 내역 조회 (필터 + 정렬 + 페이징)
    if ($hasFilter) {
        $stmtHist = $conn->prepare(
            "SELECT trx_date, point_type, point_amount, reason
               FROM student_points
              WHERE student_no = ? AND point_type = ?
              ORDER BY trx_date DESC
              LIMIT ? OFFSET ?"
        );
        $stmtHist->bind_param('siii', $studentNo, $filterType, $limit, $offset);
    } else {
        $stmtHist = $conn->prepare(
            "SELECT trx_date, point_type, point_amount, reason
               FROM student_points
              WHERE student_no = ?
              ORDER BY trx_date DESC
              LIMIT ? OFFSET ?"
        );
        $stmtHist->bind_param('sii', $studentNo, $limit, $offset);
    }
    $stmtHist->execute();
    $res = $stmtHist->get_result();

    $history = [];
    $reverseMap = [0 => '차감', 1 => '지급', 2 => '사용'];
    while ($row = $res->fetch_assoc()) {
        $amt = (int)$row['point_amount'];
        if ((int)$row['point_type'] !== 1) {
            $amt = -abs($amt);
        }
        $history[] = [
            'date'   => $row['trx_date'],
            'type'   => $reverseMap[(int)$row['point_type']] ?? '기타',
            'point'  => $amt,
            'reason' => $row['reason']
        ];
    }
    $stmtHist->close();
    $conn->close();

    // 11) JSON 응답
    echo json_encode([
        'success'     => true,
        'studentInfo' => $studentInfo,
        'history'     => $history,
        'totalPages'  => $totalPages,
        'currentPage' => $page
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}
?>
