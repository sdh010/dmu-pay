// src/pages/StudentMyPage.js
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import "./StudentMyPage.css";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function StudentMyPage() {
  const [student, setStudent] = useState({});
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // PIN 설정/변경 모달 상태 및 입력값
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasPin, setHasPin] = useState(true);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        // 프로필 조회
        const profileRes = await fetch(
          "http://localhost/dmu-pay/backend/getStudentProfile.php",
          { credentials: "include" }
        );
        const profileJson = await profileRes.json();
        if (profileJson.success) {
          setStudent(profileJson.student);
          // pay_pin을 프론트로 전달한다고 가정
          setHasPin(!!profileJson.student.pay_pin);
        }

        // 월별 통계 조회
        const statsRes = await fetch(
          "http://localhost/dmu-pay/backend/getMonthlyStats.php",
          { credentials: "include" }
        );
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setBalance(statsJson.balance);
          setChartData(
            statsJson.data.map(d => ({
              month: d.month,
              지급: d.earn,
              사용: -d.useAmt
            }))
          );
        }
      } catch {
        alert("데이터 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

  // PIN 변경/설정 처리
  const handleChangePin = async () => {
    setPinError("");
    if (hasPin && !oldPin) {
      setPinError("기존 비밀번호를 입력해주세요.");
      return;
    }
    if (!newPin || !confirmPin) {
      setPinError("새 비밀번호 및 확인을 입력해주세요.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost/dmu-pay/backend/updatePayPin.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ old_pin: oldPin, new_pin: newPin })
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("결제 비밀번호가 성공적으로 설정되었습니다.");
        setShowPinModal(false);
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setHasPin(true);
      } else {
        setPinError(data.message);
      }
    } catch {
      setPinError("서버 통신 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="mypage-container">
          <div className="loading">로딩 중...</div>
        </div>
      </>
    );
  }

  // Y축 값 계산
  const values = chartData.flatMap(d => [d.지급, d.사용]);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const ticks = [minValue, 0, maxValue];

  return (
    <>
      <Header />
      <div className="mypage-container">
        <h2>마이페이지</h2>

        <div className="user-card">
          <div className="user-left">
            <div className="profile-img"></div>
            <div className="user-info">
              <div>동양미래대학교</div>
              <div className="user-name">{student.name}</div>
            </div>
          </div>
          <div className="user-right">
            <div>{student.status}</div>
            <div className="point">{balance.toLocaleString()}P</div>
          </div>
        </div>

        <div className="chart-section">
          <h4>월별 지급/사용</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis ticks={ticks} domain={[minValue, maxValue]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="지급" stroke="#055db4" strokeWidth={2} />
              <Line type="monotone" dataKey="사용" stroke="#ff4d4d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button className="change-pin-btn" onClick={() => setShowPinModal(true)}>
          결제 비밀번호 {hasPin ? "변경" : "설정"}
        </button>

        {showPinModal && (
          <div className="pin-modal-overlay">
            <div className="pin-modal">
              <h4>결제 비밀번호 {hasPin ? "변경" : "설정"}</h4>

              {hasPin && (
                <>
                  <label>기존 비밀번호</label>
                  <input
                    type="password"
                    value={oldPin}
                    onChange={e => setOldPin(e.target.value)}
                    maxLength={6}
                  />
                </>
              )}

              <label>{hasPin ? "새 비밀번호" : "비밀번호"} (6자리)</label>
              <input
                type="password"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                maxLength={6}
              />

              <label>확인</label>
              <input
                type="password"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                maxLength={6}
              />

              {pinError && <div className="pin-error">{pinError}</div>}

              <div className="pin-modal-actions">
                <button onClick={handleChangePin}>
                  {hasPin ? "변경하기" : "설정하기"}
                </button>
                <button onClick={() => setShowPinModal(false)}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default StudentMyPage;
