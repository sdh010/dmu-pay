// src/pages/MerchantMainPage.js
import React, { useState, useEffect, useCallback } from "react";
import MerchantHeader from "../components/MerchantHeader";
import "./MerchantMainPage.css";
import { useNavigate } from "react-router-dom";

function MerchantMainPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [merchantInfo, setMerchantInfo] = useState({ storeName: '로딩 중...', owner: '로딩 중...' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // 페이지 번호를 인자로 받아 해당 페이지의 거래 내역을 불러오는 함수
  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost/dmu-pay/backend/getMerchantPayments.php?page=${page}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        if (data.message === '권한이 없습니다.') {
          alert('로그인이 필요하거나 세션이 만료되었습니다.');
          navigate('/login');
        } else {
          // 거래 내역이 없을 경우 경고창 대신 화면에 메시지를 표시하기 위해 배열을 비웁니다.
          setPayments([]);
          setTotalPages(1); // 페이지 수를 1로 초기화
        }
      }
    } catch (error) {
      alert("거래 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://localhost/dmu-pay/backend/getMerchantProfile.php", { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMerchantInfo({ storeName: data.data.store_name, owner: data.data.owner_name });
        }
      });

    // 페이지가 로드될 때 첫 페이지의 데이터를 불러옵니다.
    fetchPayments(1);

    // 15초마다 현재 페이지 데이터를 자동으로 새로고침합니다.
    const interval = setInterval(() => fetchPayments(currentPage), 15000);
    return () => clearInterval(interval);
  }, [fetchPayments, currentPage]);

  // 환불 처리 함수
  const handleRefund = async (payment_id) => {
    if (!window.confirm("정말로 이 거래를 환불하시겠습니까? 학생에게 포인트가 즉시 환불됩니다.")) return;

    try {
      const res = await fetch("http://localhost/dmu-pay/backend/updatePaymentStatus.php", {
        method: "POST",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id }) // payment_id만 전송
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        // 환불 성공 후, 현재 페이지의 거래 목록을 다시 불러옵니다.
        fetchPayments(currentPage);
      } else {
        alert("오류: " + data.message);
      }
    } catch (error) {
      alert("요청 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  // 페이징 UI를 렌더링하는 함수
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => fetchPayments(i)} className={currentPage === i ? 'active' : ''}>
          {i}
        </button>
      );
    }
    return (
      <div className="pagination">
        <button onClick={() => fetchPayments(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
        {pages}
        <button onClick={() => fetchPayments(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
      </div>
    );
  };

  return (
    <div className="merchant-main-page">
      <MerchantHeader
        storeName={merchantInfo.storeName}
        owner={`${merchantInfo.owner}`}
        onLogout={handleLogout}
      />

      <table className="payment-table">
        <thead>
          <tr>
            <th>거래시간</th>
            <th>메뉴</th>
            <th>가격</th>
            <th>고객명</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="6">거래 내역을 불러오는 중...</td></tr>
          ) : payments.length === 0 ? (
            <tr><td colSpan="6">오늘의 거래 내역이 없습니다.</td></tr>
          ) : (
            payments.map((p) => (
              <tr key={p.payment_id}>
                <td>{new Date(p.txn_at).toLocaleString('ko-KR')}</td>
                <td>{p.menu_item}</td>
                <td>{p.cost.toLocaleString()} P</td>
                <td>{p.customer_name}</td>
                <td><span className="status-normal">정상</span></td>
                <td>
                  {/* is_refundable 값에 따라 '환불' 버튼을 보여주거나 '-'를 표시합니다. */}
                  {p.is_refundable ? (
                    <button className="reject-btn" onClick={() => handleRefund(p.payment_id)}>환불</button>
                  ) : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  );
}

export default MerchantMainPage;

