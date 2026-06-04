// src/pages/AdminStudentPointPage.js

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminMainPage.css";
import "./AdminStudentPointPage.css";

function AdminStudentPointPage() {
  const { student_no } = useParams();
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("전체");
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost/dmu-pay/backend/AdminStudentPointPage.php`
        + `?student_no=${student_no}`
        + `&page=${page}`
        + `&type=${filter}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setStudentInfo(data.studentInfo);
        setHistory(data.history);
        setTotalPages(data.totalPages);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("포인트 내역 조회 오류:", err);
      alert("포인트 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_no, page, filter]);

  // 필터링 후 최신순 정렬
  const filteredData = useMemo(() => {
    const arr =
      filter === "전체"
        ? [...history]
        : history.filter((item) => item.type === filter);
    return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history, filter]);

  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader handleLogout={handleLogout} />
        <div className="admin-container">
          <AdminSidebar />
          <div className="admin-content">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader handleLogout={handleLogout} />
      <div className="admin-container">
        <AdminSidebar />

        <div className="admin-content">
          <h2>학생 포인트 내역</h2>

          {studentInfo && (
            <div className="student-info">
              <p><strong>이름:</strong> {studentInfo.name}</p>
              <p><strong>학번:</strong> {studentInfo.studentNo}</p>
              <p><strong>현재 포인트:</strong> {studentInfo.points.toLocaleString()}P</p>
            </div>
          )}

          <div className="filter-bar">
            {["전체", "지급", "사용", "차감"].map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <table className="point-history-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>유형</th>
                <th>포인트</th>
                <th>사유</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td className={item.point > 0 ? "text-plus" : "text-minus"}>
                      {item.point > 0
                        ? `+${item.point.toLocaleString()}`
                        : item.point.toLocaleString()}
                    </td>
                    <td>{item.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="pagination">
            <button onClick={goFirst} disabled={page === 1}>«</button>
            <button onClick={goPrev} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={goNext} disabled={page === totalPages}>›</button>
            <button onClick={goLast} disabled={page === totalPages}>»</button>
          </div>

          <div className="pagination">
            <button onClick={() => navigate("/admin/student")}>학생 목록</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStudentPointPage;
