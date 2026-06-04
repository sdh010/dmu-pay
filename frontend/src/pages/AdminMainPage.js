// src/pages/AdminMainPage.js

import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import './AdminMainPage.css';

export default function AdminMainPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost/dmu-pay/backend/AdminMainStats.php', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data);
        } else {
          alert(`통계 API 오류: ${data.message}`);
        }
      })
      .catch(() => {
        alert('통계 로딩 실패');
      });
  }, []);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content main-dashboard">
          <h2>관리자 메인</h2>
          <div className="stats-cards">
            <div className="card">
              <p>전체 학생 수</p>
              <h3>{stats.studentsTotal.toLocaleString()}</h3>
            </div>
            <div className="card">
              <p>이번 달 포인트 지급량</p>
              <h3>{stats.ptsAdded.toLocaleString()}점</h3>
            </div>
            <div className="card">
              <p>이번 달 사용 포인트</p>
              <h3>{stats.ptsUsed.toLocaleString()}점</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
