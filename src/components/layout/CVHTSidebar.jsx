import React, { useState, useEffect } from 'react';
import { User, FileText, CheckCircle, BookOpen, BarChart2, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './CVHTSidebar.css';

const CVHTSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const current = location.pathname;
    const [userData, setUserData] = useState({
        name: "CVHT",
        role: "Giảng viên"
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
                    name: payload.hoTen || payload.name || "CVHT",
                    role: "Giảng viên" // Role is usually implied for this view
                });
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }
    };

    const navItems = [
        { id: 'profile', icon: User, label: 'Hồ sơ cá nhân' },
        { id: 'knowledge', icon: BookOpen, label: 'Kho tri thức (FAQ)' },
        { id: 'pending', icon: FileText, label: 'Danh sách câu hỏi' },
        { id: 'processing', icon: CheckCircle, label: 'Lịch sử câu trả lời' },
        { id: 'reports', icon: BarChart2, label: 'Báo cáo thống kê' },
    ];

    return (
        <aside className="cvht-sidebar">
            <div className="cvht-profile">
                <div className="cvht-avatar">
                    <img
                        src={`https://ui-avatars.com/api/?name=${userData.name.replace(/ /g, '+')}&background=0284c7&color=fff`}
                        alt="CVHT"
                    />
                </div>
                <div className="cvht-info">
                    <h3 className="cvht-name">{userData.name}</h3>
                    <p className="cvht-role">{userData.role}</p>
                </div>
            </div>

            <nav className="cvht-nav">
                {navItems.map(item => (
                    <Link
                        key={item.id}
                        to={`/cvht/${item.id}`}
                        className={`cvht-nav-item ${current.includes(item.id) ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}

                <a
                    href="#"
                    className="cvht-nav-item logout"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </a>
            </nav>
        </aside>
    );
};

export default CVHTSidebar;
