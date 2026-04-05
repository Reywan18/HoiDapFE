import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import QuestionList from './components/QuestionList';
import Profile from './components/Profile';
import NewQuestion from './components/NewQuestion';
import QuestionDetail from './components/QuestionDetail';
import FAQ from './components/FAQ';

import CVHTDashboard from './components/CVHTDashboard';
import PendingQuestions from './components/PendingQuestions';
import CVHTReports from './components/CVHTReports';

import Login from './components/Login';
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

function App() {
  const location = useLocation();

  useEffect(() => {
    // Chỉ check cơ bản để tự động redirect nếu ở gốc
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role && location.pathname === '/') {
      if (role === 'cvht') {
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
