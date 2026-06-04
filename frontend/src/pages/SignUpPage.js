import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // 로그인 스타일 재사용

function SignUpPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [major, setMajor] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !studentNumber || !major || !username || !password || !confirmPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 10 || password.length > 16) {
      alert("비밀번호는 10자 이상 16자 이하로 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost/dmu-pay/backend/signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          student_no: studentNumber,
          major,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("회원가입 성공!");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("서버 오류 또는 네트워크 문제: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1 className="title">DMU-Pay</h1>
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
        <form className="login-form" onSubmit={handleSignUp}>
          <h2 className="form-title">회원가입</h2>

          <div className="input-box">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-box">
            <input
              type="text"
              placeholder="학번"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
          </div>

          <div className="input-box">
            <select value={major} onChange={(e) => setMajor(e.target.value)} required>
              <option value="" disabled hidden>전공 선택</option>
              <option value="컴퓨터정보공학과">컴퓨터정보공학과</option>
              <option value="기계공학과">기계공학과</option>
              <option value="전기전자공학과">전기전자공학과</option>
              <option value="정보통신과">정보통신과</option>
              <option value="건축과">건축과</option>
              <option value="경영학과">경영학과</option>
            </select>
          </div>

          <div className="input-box">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="비밀번호 (10~16자)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={10}
              maxLength={16}
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={10}
              maxLength={16}
            />
          </div>

          <button className="login-btn" type="submit">회원가입</button>

          <button
            className="login-btn signup-btn"
            type="button"
            onClick={() => navigate("/")}
          >
            로그인으로 돌아가기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
