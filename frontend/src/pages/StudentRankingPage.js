import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './StudentRankingPage.css';

function StudentRankingPage() {
  const [rankingData, setRankingData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost/dmu-pay/backend/ranking.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",  // 🔥 이 부분이 핵심!
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
          if (data.message === 'NOT_LOGGED_IN') {
            alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
            // navigate('/login'); // 필요시 로그인 페이지로 리다이렉트
          } else {
            setError(data.message || '랭킹 데이터를 가져올 수 없습니다.');
          }
          return;
        }

        if (data.ranking) {
          setRankingData(data.ranking);
          setMyRank(data.my_rank);
          setTotalStudents(data.total_students);
          setError(null);
        }

      } catch (e) {
        console.error("Ranking fetch error:", e);
        setError("서버 연결 오류: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="ranking-page">
          <div className="ranking-title">포인트 랭킹</div>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            로딩 중...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="ranking-page">
          <div className="ranking-title">포인트 랭킹</div>
          <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="ranking-page">
        <div className="ranking-title">포인트 랭킹</div>

        <div className="my-rank">
          {myRank !== null && (
            <>
              <span className="rank-number">{myRank}위</span>
              <span className="rank-total"> / {totalStudents}명</span>
            </>
          )}
        </div>

        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>포인트</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.length > 0 ? (
              rankingData.map((user, idx) => (
                <tr key={idx}>
                  <td>{user.real_rank}</td>
                  <td>{user.name}</td>
                  <td>{user.total_point.toLocaleString()}P</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                  랭킹 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default StudentRankingPage;
