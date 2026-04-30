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
    Activity,
    Menu
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
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { toggleSidebar } = useOutletContext();
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
            toast.success('Xuất báo cáo PDF thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất PDF:', error);
            toast.error('Không thể xuất báo cáo PDF. Vui lòng kiểm tra lại quyền truy cập.');
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
                <div className="dashboard-title-area">
                    <button className="mobile-toggle-btn" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <div className="dashboard-title">
                        <h1>Báo Cáo Thống Kê Tổng Quan</h1>
                        <p>Chào mừng Quản trị viên! Đây là dữ liệu vận hành hệ thống tính tới thời điểm hiện tại.</p>
                    </div>
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
            <div className="charts-grid">
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

                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Hiệu suất chi tiết Cố vấn học tập</h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> Tích cực
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></span> Trung bình
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span> Báo động
                            </span>
                        </div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.advisorStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    interval={0}
                                />
                                <YAxis 
                                    domain={[0, 100]}
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                                                    <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#1e293b' }}>{data.name}</p>
                                                    <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Hiệu suất: <strong style={{ color: '#0f172a' }}>{data.efficiencyPercentage}%</strong></p>
                                                    <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Đã xử lý: <strong style={{ color: '#0f172a' }}>{data.answeredCount}/{data.totalQuestions}</strong></p>
                                                    <p style={{ margin: '0', fontSize: '13px', color: '#64748b' }}>Tốc độ: <strong style={{ color: '#0f172a' }}>{data.avgResponseTimeHours?.toFixed(1)}h</strong></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="efficiencyPercentage" radius={[4, 4, 0, 0]} label={{ position: 'top', formatter: (val) => `${val}%`, fontSize: 10, fill: '#64748b' }}>
                                    {stats.advisorStats.map((entry, index) => {
                                        // Logic màu sắc theo hiệu suất (%):
                                        // - Tích cực (Green): >= 80%
                                        // - Trung bình (Yellow): 40% - 80%
                                        // - Báo động (Red): < 40%
                                        let color = '#f59e0b';
                                        if (entry.efficiencyPercentage >= 80) color = '#10b981';
                                        else if (entry.efficiencyPercentage < 40) color = '#ef4444';
                                        
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
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
                                <th>Hiệu suất (%)</th>
                                <th>Xử lý (Xong/Tổng)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.advisorStats?.slice(0, 5).map((adv, index) => (
                                <tr key={index}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{adv.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${adv.efficiencyPercentage}%`, 
                                                    height: '100%', 
                                                    background: adv.efficiencyPercentage >= 80 ? '#10b981' : adv.efficiencyPercentage < 40 ? '#ef4444' : '#f59e0b' 
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '40px' }}>{adv.efficiencyPercentage}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{adv.answeredCount}/{adv.totalQuestions}</div>
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
