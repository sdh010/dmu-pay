// src/components/MerchantHeader.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MerchantHeader.css";

function MerchantHeader({ storeName, owner, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="merchant-header">
      <div className="header-left" onClick={() => navigate("/merchant")}>
        <img src="/logo.png" alt="logo" className="logo-img" />
        <span className="logo-text">DMU-Pay</span>
      </div>

      <div className="header-center">
        {storeName} {owner}
      </div>

      <div className="header-right" ref={dropdownRef}>
        {/* 정산관리 버튼 + 드롭다운 */}
        <div className="dropdown">
          <button
            className="dropdown-toggle"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            정산관리 ▾
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/merchant/sales")}>
                매출현황
              </button>
              <button onClick={() => navigate("/merchant/calendar")}>
                매출달력
              </button>
            </div>
          )}
        </div>

        {/* 로그아웃 */}
        <button onClick={onLogout}>로그아웃</button>
      </div>
    </header>
  );
}

export default MerchantHeader;
