import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MerchantHeader from "../components/MerchantHeader";
import "./MerchantSalesPage.css";

function MerchantSalesPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Session storage for merchant info is a good approach.
  const storeName = sessionStorage.getItem("store_name") || "가게 이름";
  const owner = sessionStorage.getItem("owner_name") || "사장님";

  const handleLogout = () => {
    sessionStorage.clear();
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost/dmu-pay/backend/getMerchantStats.php?period=${activeTab}`,
          { credentials: "include" }
        );
        const result = await res.json();
        if (result.success) {
          setSalesData(result.data);
        } else {
          alert(result.message || "매출 현황을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        alert("서버와 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [activeTab]); // Re-fetch data when the active tab changes.

  return (
    <div className="merchant-page">
      <MerchantHeader
        storeName={storeName}
        owner={owner}
        onLogout={handleLogout}
      />

      {/* Tab section */}
      <div className="sales-tabs">
        <button
          className={activeTab === "today" ? "active" : ""}
          onClick={() => setActiveTab("today")}
        >
          오늘
        </button>
        <button
          className={activeTab === "week" ? "active" : ""}
          onClick={() => setActiveTab("week")}
        >
          이번주
        </button>
        <button
          className={activeTab === "month" ? "active" : ""}
          onClick={() => setActiveTab("month")}
        >
          이번달
        </button>
      </div>

      {/* Settlement summary */}
      <div className="settlement-summary">
        <strong>
          이번 달 정산금액:{" "}
          <span>{salesData ? `${salesData.settlement.toLocaleString()}원` : "로딩중..."}</span>
        </strong>
      </div>

      {/* Sales summary box */}
      {loading ? (
        <div>데이터를 불러오는 중...</div>
      ) : salesData ? (
        <div className="sales-summary-box">
          <div className="sales-left">
            <p>매출</p>
            <h2>{salesData.sales.toLocaleString()}원</h2>
            <p>환불</p>
            <h2 className="negative">-{salesData.returns.toLocaleString()}원</h2>
          </div>
          <div className="sales-right">
            <p>주문건</p>
            <h2>{salesData.orders.toLocaleString()}건</h2>
            <p>평균결제금액</p>
            <h2>{salesData.average.toLocaleString()}원</h2>
          </div>
        </div>
      ) : (
        <div>데이터가 없습니다.</div>
      )}
    </div>
  );
}

export default MerchantSalesPage;
