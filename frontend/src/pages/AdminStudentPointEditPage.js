// src/pages/AdminStudentPointEditPage.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminMainPage.css";
import "./AdminStudentPointEditPage.css";

function AdminStudentPointEditPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const studentNo = state?.studentNo;
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 지급 섹션 상태
  const [grantType, setGrantType] = useState("");
  const [grantFiles, setGrantFiles] = useState([null, null]);
  const [grantDesc, setGrantDesc] = useState(["", ""]);
  const [grantAmount, setGrantAmount] = useState("");

  // 차감 섹션 상태
  const [deductType, setDeductType] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [deductReason, setDeductReason] = useState("");

  useEffect(() => {
    if (!studentNo) {
      alert("학생 정보가 없습니다.");
      navigate("/admin/student");
      return;
    }
    fetch(
      `http://localhost/dmu-pay/backend/AdminStudentPointEditPage.php?student_no=${studentNo}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInfo(data.studentInfo);
        } else {
          alert(data.message);
          navigate("/admin/student");
        }
      })
      .catch(() => {
        alert("학생 정보를 불러오는데 실패했습니다.");
        navigate("/admin/student");
      })
      .finally(() => setLoading(false));
  }, [studentNo, navigate]);

  const handleFileChange = (idx, files) => {
    const arr = [...grantFiles];
    arr[idx] = files[0] || null;
    setGrantFiles(arr);
  };

  const handleSubmit = () => {
    if (!info) return;

    const form = new FormData();
    form.append("studentNo", studentNo);

    // 지급/차감 구분
    const action = grantType ? "grant" : deductType ? "deduct" : "";
    if (!action) {
      alert("지급 또는 차감 중 하나를 입력해주세요.");
      return;
    }
    form.append("action", action);

    if (action === "grant") {
      if (!grantType || !grantAmount) {
        alert("지급 종류와 포인트를 입력해주세요.");
        return;
      }
      form.append("type", grantType);
      form.append("amount", grantAmount);
      form.append("reason", grantType);    // 지급 종류를 사유로 사용
      grantFiles.forEach((file, i) => {
        if (file) {
          form.append(`file${i + 1}`, file);
          form.append(`desc${i + 1}`, grantDesc[i] || "");
        }
      });
    } else {
      if (!deductType || !deductAmount) {
        alert("차감 종류와 포인트를 입력해주세요.");
        return;
      }
      form.append("type", deductType);
      form.append("amount", deductAmount);
      form.append("reason", deductType);   // 차감 종류를 사유로 사용
    }

    fetch("http://localhost/dmu-pay/backend/AdminStudentPointEditPage.php", {
      method: "POST",
      credentials: "include",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("처리 완료");
          navigate("/admin/student");
        } else {
          alert(data.message);
        }
      })
      .catch(() => {
        alert("요청 중 오류가 발생했습니다.");
      });
  };

  if (loading || !info) {
    return (
      <div className="admin-page">
        <AdminHeader />
        <div className="main-body">
          <AdminSidebar />
          <div className="main-content">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="main-body">
        <AdminSidebar />
        <div className="main-content">
          <h2>학생 포인트 지급/차감</h2>

          {/* 학생 정보 */}
          <section className="student-info">
            <h3>학생 정보</h3>
            <table>
              <tbody>
                <tr>
                  <th>이름</th>
                  <td>{info.name}</td>
                  <th>학번</th>
                  <td>{info.studentNo}</td>
                </tr>
                <tr>
                  <th>전공</th>
                  <td>{info.major}</td>
                  <th>현재 포인트</th>
                  <td>{info.points.toLocaleString()}P</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 포인트 지급/차감 폼 (form 태그 제거) */}
          <div className="point-edit-form">
            {/* 지급 섹션 */}
            <section className="point-section">
              <h3>포인트 지급</h3>
              <table>
                <tbody>
                  <tr>
                    <th>지급 종류</th>
                    <td colSpan={3}>
                      <input
                        type="text"
                        placeholder="예: 자격증, 대외활동 등"
                        value={grantType}
                        onChange={(e) => {
                          setGrantType(e.target.value);
                          setDeductType("");
                        }}
                      />
                    </td>
                  </tr>
                  {[0, 1].map((i) => (
                    <tr key={i}>
                      <th>파일등록 {i + 1}</th>
                      <td colSpan={3}>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(i, e.target.files)}
                        />
                        <input
                          type="text"
                          placeholder="파일 설명 (예: 자격증.png)"
                          value={grantDesc[i]}
                          onChange={(e) => {
                            const d = [...grantDesc];
                            d[i] = e.target.value;
                            setGrantDesc(d);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th>지급 포인트</th>
                    <td colSpan={3}>
                      <input
                        type="text"
                        placeholder="예: 10000"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 차감 섹션 */}
            <section className="point-section">
              <h3>포인트 차감</h3>
              <table>
                <tbody>
                  <tr>
                    <th>차감 종류</th>
                    <td>
                      <input
                        type="text"
                        placeholder="예: 오지급"
                        value={deductType}
                        onChange={(e) => {
                          setDeductType(e.target.value);
                          setGrantType("");
                        }}
                      />
                    </td>
                    <th>차감 포인트</th>
                    <td>
                      <input
                        type="text"
                        placeholder="예: 5000"
                        value={deductAmount}
                        onChange={(e) => setDeductAmount(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <button type="button" className="action-button" onClick={handleSubmit}>
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStudentPointEditPage;
