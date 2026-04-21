import React, { useState, useEffect } from 'react';
import { MessageSquare, PlusCircle, BookOpen, User, LogOut, FileText, BarChart2, Bot } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const current = location.pathname;
    const role = localStorage.getItem('role') || 'student';

    const [userData, setUserData] = useState({
        name: role === 'admin' ? "Quản trị viên" : (role === 'cvht' ? "Cố vấn học tập" : "Sinh viên"),
        role: role === 'admin' ? "Hệ thống" : (role === 'cvht' ? "Giảng viên" : "Đại học Thăng Long")
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT with UTF-8 support
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                setUserData({
                    name: payload.hoTen || payload.name || (role === 'admin' ? "Quản trị viên" : (role === 'cvht' ? "Cố vấn học tập" : "Sinh viên")),
                    role: role === 'admin' ? "Hệ thống" : (role === 'cvht' ? "Giảng viên" : "Đại học Thăng Long")
                });
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, [role]);

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }
    };

    let navItems = [];
    if (role === 'admin') {
        navItems = [
            { id: 'dashboard', to: '/admin/dashboard', icon: BarChart2, label: 'Báo cáo thống kê' },
            { id: 'classes', to: '/admin/classes', icon: BookOpen, label: 'Quản lý Lớp' },
            { id: 'students', to: '/admin/students', icon: User, label: 'Quản lý Sinh viên' },
            { id: 'cvht', to: '/admin/cvht', icon: User, label: 'Quản lý CVHT' },
            { id: 'questions', to: '/admin/questions', icon: FileText, label: 'Quản lý Câu hỏi' },
            { id: 'faqs', to: '/admin/faqs', icon: BookOpen, label: 'Quản lý FAQ' },
            { id: 'ai-training', to: '/admin/ai-training', icon: Bot, label: 'Huấn luyện AI' },
        ];
    } else if (role === 'cvht') {
        navItems = [
            { id: 'profile', to: '/cvht/profile', icon: User, label: 'Hồ sơ cá nhân' },
            { id: 'knowledge', to: '/cvht/knowledge', icon: BookOpen, label: 'Kho tri thức (FAQ)' },
            { id: 'pending', to: '/cvht/pending', icon: FileText, label: 'Danh sách câu hỏi' },
            { id: 'reports', to: '/cvht/reports', icon: BarChart2, label: 'Báo cáo thống kê' },
        ];
    } else {
        navItems = [
            { id: 'profile', to: '/sinhvien/profile', icon: User, label: 'Hồ sơ cá nhân' },
            { id: 'chatbot', to: '/sinhvien/chatbot', icon: Bot, label: 'Hỏi đáp nhanh' },
            { id: 'faq', to: '/sinhvien/faq', icon: BookOpen, label: 'Kho kiến thức (FAQ)' },
            { id: 'new-question', to: '/sinhvien/new-question', icon: PlusCircle, label: 'Tạo câu hỏi mới' },
            { id: 'my-question', to: '/sinhvien/my-question', icon: MessageSquare, label: 'Câu hỏi của tôi' },
        ];
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-area">
                    <MessageSquare className="logo-icon" size={24} />
                    <span className="logo-text">Hệ thống Hỏi đáp</span>
                </div>
            </div>

            <div className="user-profile">
                <div className="avatar">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${userData.name.replace(/ /g, '+')}&background=${role === 'cvht' ? '0284c7' : 'random'}&color=fff`} 
                        alt="User" 
                    />
                </div>
                <div className="user-info">
                    <h3 className="user-name">{userData.name}</h3>
                    <p className="user-role">{userData.role}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.to}
                        className={`nav-item ${current.includes(item.id) ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
