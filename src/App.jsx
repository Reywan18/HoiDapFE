import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import QuestionList from './components/student/QuestionList';
import Profile from './components/common/Profile';
import NewQuestion from './components/student/NewQuestion';
import QuestionDetail from './components/common/QuestionDetail';
import FAQ from './components/common/FAQ';
import Chatbot from './components/student/Chatbot';

import CVHTDashboard from './components/cvht/CVHTDashboard';
import PendingQuestions from './components/cvht/PendingQuestions';
import CVHTReports from './components/cvht/CVHTReports';
import AdminDashboard from './components/admin/AdminDashboard';
import ClassManagement from './components/admin/ClassManagement';
import StudentManagement from './components/admin/StudentManagement';
import CVHTManagement from './components/admin/CVHTManagement';
import QuestionManagement from './components/admin/QuestionManagement';
import FAQManagement from './components/admin/FAQManagement';
import AiTraining from './components/admin/AiTraining';

import Login from './components/auth/Login';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'cvht' ? '/cvht' : '/sinhvien'} replace />;
  }
  return children;
};

// Layout cho Sinh Viên
const StudentLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Outlet />
    </div>
  );
};

// Layout cho CVHT
const CVHTLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Outlet />
    </div>
  );
};

// Layout cho Admin
const AdminLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Outlet />
    </div>
  );
};

function App() {
  const location = useLocation();

  useEffect(() => {
    // Chỉ check cơ bản để tự động redirect nếu ở gốc
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role && location.pathname === '/') {
      if (role === 'admin') {
        window.location.replace('/admin');
      } else if (role === 'cvht') {
        window.location.replace('/cvht');
      } else {
        window.location.replace('/sinhvien');
      }
    } else if (!token && location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Routes của Sinh Viên */}
      <Route path="/sinhvien" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="my-question" replace />} />
        <Route path="my-question" element={<QuestionList />} />
        <Route path="new-question" element={<NewQuestion />} />
        <Route path="question-detail/:id" element={<QuestionDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="chatbot" element={<Chatbot />} />
      </Route>

      {/* Routes của CVHT */}
      <Route path="/cvht" element={
        <ProtectedRoute allowedRole="cvht">
          <CVHTLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="pending" replace />} />
        <Route path="pending" element={<PendingQuestions />} />
        <Route path="question-detail/:id" element={<QuestionDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<CVHTReports />} />
        <Route path="knowledge" element={<FAQ />} />
      </Route>

      {/* Routes của Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        {/* Placeholder components, we will implement these shortly */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="cvht" element={<CVHTManagement />} />
        <Route path="questions" element={<QuestionManagement />} />
        <Route path="question-detail/:id" element={<QuestionDetail />} />
        <Route path="faqs" element={<FAQManagement />} />
        <Route path="ai-training" element={<AiTraining />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
