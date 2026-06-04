// src/components/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => navigate("/student")}>
        <img src="/logo.png" alt="logo" className="logo-img" />
        <span className="logo-text">DMU-Pay</span>
      </div>

      <nav className="header-nav">
        <button onClick={() => navigate("/point-history")}>포인트 내역</button>
        <button onClick={() => navigate("/ranking")}>랭킹</button>
        <button onClick={() => navigate("/merchants")}>가맹점 안내</button>
        <button onClick={() => navigate("/mypage")}>마이페이지</button>
        <button onClick={handleLogout}>로그아웃</button>
      </nav>
    </header>
  );
}

export default Header;
