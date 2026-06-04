import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './StudentMainPage.css';

function StudentMainPage() {
  const navigate = useNavigate();

  // 상태값들
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    student_no: '',
    major: ''
  });
  const [balance, setBalance] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notices, setNotices] = useState([]);
  const [expandedNotices, setExpandedNotices] = useState(new Set()); // Set으로 변경
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const fetchMainData = async () => {
      try {
        // 1) 학생 기본 정보
        const profileRes = await fetch(
          'http://localhost/dmu-pay/backend/profile.php',
          { credentials: 'include' }
        );
        const profileData = await profileRes.json();

        if (profileData.success) {
          setStudentInfo({
            name: profileData.student.name || '',
            student_no: profileData.student.student_no || '',
            major: profileData.student.major || ''
          });
        }

        // 2) 포인트 잔액 + 최근 활동 내역 (최근 5건)
        const historyRes = await fetch(
          'http://localhost/dmu-pay/backend/studentpointhistory.php?page=1&type=all',
          { credentials: 'include' }
        );
        const historyData = await historyRes.json();

        if (historyData.success) {
          setBalance(historyData.balance);

          // 최근 5건만 표시
          const recentList = historyData.list.slice(0, 5).map(item => ({
            date: item.date_fmt,
            reason: item.reason,
            point_type: Number(item.point_type),
            point_amount: Number(item.point_amount)
          }));
          setRecentActivity(recentList);
        }

        // 3) 공지사항 (임시 데이터 - 추후 API로 교체 가능)
        setNotices([
          {
            id: 1,
            title: 'DMU-Pay 서비스 오픈 안내',
            content: '동양미래대학교 학생을 위한 포인트 적립 및 결제 서비스가 정식 오픈되었습니다. 자격증 취득, 봉사활동, 성적 우수 등으로 포인트를 적립하고 가맹점에서 사용하세요!',
            date: '2025.08.04',
            isNew: true
          },
          {
            id: 2,
            title: '가맹점 추가 등록 안내',
            content: '학교 주변 카페, 서점, 음식점 등 다양한 가맹점이 추가되었습니다. 가맹점 찾기 메뉴에서 확인해보세요.',
            date: '2025.08.01',
            isNew: false
          },
          {
            id: 3,
            title: '포인트 적립 기준 안내',
            content: '자격증 취득 시 최대 2,000P, 봉사활동 참여 시 시간당 500P, 성적 우수자는 학기당 1,500P를 적립받을 수 있습니다. 자세한 내용은 학생지원팀에 문의하시기 바랍니다.',
            date: '2025.07.28',
            isNew: false
          }
        ]);

      } catch (error) {
        console.error('메인 데이터 로드 실패:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMainData();
  }, []);

  // 공지사항 토글 (다중 펼침 가능)
  const toggleNotice = (noticeId) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  // 전체 펼치기/접기
  const toggleAllNotices = () => {
    if (expandedNotices.size === notices.length) {
      setExpandedNotices(new Set());
    } else {
      setExpandedNotices(new Set(notices.map(n => n.id)));
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <>
        <Header />
        <div className="student-main">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            로딩 중...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="student-main">
        <div className="main-grid">

          {/* 학생 정보 */}
          <div className="card student-info">
            <h3>
              동양미래대학교 {studentInfo.student_no} {studentInfo.name}
            </h3>
            {studentInfo.major && (
              <p className="major-info">{studentInfo.major}</p>
            )}
          </div>

          {/* 결제하기 버튼 */}
          <div className="card payment-box">
            <div className="balance-display">
              <span className="balance-label">현재 포인트</span>
              <span className="balance-amount">{balance.toLocaleString()}P</span>
            </div>
            <button
              className="payment-btn"
              onClick={() => navigate('/payment')}
            >
              결제하기
            </button>
          </div>

          {/* 최근 활동 내역 */}
          <div className="card activity-log">
            <div className="card-header">
              <h4>최근 활동 내역</h4>
              <button
                className="view-all-btn"
                onClick={() => navigate('/point-history')}
              >
                전체보기
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <p className="no-activity">최근 활동이 없습니다</p>
            ) : (
              recentActivity.map((item, index) => (
                <div key={index} className="activity-item">
                  <span className="date">{item.date}</span>
                  <span className="reason">{item.reason}</span>
                  <span className={`point ${item.point_type === 1 ? 'plus' : 'minus'}`}>
                    {item.point_type === 1 ? '+' : '-'}
                    {item.point_amount.toLocaleString()}P
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 가맹점 안내 */}
          <div className="card store-guide">
            <h4>가맹점 안내</h4>
            <p>근처 가게에서 고유코드만 입력하면 결제 완료</p>
            <button
              className="store-btn"
              onClick={() => navigate('/merchants')}
            >
              가맹점 찾기
            </button>
          </div>

          {/* 공지사항 */}
          <div className="card notice-section">
            <div className="notice-header-section">
              <h4>공지사항</h4>
              <button
                className="toggle-all-btn"
                onClick={toggleAllNotices}
              >
                {expandedNotices.size === notices.length ? '모두 접기' : '모두 펼치기'}
              </button>
            </div>

            <div className="notice-list">
              {notices.map((notice) => (
                <div key={notice.id} className="notice-item">
                  <div
                    className="notice-header"
                    onClick={() => toggleNotice(notice.id)}
                  >
                    <div className="notice-title-section">
                      {notice.isNew && <span className="notice-badge">NEW</span>}
                      <span className="notice-title">{notice.title}</span>
                    </div>
                    <div className="notice-meta">
                      <span className="notice-date">{notice.date}</span>
                      <span className={`expand-icon ${expandedNotices.has(notice.id) ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {expandedNotices.has(notice.id) && (
                    <div className="notice-content">
                      <p>{notice.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentMainPage;
