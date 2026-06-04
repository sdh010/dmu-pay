import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './StudentPointHistoryPage.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function StudentPointHistoryPage() {
  /* ---------- 상태 ---------- */
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [chartData, setChart] = useState([]);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('all');     // all | earn | use
  const [total, setTotal] = useState(0);

  /* ---------- 데이터 로드 ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost/dmu-pay/backend/studentpointhistory.php?page=${page}&type=${type}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (!data.success) {
          if (data.message === 'NOT_LOGGED_IN') {
            alert('세션이 만료되었습니다. 다시 로그인하세요.');
          } else {
            alert(data.message || '데이터를 불러오지 못했습니다.');
          }
          return;
        }

        setBalance(Number(data.balance));
        setTotal(Number(data.total));

        /* history 배열: 문자열 → 숫자 변환 */
        setHistory(
          data.list.map(row => ({
            ...row,
            point_type: Number(row.point_type),
            point_amount: Number(row.point_amount)
          }))
        );

        /* chart 데이터 변환 */
        setChart(
          data.chart.map(d => ({
            date: d.label,
            지급: Number(d.earn),
            사용: Number(d.useAmt)
          }))
        );
      } catch (err) {
        console.error(err);
        alert('서버 통신 오류');
      }
    };

    fetchData();
  }, [page, type]);

  /* ---------- 페이징 계산 ---------- */
  const pages = Math.ceil(total / 10);

  return (
    <>
      <Header />
      <div className="point-history-page">
        {/* 1) 잔액 + 라인차트 */}
        <div className="top-section">
          <div className="point-box">
            <h2>현재 포인트</h2>
            <p className="current-point">{balance.toLocaleString()}P</p>
          </div>

          <div className="chart-box">
            <h4>지급/사용 추이</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="지급"
                  stroke="#055db4"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="사용"
                  stroke="#ff4d4d"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2) 필터 버튼 */}
        <div className="filter-section">
          {['all', 'use', 'earn'].map(v => (
            <button
              key={v}
              className={`filter-btn ${type === v ? 'active' : ''}`}
              onClick={() => { setType(v); setPage(1); }}
            >
              {v === 'all' ? '전체'
                : v === 'use' ? '사용'
                  : '지급'}
            </button>
          ))}
        </div>

        {/* 3) 이력 테이블 */}
        <table className="history-table">
          <thead>
            <tr>
              <th>일시</th>
              <th>구분</th>
              <th>내역</th>
              <th>포인트</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  데이터가 없습니다
                </td>
              </tr>
            )}

            {history.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date_fmt}</td>
                <td>{row.point_type === 1 ? '지급' : '사용'}</td>
                <td>{row.reason}</td>
                <td className={row.point_type === 1 ? 'plus' : 'minus'}>
                  {row.point_type === 1 ? '+' : '-'}
                  {row.point_amount.toLocaleString()}P
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 4) 페이징 */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(1)}>
            &laquo;
          </button>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            &lt;
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={page === n ? 'active' : ''}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            disabled={page === pages || pages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            &gt;
          </button>
          <button
            disabled={page === pages || pages === 0}
            onClick={() => setPage(pages)}
          >
            &raquo;
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentPointHistoryPage;
