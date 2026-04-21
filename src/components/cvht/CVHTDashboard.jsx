import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CVHTDashboard.css';
import api from '../../services/api';

const CVHTDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Giảng viên');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserName(payload.hoTen || payload.name || 'Giảng viên');
            } catch (e) { }
        }

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Stats and Recent Pending Questions in parallel
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/reports/dashboard').catch(() => ({ data: { data: {} } })), // Fallback if 403 or fail
                api.get('/questions', { params: { status: 'PENDING', page: 0, size: 5, sort: 'ngayGui,desc' } })
            ]);

            setStats(statsRes.data.data || {});
            setPendingQuestions(pendingRes.data.data?.content || []);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Calculate percentages
    const total = stats?.totalQuestions || 1;
    const processed = (stats?.processedQuestions || 0) + (stats?.approvedQuestions || 0); // Assuming 'approved' is also 'processed'
    const percentage = Math.round((processed / total) * 100) || 0;

    return (
        <main className="cvht-main">
            <h1 className="welcome-text">Chào mừng, {userName}!</h1>

            <div className="dashboard-grid">
                {/* Top Section */}
                <div className="dashboard-top">
                    {/* Actions Card */}
                    <div className="action-card">
                        <div className="empty-state-visual"></div>
                        <div className="action-buttons">
                            <button className="btn-action blue" onClick={() => navigate('/cvht/pending')}>Duyệt câu hỏi mới</button>
                            <button className="btn-action blue" onClick={() => navigate('/cvht/knowledge')}>Quản lý FAQ</button>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="progress-card">
                        <div className="circular-chart">
                            <svg viewBox="0 0 36 36" className="circular-chart-svg">
                                <path className="circle-bg"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path className="circle"
                                    strokeDasharray={`${percentage}, 100`}
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">{percentage}%</text>
                            </svg>
                        </div>
                        <p className="chart-label">Đã xử lý / Tổng số</p>
                    </div>
                </div>

                {/* Recent Questions Table */}
                <div className="recent-questions-card">
                    <h3>Danh sách câu chờ mới</h3>
                    {loading ? <p>Đang tải...</p> : (
                        <table className="cvht-table">
                            <thead>
                                <tr>
                                    <th>Chủ đề</th>
                                    <th>Sinh viên</th>
                                    <th>Ngày gửi</th>
                                    <th>Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingQuestions.length === 0 ? (
                                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Không có câu hỏi chờ nào.</td></tr>
                                ) : (
                                    pendingQuestions.map(q => (
                                        <tr key={q.maCauHoi}>
                                            <td>{q.tieuDe}</td>
                                            <td>{q.tenSinhVien || q.maSinhVien}</td>
                                            <td className="text-center">{formatDate(q.ngayGui)}</td>
                                            <td>
                                                <button
                                                    className="btn-table-action"
                                                    onClick={() => navigate(`/cvht/question-detail/${q.maCauHoi}`)}
                                                >
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="dashboard-bottom">
                    {/* Quick Stats */}
                    <div className="stats-card">
                        <h3>Báo cáo nhanh</h3>
                        <div className="stat-row">
                            <span className="stat-label">Câu hỏi đã xử lý</span>
                            <span className="stat-value">{percentage}%</span>
                        </div>
                        <div className="stat-progress">
                            <div className="stat-bar" style={{ width: `${percentage}%` }}></div>
                        </div>

                        <div className="stat-row mt-4">
                            <span className="stat-label">Tổng sinh viên hỏi</span>
                            <span className="stat-number">{stats?.studentsCount || 0}</span>
                        </div>

                        <div className="stat-row mt-2">
                            <span className="stat-label">Câu hỏi đang chờ</span>
                            <span className="stat-number">{stats?.pendingQuestions || 0}</span>
                        </div>
                    </div>

                    {/* Classification Chart - Mock visual but with stat placeholders if available */}
                    <div className="chart-card">
                        <h3>Phân loại câu hỏi</h3>
                        <div className="bar-chart-visual">
                            {/* Visual representation only as API doesn't provide breakdown yet */}
                            <div className="bar-group">
                                <div className="bar blue" style={{ height: '30%' }}></div>
                                <span className="bar-label">Học vụ</span>
                            </div>
                            <div className="bar-group">
                                <div className="bar blue" style={{ height: '50%' }}></div>
                                <span className="bar-label">Khác</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CVHTDashboard;
