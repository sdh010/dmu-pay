// src/pages/AdminMerchantEditPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import DeleteConfirmModal from '../components/DeleteConfirmModal'; // 삭제 모달이 있다고 가정
import './AdminMerchantRegisterPage.css';

function AdminMerchantEditPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    businessNumber: '',
    category: '음식점',
    // 'note' 필드 제거
  });
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  });

  useEffect(() => {
    fetch(`http://localhost/dmu-pay/backend/AdminMerchantDetail.php?code=${code}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormData({
            name: data.info.store_name,
            code: data.info.merchant_code,
            phone: data.info.phone,
            address: data.info.address,
            accountHolder: data.info.account_holder,
            bankName: data.info.bank_name,
            accountNumber: data.info.account_number,
            businessNumber: data.info.business_no,
            category: data.info.category,
            // 'note' 필드 제거
          });
        } else {
          alert(data.message);
          navigate('/admin/merchant');
        }
      })
      .catch(() => {
        alert('정보 로딩 중 오류 발생');
        navigate('/admin/merchant');
      })
      .finally(() => setLoading(false));
  }, [code, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      // formData에 있는 모든 키-값을 FormData에 추가
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));

      const res = await fetch('http://localhost/dmu-pay/backend/AdminMerchantEdit.php', {
        method: 'POST',
        credentials: 'include',
        body: submitData
      });

      const result = await res.json();
      if (result.success) {
        alert('수정되었습니다.');
        navigate('/admin/merchant');
      } else {
        alert('수정 실패: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isDeleting: false
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch('http://localhost/dmu-pay/backend/AdminMerchantDelete.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          merchant_code: formData.code
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('가맹점이 성공적으로 삭제되었습니다.');
        navigate('/admin/merchant');
      } else {
        alert('삭제 실패: ' + data.message);
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('가맹점 삭제 오류:', error);
      alert('가맹점 삭제 중 오류가 발생했습니다.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, isDeleting: false });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    alert('로그아웃 되었습니다.');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <AdminHeader handleLogout={handleLogout} />
        <div className="merchant-register-body">
          <AdminSidebar />
          <div className="merchant-register-content">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-register-container">
      <AdminHeader handleLogout={handleLogout} />
      <div className="merchant-register-body">
        <AdminSidebar />
        <div className="merchant-register-content">
          <h2>가맹점 정보 수정</h2>
          <form onSubmit={handleSubmit} className="merchant-form">
            <fieldset>
              <legend>■ 가맹점 정보</legend>
              <table>
                <tbody>
                  <tr>
                    <th>상호명</th>
                    <td>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </td>
                    <th>가맹점 코드</th>
                    <td>
                      <input
                        name="code"
                        value={formData.code}
                        readOnly
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>전화번호</th>
                    <td>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </td>
                    <th>주소</th>
                    <td>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>업종</th>
                    <td>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="음식점">음식점</option>
                        <option value="상점">상점</option>
                        <option value="기타">기타</option>
                      </select>
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                  <tr className="section-divider">
                    <td colSpan="4">정산 계좌정보</td>
                  </tr>
                  <tr>
                    <th>예금주</th>
                    <td>
                      <input
                        name="accountHolder"
                        value={formData.accountHolder}
                        onChange={handleChange}
                      />
                    </td>
                    <th>은행명</th>
                    <td>
                      <input
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>계좌번호</th>
                    <td>
                      <input
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                      />
                    </td>
                    <th>사업자번호</th>
                    <td>
                      <input
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={handleChange}
                      />
                    </td>
                  </tr>
                  {/* '비고' <tr> 행 제거 */}
                </tbody>
              </table>
              <div className="btn-wrapper">
                <button type="submit">수정 완료</button>
                <button type="button" onClick={() => navigate('/admin/merchant')}>취소</button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDeleteClick}
                >
                  삭제
                </button>
              </div>
            </fieldset>
          </form>

          {/* DeleteConfirmModal이 'DeleteConfirmModal.js' 파일에 정의되어 있다고 가정 */}
          {deleteModal.isOpen && (
            <DeleteConfirmModal
              isOpen={deleteModal.isOpen}
              onClose={handleDeleteCancel}
              onConfirm={handleDeleteConfirm}
              title="가맹점 삭제 확인"
              message="이 가맹점을 삭제하시겠습니까?"
              itemName={formData.name}
              isDeleting={deleteModal.isDeleting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMerchantEditPage;

