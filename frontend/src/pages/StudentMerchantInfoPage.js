import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './StudentMerchantInfoPage.css';

function StudentMerchantInfoPage() {
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  const fetchMerchants = async (page = 1, category = 'all', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        category,
        search
      });

      const res = await fetch(
        `http://localhost/dmu-pay/backend/merchants.php?${params}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.success) {
        setMerchants(data.merchants);
        setTotal(data.total);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setCategories(data.categories);
      } else {
        alert(data.message || '가맹점 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('가맹점 데이터 로드 실패:', error);
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchMerchants();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1);
    fetchMerchants(1, selectedCategory, searchText);
  };

  // 업종 변경
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchMerchants(1, category, searchText);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchMerchants(page, selectedCategory, searchText);
    }
  };

  // Enter 키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      <Header />
      <div className="merchant-page">
        <div className="merchant-title">가맹점 안내</div>

        <div className="merchant-stats">
          총 <strong>{total}</strong>개의 가맹점이 있습니다.
        </div>

        <div className="merchant-filter">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">전체 업종</option>
            <option value="음식점">음식점</option>
            <option value="상점">상점</option>
            <option value="기타">기타</option>
            {categories.filter(cat => !['음식점', '상점', '기타'].includes(cat)).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="가게 이름을 입력하세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <button onClick={handleSearch} disabled={loading}>
            {loading ? '검색중...' : '검색'}
          </button>
        </div>

        {loading ? (
          <div className="loading">데이터를 불러오는 중...</div>
        ) : (
          <>
            <table className="merchant-table">
              <thead>
                <tr>
                  <th>매장명</th>
                  <th>업종</th>
                  <th>주소</th>
                  <th>전화번호</th>
                  <th>가맹점코드</th>
                </tr>
              </thead>
              <tbody>
                {merchants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      등록된 가맹점이 없습니다.
                    </td>
                  </tr>
                ) : (
                  merchants.map((merchant, idx) => (
                    <tr key={idx}>
                      <td className="store-name">{merchant.store_name}</td>
                      <td>
                        <span className={`category-badge ${merchant.category}`}>
                          {merchant.category}
                        </span>
                      </td>
                      <td>{merchant.address || '-'}</td>
                      <td>{merchant.phone || '-'}</td>
                      <td className="merchant-code">{merchant.merchant_code}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    className={currentPage === pageNum ? 'active' : ''}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default StudentMerchantInfoPage;
