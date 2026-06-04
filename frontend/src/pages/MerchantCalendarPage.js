// src/pages/MerchantCalendarPage.js
import React, { useState, useEffect, useCallback } from "react";
import MerchantHeader from "../components/MerchantHeader";
import "./MerchantCalendarPage.css";
import { useNavigate } from "react-router-dom";

function MerchantCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [salesData, setSalesData] = useState({});
  const [totalSales, setTotalSales] = useState(0);
  const [merchantInfo, setMerchantInfo] = useState({ storeName: '로딩 중...', owner: '로딩 중...' });
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const fetchSalesData = useCallback(async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    try {
      const res = await fetch(`http://localhost/dmu-pay/backend/getMerchantSalesCalendar.php?year=${year}&month=${month}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSalesData(data.salesData);
        setTotalSales(data.totalSales);
      } else {
        if (data.message === '권한이 없습니다.') {
          alert('로그인이 필요하거나 세션이 만료되었습니다.');
          navigate('/login');
        } else {
          alert(data.message);
        }
      }
    } catch {
      alert('매출 데이터를 불러오는 중 오류 발생');
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
    fetchSalesData(currentDate);
  }, [currentDate, fetchSalesData]);

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + offset);
      return newDate;
    });
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendar = [];
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    let week = Array(startDay).fill(null);
    for (let date = 1; date <= totalDays; date++) {
      week.push(date);
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      calendar.push(week);
    }
    return calendar;
  };

  const calendar = generateCalendar();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const salesValues = Object.values(salesData).filter(v => v > 0);
  const maxSales = salesValues.length > 0 ? Math.max(...salesValues) : 0;
  const minSales = salesValues.length > 0 ? Math.min(...salesValues) : 0;

  return (
    <div className="merchant-calendar-page">
      <MerchantHeader
        storeName={merchantInfo.storeName}
        owner={`${merchantInfo.owner} 사장님`}
        onLogout={handleLogout}
      />
      <div className="calendar-header">
        <h2>매출달력</h2>
        <div className="calendar-controls">
          <strong>{year}년 {month + 1}월</strong>
          <button onClick={() => changeMonth(-1)}>◀</button>
          <button onClick={() => changeMonth(1)}>▶</button>
          <div className="total-sales">
            총 매출 금액: <strong>{totalSales.toLocaleString()}원</strong>
          </div>
        </div>
      </div>
      <div className="legend">
        <span className="low">● 최저 매출일</span>
        <span className="high">● 최고 매출일</span>
      </div>
      <table className="calendar-table">
        <thead>
          <tr>
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                const dateKey = date ? `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}` : null;
                const sales = dateKey ? salesData[dateKey] : undefined;
                const isMax = sales === maxSales && maxSales > 0;
                const isMin = sales === minSales && minSales > 0;

                return (
                  <td key={j} className="calendar-cell">
                    {date && (
                      <>
                        <div className="date-num">{date}</div>
                        {sales !== undefined && (
                          <div className={`sales-amount ${isMax ? "high" : ""} ${isMin ? "low" : ""}`}>
                            {sales.toLocaleString()}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MerchantCalendarPage;
