// src/components/AdminHeader.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div
        className="admin-header-left"
        onClick={() => navigate("/admin")}
        style={{ cursor: "pointer" }}
      >
        <img src="/logo.png" alt="로고" className="admin-logo" />
        <span className="admin-title">DMU-Pay (관리자)</span>
      </div>

      <nav className="admin-header-nav">
        <button onClick={handleLogout} className="logout-button desktop-only">
          로그아웃
        </button>
      </nav>
    </header>
  );
}

export default AdminHeader;
