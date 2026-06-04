<?php
require_once 'cors.php';
try{
    $conn=new mysqli('localhost','dmupay01','tkddbs0130!','dmu_pay');
    if($conn->connect_error) throw new Exception('DB 연결 실패');
    
    $code=trim($_GET['code']??'');
    if(!$code) throw new Exception('가맹점 코드가 없습니다.');

    // 가맹점 기본 정보
    $stmt=$conn->prepare("
        SELECT store_name, merchant_code, phone, address,
               account_holder, bank_name, account_number, business_no, category
          FROM merchants
         WHERE merchant_code=?
    ");
    $stmt->bind_param('s',$code);
    $stmt->execute();
    $info=$stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if(!$info) throw new Exception('가맹점 정보를 찾을 수 없습니다.');

    // 일별 매출 내역
    $stmt=$conn->prepare("
        SELECT DATE_FORMAT(sales_date,'%Y.%m.%d') AS sales_date,
               daily_sales, order_cnt, cancel_cnt
          FROM merchant_sales
         WHERE merchant_code=?
         ORDER BY sales_date DESC
    ");
    $stmt->bind_param('s',$code);
    $stmt->execute();
    $sales=$stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // 정산 내역
    $stmt=$conn->prepare("
        SELECT DATE_FORMAT(reg_date,'%Y.%m.%d') AS reg_date,
               settle_status, note,
               DATE_FORMAT(settle_date,'%Y.%m.%d') AS settle_date
          FROM merchant_points
         WHERE merchant_code=?
         ORDER BY reg_date DESC
    ");
    $stmt->bind_param('s',$code);
    $stmt->execute();
    $raw=$stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $points=[];
    foreach($raw as $r){
        $points[]= [
            'reg_date'=>$r['reg_date'],
            'settle_status'=> $r['settle_status'] == 0 ? '정산완료'
                             : ($r['settle_status'] == 1 ? '정산대기' : '정산오류'),
            'settle_date'=>$r['settle_date'],
            'note'=>$r['note']
        ];
    }
    $stmt->close();

    // 이번 달 총 매출 계산 (is_cancelled = 0인 것만)
    $currentMonth = date('Y-m');
    $stmt = $conn->prepare("
        SELECT IFNULL(SUM(cost), 0) AS monthly_total
        FROM merchants_payments 
        WHERE merchant_code = ? 
          AND DATE_FORMAT(txn_at, '%Y-%m') = ?
          AND is_cancelled = 0
    ");
    $stmt->bind_param('ss', $code, $currentMonth);
    $stmt->execute();
    $monthlyTotal = (int)$stmt->get_result()->fetch_assoc()['monthly_total'];
    $stmt->close();

    $conn->close();
    echo json_encode([
        'success'=>true,
        'info'=>$info,
        'sales'=>$sales,
        'points'=>$points,
        'monthlyTotal'=>$monthlyTotal,
        'currentMonth'=>$currentMonth
    ]);
    
}catch(Exception $e){
    if(isset($conn)&&$conn instanceof mysqli) $conn->close();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
