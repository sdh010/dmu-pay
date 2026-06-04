// src/pages/AdminStudentPage.js

import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminMainPage.css";
import { useNavigate } from "react-router-dom";

function AdminStudentPage() {
  const [searchName, setSearchName] = useState("");
  const [searchStudentNumber, setSearchStudentNumber] = useState("");
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const fetchStudents = async (p = 1) => {
    const params = new URLSearchParams();
    if (searchName) params.append("name", searchName);
    if (searchStudentNumber) params.append("student_no", searchStudentNumber);
    params.append("page", p);

    const res = await fetch(
      `http://localhost/dmu-pay/backend/getStudentsAdmin.php?${params.toString()}`,
      { credentials: "include" }
    );
    const data = await res.json();
    if (data.success) {
      setStudents(data.students);
      setTotal(data.total);
      setPage(data.page);
    } else {
      alert(data.message);
    }
  };

  useEffect(() => { fetchStudents(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const totalPages = Math.ceil(total / limit);

  const goPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    fetchStudents(p);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  return (
    <div className="admin-page">
      <AdminHeader handleLogout={handleLogout} />
      <div className="main-body">
        <AdminSidebar handleLogout={handleLogout} />
        <div className="main-content">

          <div className="card search-box" style={{ marginBottom: "30px" }}>
            <h3>학생 검색</h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <input
                type="text"
                placeholder="학번을 입력해주세요"
                value={searchStudentNumber}
                onChange={(e) => setSearchStudentNumber(e.target.value)}
              />
              <button type="submit">검색</button>
            </form>
          </div>

          <div className="card student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>이름</th>
                  <th>학번</th>
                  <th>포인트</th>
                  <th>포인트 내역</th>
                  <th>포인트 지급/차감</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      조회 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.studentNumber}</td>
                      <td>{s.point.toLocaleString()}P</td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/admin/student/point/${s.studentNumber}`)  // s.studentNumber를 student_no로 넘긴다
                          }
                        >
                          보기
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            navigate("/admin/student/point-edit", {
                              state: { userId: s.id, studentNo: s.studentNumber },
                            })
                          }
                        >
                          수정
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className="pagination" style={{ marginTop: "20px" }}>
              <button onClick={() => goPage(1)} disabled={page === 1}>
                &laquo; 맨앞
              </button>
              <button onClick={() => goPage(page - 1)} disabled={page === 1}>
                &lt; 이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
                Math.abs(p - page) <= 2 ? (
                  <button
                    key={p}
                    className={p === page ? "active" : ""}
                    onClick={() => goPage(p)}
                  >
                    {p}
                  </button>
                ) : null
              )}

              <button
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
              >
                다음 &gt;
              </button>
              <button
                onClick={() => goPage(totalPages)}
                disabled={page === totalPages}
              >
                맨뒤 &raquo;
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminStudentPage;
