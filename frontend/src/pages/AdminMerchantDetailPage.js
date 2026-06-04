// src/pages/AdminMerchantDetailPage.js 수정

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminMainPage.css";
import "./AdminMerchantDetailPage.css";

function AdminMerchantDetailPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [sales, setSales] = useState([]);
  const [points, setPoints] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost/dmu-pay/backend/AdminMerchantDetail.php?code=${code}`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInfo(data.info);
          setSales(data.sales);
          setPoints(data.points);
          setMonthlyTotal(data.monthlyTotal || 0);
          setCurrentMonth(data.currentMonth || '');
        } else {
          alert(data.message);
          navigate("/admin/merchant");
        }
      })
      .catch(() => {
        alert("로딩 중 오류 발생");
        navigate("/admin/merchant");
      })
      .finally(() => setLoading(false));
  }, [code, navigate]);

  const handleSettle = () => {
    // --- fetch 요청 방식 수정 ---
    fetch(`http://localhost/dmu-pay/backend/AdminMerchantSettle.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: code }) // URL에서 Body로 'code' 전달
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(data.message); // 성공 메시지 표시
          window.location.reload();
        }
        else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert('정산 처리 중 오류가 발생했습니다.');
      });
  };

  // 월 표시 포맷팅 (예: 2025-09 -> 2025년 9월)
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  if (loading || !info) {
    return (
      <div className="admin-page">
        <AdminHeader />
        <div className="admin-container">
          <AdminSidebar />
          <div className="admin-content">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content">
          <h2>가맹점 정보/정산</h2>

          <div className="summary-section">
            <div className="summary-box">
              <p>상호명</p>
              <h3>{info.store_name}</h3>
            </div>
            <div className="summary-box">
              <p>가맹점코드</p>
              <h3>{info.merchant_code}</h3>
            </div>
            <div className="summary-box">
              <p>전화번호</p>
              <h3>{info.phone}</h3>
            </div>
            <div className="summary-box monthly-sales">
              <p>{formatMonth(currentMonth)} 총매출</p>
              <h3>{monthlyTotal.toLocaleString()}원</h3>
            </div>
            <div className="summary-button-wrap">
              <button className="settle-button" onClick={handleSettle}>
                정산
              </button>
            </div>
          </div>

          <div className="history-table-wrap">
            <h3>■ 일별 매출 내역</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>매출액</th>
                  <th>주문수</th>
                  <th>취소수</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((r, i) => (
                  <tr key={i}>
                    <td>{r.sales_date}</td>
                    <td>{r.daily_sales.toLocaleString()}</td>
                    <td>{r.order_cnt}</td>
                    <td>{r.cancel_cnt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="history-table-wrap">
            <h3>■ 정산 내역</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>접수일</th>
                  <th>상태</th>
                  <th>정산일</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={i}>
                    <td>{p.reg_date}</td>
                    <td
                      className={
                        p.settle_status === "정산완료"
                          ? "text-success"
                          : p.settle_status === "정산오류"
                            ? "text-error"
                            : ""
                      }
                    >
                      {p.settle_status}
                    </td>
                    <td>{p.settle_date}</td>
                    <td>{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMerchantDetailPage;
