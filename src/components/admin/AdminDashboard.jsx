import React, { useState, useEffect } from 'react';
import { 
    Users, 
    BookOpen, 
    CheckCircle, 
    MessageCircle, 
    TrendingUp,
    Download,
    Award,
    Clock,
    Activity
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid,
    Legend
} from 'recharts';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const result = await api.get('/reports/dashboard');
                if (result.data.status === 200) {
                    setStats(result.data.data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const exportPdf = async () => {
        try {
            const response = await api.get('/reports/export/pdf', {
                responseType: 'blob'
            });
            
            // Tạo link tạm thời để tải file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bao_cao_he_thong.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Lỗi khi xuất PDF:', error);
            alert('Không thể xuất báo cáo PDF. Vui lòng kiểm tra lại quyền truy cập.');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: '#64748b' }}>Đang tổng hợp báo cáo...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    // Data for Pie Chart
    const pieData = [
        { name: 'Đã xử lý', value: stats.totalAnswered, color: '#10b981' },
        { name: 'Đang chờ', value: stats.totalQuestions - stats.totalAnswered, color: '#f59e0b' }
    ];

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <header className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Báo Cáo Thống Kê Tổng Quan</h1>
                    <p>Chào mừng Quản trị viên! Đây là dữ liệu vận hành hệ thống tính tới thời điểm hiện tại.</p>
                </div>
                <button 
                    onClick={exportPdf}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
                >
                    <Download size={18} />
                    Xuất Báo Cáo PDF
                </button>
            </header>

            {/* KPI Cards Section */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                        <MessageCircle size={24} />
                    </div>
                    <div className="kpi-value">{stats.totalQuestions}</div>
                    <div className="kpi-label">Tổng số Câu hỏi</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="kpi-value">{stats.totalAnswered}</div>
                    <div className="kpi-label">Đã phản hồi</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                        <Clock size={24} />
                    </div>
                    <div className="kpi-value">{stats.totalQuestions - stats.totalAnswered}</div>
                    <div className="kpi-label">Đang chờ xử lý</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-value">{Math.round(stats.resolutionRate)}%</div>
                    <div className="kpi-label">Tỷ lệ Hoàn thành</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Tình trạng xử lý câu hỏi</h3>
                        <Activity size={18} color="#64748b" />
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={130}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="leaderboard-grid">
                {/* Students Table */}
                <div className="leaderboard-card">
                    <div className="leaderboard-header">
                        <h3><Users size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Sinh viên hỏi nhiều nhất</h3>
                    </div>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Sinh viên</th>
                                <th>Số câu hỏi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topStudents?.slice(0, 5).map((sv, index) => (
                                <tr key={sv.maSv}>
                                    <td>
                                        <div className={`rank-badge ${index === 0 ? 'bg-gold' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : 'bg-none'}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{sv.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{sv.maSv}</div>
                                    </td>
                                    <td>
                                        <span className="badge-pill badge-blue">{sv.questionCount} bài hỏi</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Advisors Table */}
                <div className="leaderboard-card">
                    <div className="leaderboard-header">
                        <h3><Award size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Hiệu suất Cố vấn học tập</h3>
                    </div>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Cố vấn</th>
                                <th>Đã xử lý</th>
                                <th>Tốc độ TB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.advisorStats?.slice(0, 5).map((adv, index) => (
                                <tr key={index}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{adv.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{adv.answeredCount}</div>
                                    </td>
                                    <td>
                                        <span className="badge-pill badge-purple">
                                            {adv.avgResponseTimeHours ? `${adv.avgResponseTimeHours.toFixed(1)}h` : 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
