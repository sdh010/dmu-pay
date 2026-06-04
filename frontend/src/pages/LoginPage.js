// src/pages/LoginPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost/dmu-pay/backend/login.php",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        alert(data.message);
        return;
      }

      // 로그인 성공: user_type에 따라 라우팅
      // 0: 관리자, 1: 학생, 2: 가맹점
      switch (data.user_type) {
        case 0:
          navigate("/admin");
          break;
        case 1:
          navigate("/student");
          break;
        case 2:
          navigate("/merchant");
          break;
        default:
          alert("정의되지 않은 사용자 타입입니다.");
      }
    } catch (err) {
      console.error("로그인 에러:", err);
      alert("서버와 통신 중 오류가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="login-title">DMU-Pay</h1>
        <p className="subtitle">당신의 노력, 포인트로 돌려받자!</p>
        <p className="desc">
          DMU-Pay는 동양미래대 학생들의 노력을
          <br />
          포인트로 보상해주어 학생들의 자기개발을 독려하는 시스템입니다.
          <br />
          포인트는 제휴 가맹점에서 사용할 수 있습니다.
        </p>
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="form-title">로그인</h2>

          <div className="input-box">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <button
            className="login-btn signup-btn"
            type="button"
            onClick={() => navigate("/signup")}
            disabled={loading}
          >
            회원가입(학생)
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
