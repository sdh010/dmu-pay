// src/pages/AdminMerchantPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminMainPage.css";
import "./AdminMerchantPage.css";

function AdminMerchantPage() {
  const navigate = useNavigate();


  const [searchName, setSearchName] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const fetchMerchants = async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        search_name: searchTerm
      });

      const response = await fetch(
        `http://localhost/dmu-pay/backend/AdminMerchantPage.php?${params}`,
        { credentials: 'include' }
      );

      const data = await response.json();

      if (data.success) {
        setMerchants(data.merchants);
        setTotalPages(data.totalPages);
        setPage(pageNum);
      } else {
        alert(data.message || '가맹점 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants(1, "");
  }, []);

  const handleSearch = () => {
    fetchMerchants(1, searchName);
  };


  const getStatusClass = (status) => {
    switch (status) {
      case "정산완료":
        return "status-complete";
      case "정산대기":
        return "status-pending";
      case "정산오류":
        return "status-error";
      default:
        return "";
    }
  };


  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    window.location.href = "https://dmu-pay.netlify.app/";
  };


  const goToPage = (pageNum) => fetchMerchants(pageNum, searchName);
  const goFirst = () => goToPage(1);
  const goPrev = () => goToPage(Math.max(1, page - 1));
  const goNext = () => goToPage(Math.min(totalPages, page + 1));
  const goLast = () => goToPage(totalPages);

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader handleLogout={handleLogout} />
        <div className="main-body">
          <AdminSidebar handleLogout={handleLogout} />
          <div className="main-content">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminHeader handleLogout={handleLogout} />

      <div className="main-body">
        <AdminSidebar handleLogout={handleLogout} />

        <div className="main-content">
          <div className="card" style={{ marginBottom: "30px" }}>
            <h3>검색</h3>
            <div
              className="merchant-search-bar"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <input
                type="text"
                placeholder="상호명을 입력해주세요"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{ padding: "10px", width: "300px" }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button style={{ padding: "10px 20px" }} onClick={handleSearch}>
                검색
              </button>
              <button
                style={{ marginLeft: "auto", padding: "10px 20px" }}
                onClick={() => navigate("/admin/merchant/register")}
              >
                가맹점 등록
              </button>
            </div>
          </div>

          <div className="card admin-merchant-table-wrapper">
            <table className="admin-merchant-table">
              <thead>
                <tr>
                  <th>상호명</th>
                  <th>가맹점코드</th>
                  <th>전화번호</th>
                  <th>등록일</th>
                  <th>정산상태</th>
                  <th>가맹점 정보/정산</th>
                  <th>가맹점정보수정</th>
                </tr>
              </thead>
              <tbody>
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      등록된 가맹점이 없습니다.
                    </td>
                  </tr>
                ) : (
                  merchants.map((merchant, index) => (
                    <tr key={merchant.merchant_code}>
                      <td>{merchant.store_name}</td>
                      <td>{merchant.merchant_code}</td>
                      <td>{merchant.phone}</td>
                      <td>{merchant.reg_date}</td>
                      <td className={getStatusClass(merchant.settle_status)}>
                        {merchant.settle_status}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/admin/merchant/detail/${merchant.merchant_code}`)
                          }
                        >
                          보기
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            navigate(`/admin/merchant/edit/${merchant.merchant_code}`)
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


            <div className="pagination" style={{ marginTop: "20px" }}>
              <button onClick={goFirst} disabled={page === 1}>
                &laquo;
              </button>
              <button onClick={goPrev} disabled={page === 1}>
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={page === i + 1 ? "active" : ""}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={goNext} disabled={page === totalPages}>
                &gt;
              </button>
              <button onClick={goLast} disabled={page === totalPages}>
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMerchantPage;
