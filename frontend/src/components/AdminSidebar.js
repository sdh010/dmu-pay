import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css"; //  기존 sidebar 스타일 포함된 CSS 재사용

function AdminSidebar({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => navigate("/admin/student")}>학생관리</li>
        <li onClick={() => navigate("/admin/merchant")}>가맹점관리</li>
        <li className="mobile-only" onClick={handleLogout}>로그아웃</li>
      </ul>
    </div>
  );
}

export default AdminSidebar;
//..