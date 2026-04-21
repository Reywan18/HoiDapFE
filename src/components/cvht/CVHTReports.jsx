import React, { useEffect, useState } from 'react';
import { BarChart, PieChart, Calendar, Download } from 'lucide-react';
import '../common/QuestionList.css';
import './CVHTDashboard.css';
import api from '../../services/api';

const CVHTReports = () => {
    const [stats, setStats] = useState({
        totalQuestions: 0,
        totalAnswered: 0,
        pendingQuestions: 0,
        studentsCount: 0
    });
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        api.get('/reports/dashboard')
            .then(res => {
                if (res.data && res.data.data) {
                    setStats(res.data.data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/reports/export/pdf', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'BaoCaoThongKe.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
            alert("Xuất báo cáo thất bại.");
        } finally {
            setIsExporting(false);
        }
    };

    const resolved = stats.totalAnswered || 0;
    const resolvedPercent = stats.totalQuestions ? Math.round((resolved / stats.totalQuestions) * 100) : 0;

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Báo cáo thống kê</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <div className="page-header-flex" style={{ display: 'flex', marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>Báo cáo hiệu quả & Thống kê</h1>

                    <div className="report-actions" style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                        <div className="date-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <Calendar size={18} color="#64748b" />
                            <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            <Download size={18} /> {isExporting ? 'Đang xuất...' : 'Xuất báo cáo (PDF)'}
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                    <div className="dashboard-bottom" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="stats-card text-center">
                            <span className="stat-label">Tổng câu hỏi</span>
                            <div className="stat-number" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.totalQuestions}</div>
                            {/* <span className="stat-sub text-green">+12% so với tháng trước</span> */}
                        </div>
                        <div className="stats-card text-center">
                            <span className="stat-label">Đã giải quyết</span>
                            <div className="stat-number" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{resolved}</div>
                            <span className="stat-sub text-green">{resolvedPercent}% hoàn thành</span>
                        </div>
                        <div className="stats-card text-center">
                            <span className="stat-label">Đang chờ xử lý</span>
                            <div className="stat-number" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.pendingQuestions}</div>
                            <span className="stat-sub text-green">Cần xử lý ngay</span>
                        </div>
                        <div className="stats-card text-center">
                            <span className="stat-label">Sinh viên tương tác</span>
                            <div className="stat-number" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.studentsCount}</div>
                            {/* <span className="stat-sub text-green">Trên 5.0</span> */}
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="dashboard-grid">
                    <div className="dashboard-bottom">
                        {/* Weekly Activity Chart */}
                        <div className="chart-card">
                            <h3>Tần suất câu hỏi theo tuần</h3>
                            <div className="bar-chart-visual" style={{ height: '250px', alignItems: 'flex-end', gap: '2rem', display: 'flex' }}>
                                {(stats.weeklyTrend || [0, 0, 0, 0, 0, 0, 0]).map((count, i) => {
                                    // Calculate max to scale bars relative to highest value, avoid 0 division
                                    const maxVal = Math.max(...(stats.weeklyTrend || [0]), 1);
                                    const heightPercent = Math.max((count / maxVal) * 100, 5); // Minimum 5% height for visibility

                                    return (
                                        <div key={i} className="bar-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div title={`${count} câu hỏi`} className="bar" style={{ height: `${heightPercent}%`, width: '40px', background: '#3b82f6', borderRadius: '4px', transition: 'height 0.3s' }}></div>
                                            <span className="bar-label" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Topic Distribution */}
                        <div className="chart-card">
                            <h3>Phân bố chủ đề (Mô phỏng)</h3>
                            <div className="topic-list" style={{ marginTop: '1rem' }}>
                                {[
                                    { name: "Học vụ", count: 45, percent: "35%" },
                                    { name: "Công tác sinh viên", count: 30, percent: "25%" },
                                    { name: "Đào tạo", count: 25, percent: "20%" },
                                    { name: "Khao thí", count: 20, percent: "15%" },
                                    { name: "Khác", count: 5, percent: "5%" }
                                ].map((topic, i) => (
                                    <div key={i} className="topic-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ width: '150px', fontSize: '0.9rem', color: '#334155' }}>{topic.name}</span>
                                        <div className="progress-bg" style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginRight: '1rem' }}>
                                            <div style={{ width: topic.percent, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>{topic.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CVHTReports;
