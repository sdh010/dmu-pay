// src/pages/StudentPaymentPage.js
import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import "./StudentPaymentPage.css";
import { useNavigate } from "react-router-dom";

function StudentPaymentPage() {
    const navigate = useNavigate();
    const [merchantCode, setMerchantCode] = useState("");
    const [merchantName, setMerchantName] = useState("");
    const [point, setPoint] = useState("");
    const [password, setPassword] = useState("");
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState("");

    // --- 가게 이름 검색 기능용 상태 ---
    const [searchName, setSearchName] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    // --- --- ---

    useEffect(() => {
        // 보유 포인트 불러오기 (기존 로직)
        fetch("http://localhost/dmu-pay/backend/getMonthlyStats.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setBalance(data.balance);
            });
    }, []);

    // --- 이름 검색 API 호출 (디바운스 적용) ---
    useEffect(() => {
        // 검색어가 1글자 미만이면 검색 중단
        if (searchName.length < 1) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        // 500ms 지연 후 API 호출 (키보드 입력이 멈추면 검색)
        const timerId = setTimeout(async () => {
            try {
                const res = await fetch(
                    `http://localhost/dmu-pay/backend/searchMerchantsByName.php?term=${encodeURIComponent(searchName)}`,
                    { credentials: "include" }
                );
                const data = await res.json();
                if (data.success) {
                    setSearchResults(data.merchants);
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        // 사용자가 새 키를 입력하면 이전 타이머 취소
        return () => clearTimeout(timerId);
    }, [searchName]); // searchName이 변경될 때마다 이 효과 실행
    // --- --- ---

    // 가맹점 코드로 가게 정보 확인 (기존 로직)
    const lookupMerchant = useCallback(async () => {
        if (!merchantCode) return;
        setError("");
        try {
            const res = await fetch(
                `http://localhost/dmu-pay/backend/getMerchantsByCode.php?code=${encodeURIComponent(merchantCode)}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (data.success) {
                setMerchantName(data.merchant.store_name);
                // 코드로 가게를 찾으면, 이름 검색창도 동기화
                setSearchName(data.merchant.store_name);
            } else {
                setMerchantName("");
                setError(data.message);
            }
        } catch {
            setMerchantName("");
            setError("가맹점 조회 중 오류가 발생했습니다.");
        }
    }, [merchantCode]);

    // 결제 처리 (기존 로직)
    const handlePay = async () => {
        setError("");
        if (!merchantCode || !point || !password) {
            setError("모든 항목을 입력해주세요.");
            return;
        }
        try {
            const res = await fetch(
                "http://localhost/dmu-pay/backend/processPayment.php",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        merchant_code: merchantCode,
                        amount: Number(point),
                        password
                    })
                }
            );
            const data = await res.json();
            if (data.success) {
                alert("결제가 완료되었습니다.");
                navigate("/student");  // 메인페이지로 이동
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("서버 통신 중 오류가 발생했습니다.");
        }
    };

    // --- 검색 결과에서 가게 선택 시 ---
    const handleSelectMerchant = (merchant) => {
        setMerchantCode(merchant.merchant_code); // 코드 자동 입력
        setMerchantName(merchant.store_name);    // 가게 이름 표시
        setSearchName(merchant.store_name);      // 검색창 텍스트 설정
        setSearchResults([]);                    // 검색 결과 목록 숨기기
        setError("");
    };
    // --- --- ---

    // --- 입력창 핸들러 수정 ---
    const handleNameChange = (e) => {
        setSearchName(e.target.value);
        // 이름 검색창을 새로 입력하면, 선택됐던 코드/이름 초기화
        if (merchantCode) setMerchantCode("");
        if (merchantName) setMerchantName("");
    };

    const handleCodeChange = (e) => {
        const code = e.target.value.toUpperCase();
        setMerchantCode(code);
        // 코드 입력창을 비우면, 이름 검색창도 초기화
        if (code === "") {
            setSearchName("");
            setMerchantName("");
        }
    };
    // --- --- ---

    return (
        <>
            <Header />
            <div className="payment-container">
                <div className="back" onClick={() => navigate(-1)}>←</div>
                <h2>결제하기</h2>

                {/* --- 이름 검색 UI 추가 --- */}
                <label>가맹점 이름 검색</label>
                <input
                    type="text"
                    value={searchName}
                    onChange={handleNameChange}
                    placeholder="가게 이름으로 검색"
                />
                {isSearching && <div className="search-loading">검색 중...</div>}
                {searchResults.length > 0 && (
                    <ul className="search-results">
                        {searchResults.map(m => (
                            <li
                                key={m.merchant_code}
                                onClick={() => handleSelectMerchant(m)}
                            >
                                {m.store_name} ({m.merchant_code})
                            </li>
                        ))}
                    </ul>
                )}
                {/* --- --- --- */}

                <label>가맹점 코드</label>
                <input
                    type="text"
                    value={merchantCode}
                    onChange={handleCodeChange}
                    onBlur={lookupMerchant} // 코드를 직접 입력하고 포커스를 잃었을 때 검증
                    placeholder="가맹점 코드 입력"
                />
                <div className="merchant-name">{merchantName}</div>

                <label>결제 포인트 입력</label>
                <input
                    type="number"
                    value={point}
                    onChange={e => setPoint(e.target.value)}
                    placeholder="결제 포인트 입력"
                    min="1"
                />

                <label>간편 비밀번호 (6자리)</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="비밀번호 6자리 입력"
                    maxLength="6"
                />

                <div className="balance-display">
                    보유 포인트: {balance.toLocaleString()}P
                </div>

                {error && <div className="error">{error}</div>}

                <button type="button" className="pay-btn" onClick={handlePay}>
                    결제하기
                </button>
            </div>
        </>
    );
}

export default StudentPaymentPage;
