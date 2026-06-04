// src/App.js

import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import StudentMainPage from "./pages/StudentMainPage";
import MerchantMainPage from "./pages/MerchantMainPage";
import AdminMainPage from "./pages/AdminMainPage";
import AdminStudentPage from "./pages/AdminStudentPage";
import AdminMerchantPage from "./pages/AdminMerchantPage";
import StudentPointHistoryPage from "./pages/StudentPointHistoryPage";
import StudentRankingPage from "./pages/StudentRankingPage";
import StudentMerchantInfoPage from "./pages/StudentMerchantInfoPage";
import StudentMyPage from "./pages/StudentMyPage";
import AdminMerchantRegisterPage from "./pages/AdminMerchantRegisterPage";
import AdminMerchantEditPage from "./pages/AdminMerchantEditPage";
import AdminMerchantDetailPage from "./pages/AdminMerchantDetailPage";
import AdminStudentPointPage from "./pages/AdminStudentPointPage";
import AdminStudentPointEditPage from "./pages/AdminStudentPointEditPage";
import MerchantSalesPage from "./pages/MerchantSalesPage";
import MerchantCalendarPage from "./pages/MerchantCalendarPage";
import StudentPaymentPage from "./pages/StudentPaymentPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 루트 접근 시 로그인으로 리디렉트 */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 인증 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 학생 페이지 */}
        <Route path="/student" element={<StudentMainPage />} />
        <Route path="/payment" element={<StudentPaymentPage />} />
        <Route path="/point-history" element={<StudentPointHistoryPage />} />
        <Route path="/ranking" element={<StudentRankingPage />} />
        <Route path="/merchants" element={<StudentMerchantInfoPage />} />
        <Route path="/mypage" element={<StudentMyPage />} />

        {/* 가맹점 페이지 */}
        <Route path="/merchant" element={<MerchantMainPage />} />
        <Route path="/merchant/sales" element={<MerchantSalesPage />} />
        <Route path="/merchant/calendar" element={<MerchantCalendarPage />} />

        {/* 관리자 메인 */}
        <Route path="/admin" element={<AdminMainPage />} />

        {/* 관리자 - 학생 관리 */}
        <Route path="/admin/student" element={<AdminStudentPage />} />
        {/* 관리자 - 학생 포인트 내역 (student_no로 라우트 파라미터 이름 변경) */}
        <Route
          path="/admin/student/point/:student_no"
          element={<AdminStudentPointPage />}
        />
        {/* 관리자 - 학생 포인트 지급/차감 */}
        <Route
          path="/admin/student/point-edit"
          element={<AdminStudentPointEditPage />}
        />

        {/* 관리자 - 가맹점 관리 */}
        <Route path="/admin/merchant" element={<AdminMerchantPage />} />
        <Route
          path="/admin/merchant/register"
          element={<AdminMerchantRegisterPage />}
        />
        <Route
          path="/admin/merchant/edit/:code"
          element={<AdminMerchantEditPage />}
        />
        <Route
          path="/admin/merchant/detail/:code"
          element={<AdminMerchantDetailPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
