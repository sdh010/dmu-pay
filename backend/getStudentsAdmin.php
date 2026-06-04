<?php
require_once 'cors.php';

session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['user_type'] !== 0) {
    http_response_code(403);
    echo json_encode(['success'=>false, 'message'=>'권한이 없습니다.']);
    exit;
}

try {
    // 3) DB 연결
    $conn = new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
    if ($conn->connect_error) {
        throw new Exception('DB 연결 실패');
    }

    // 4) 필터 파라미터
    $nameFilter = $_GET['name'] ?? '';
    $noFilter   = $_GET['student_no'] ?? '';

    // 5) 페이징 파라미터
    $page   = max(1, intval($_GET['page'] ?? 1));
    $limit  = 10;
    $offset = ($page - 1) * $limit;

    // 6) WHERE 절 준비
    $conds  = [];
    $params = [];
    $types  = '';

    if ($nameFilter !== '') {
        $conds[]    = "name LIKE ?";
        $params[]   = "%{$nameFilter}%";
        $types     .= 's';
    }
    if ($noFilter !== '') {
        $conds[]    = "student_no LIKE ?";
        $params[]   = "%{$noFilter}%";
        $types     .= 's';
    }
    $where = $conds ? 'WHERE '.implode(' AND ', $conds) : '';

    // 7) 전체 레코드 수 조회
    $countSql = "SELECT COUNT(*) AS cnt FROM students $where";
    $stmtC    = $conn->prepare($countSql);
    if ($params) {
        // bind for count
        $stmtC->bind_param($types, ...$params);
    }
    $stmtC->execute();
    $total = (int)$stmtC->get_result()->fetch_assoc()['cnt'];
    $stmtC->close();

    // 8) 실제 데이터 조회 SQL
    $sql = "SELECT user_id, name, student_no, points
            FROM students
            $where
            ORDER BY name
            LIMIT ?
            OFFSET ?";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('SQL 준비 오류: ' . $conn->error);
    }

    // bind_param용 타입 문자열과 값 배열
    $bindTypes  = $types . 'ii';            // 예: 'sissii' 등
    $bindValues = array_merge($params, [$limit, $offset]);

    // call_user_func_array에 넘길 인수 배열 생성 (참조 필요)
    $bindParams = [];
    $bindParams[] = & $bindTypes;
    foreach ($bindValues as $key => $val) {
        $bindParams[] = & $bindValues[$key];
    }

    // 동적 바인딩
    call_user_func_array([$stmt, 'bind_param'], $bindParams);

    // 실행 및 결과 가져오기
    $stmt->execute();
    $res = $stmt->get_result();

    $students = [];
    while ($row = $res->fetch_assoc()) {
        $students[] = [
            'id'            => (int)$row['user_id'],
            'name'          => $row['name'],
            'studentNumber' => $row['student_no'],
            'point'         => (int)$row['points']
        ];
    }

    $stmt->close();
    $conn->close();

    // 9) JSON 응답
    echo json_encode([
        'success'  => true,
        'students' => $students,
        'total'    => $total,
        'page'     => $page,
        'limit'    => $limit
    ]);

} catch (Exception $e) {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
