import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminMerchantRegisterPage.css';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';

function AdminMerchantRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeName: '',
    merchantCode: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    businessNumber: '',
    category: '음식점',
    note: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      storeName, merchantCode, username, password,
      phone, accountHolder, bankName, accountNumber
    } = formData;
    if (!storeName || !merchantCode || !username || !password ||
      !phone || !accountHolder || !bankName || !accountNumber) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, v));
      const res = await fetch(
        'http://localhost/dmu-pay/backend/AdminMerchantRegister.php',
        { method: 'POST', credentials: 'include', body: submitData }
      );
      const result = await res.json();
      if (result.success) {
        alert('가맹점이 등록되었습니다.');
        navigate('/admin/merchant');
      } else {
        alert('등록 실패: ' + result.message);
      }
    } catch {
      alert('서버 통신 중 오류');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="merchant-register-container">
      <AdminHeader handleLogout={handleLogout} />
      <div className="merchant-register-body">
        <AdminSidebar />
        <div className="merchant-register-content">
          <h2>가맹점 신규등록</h2>
          <form onSubmit={handleSubmit} className="merchant-form">
            <fieldset>
              <legend>■ 계정 정보</legend>
              <table>
                <tbody>
                  <tr>
                    <th>아이디 *</th>
                    <td><input name="username" value={formData.username} onChange={handleChange} required /></td>
                    <th>비밀번호 *</th>
                    <td><input type="password" name="password" value={formData.password} onChange={handleChange} required /></td>
                  </tr>
                </tbody>
              </table>
            </fieldset>
            <fieldset>
              <legend>■ 가맹점 정보</legend>
              <table>
                <tbody>
                  <tr>
                    <th>상호명 *</th>
                    <td><input name="storeName" value={formData.storeName} onChange={handleChange} required /></td>
                    <th>가맹점 코드 *</th>
                    <td><input name="merchantCode" value={formData.merchantCode} onChange={handleChange} required /></td>
                  </tr>
                  <tr>
                    <th>전화번호 *</th>
                    <td><input name="phone" value={formData.phone} onChange={handleChange} required /></td>
                    <th>주소</th>
                    <td><input name="address" value={formData.address} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>업종</th>
                    <td>
                      <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="음식점">음식점</option>
                        <option value="상점">상점</option>
                        <option value="잡화점">기타</option>
                      </select>
                    </td>
                    <td colSpan="2" />
                  </tr>
                  <tr className="section-divider">
                    <td colSpan="4">정산 계좌정보</td>
                  </tr>
                  <tr>
                    <th>예금주 *</th>
                    <td><input name="accountHolder" value={formData.accountHolder} onChange={handleChange} required /></td>
                    <th>은행명 *</th>
                    <td><input name="bankName" value={formData.bankName} onChange={handleChange} required /></td>
                  </tr>
                  <tr>
                    <th>계좌번호 *</th>
                    <td><input name="accountNumber" value={formData.accountNumber} onChange={handleChange} required /></td>
                    <th>사업자번호</th>
                    <td><input name="businessNumber" value={formData.businessNumber} onChange={handleChange} /></td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td colSpan="3"><input name="note" value={formData.note} onChange={handleChange} /></td>
                  </tr>
                </tbody>
              </table>
              <div className="btn-wrapper">
                <button type="submit">등록</button>
                <button type="button" onClick={() => navigate('/admin/merchant')}>취소</button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminMerchantRegisterPage;
