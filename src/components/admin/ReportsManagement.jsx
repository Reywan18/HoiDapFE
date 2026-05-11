import React, { useState, useEffect } from 'react';
import { Menu, AlertTriangle, CheckCircle, Clock, RefreshCw, Eye } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reportIssueApi } from '../../services/api';
import '../common/QuestionList.css';

const ReportsManagement = () => {
    const { toggleSidebar } = useOutletContext();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL | PENDING | RESOLVED

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await reportIssueApi.getAll();
            setReports(res.data.data || []);
        } catch (err) {
            toast.error('Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleResolve = async (id) => {
        try {
            await reportIssueApi.resolve(id);
            toast.success('Đã xử lý báo cáo!');
            fetchReports();
        } catch (err) {
            toast.error('Lỗi khi xử lý báo cáo');
        }
    };

    const formatDateTime = (isoStr) => {
        if (!isoStr) return '---';
        return new Date(isoStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredReports = reports.filter(r => filter === 'ALL' || r.trangThai === filter);
    const pendingCount = reports.filter(r => r.trangThai === 'PENDING').length;

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left">
                    <button className="mobile-toggle-btn" onClick={toggleSidebar}><Menu size={24} /></button>
                </div>
                <div className="top-bar-center"><span>Quản lý Báo cáo Vi phạm</span></div>
                <div className="top-bar-right">
                    <div className="user-indicator"><span className="indicator-text">Quản trị viên</span></div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Báo cáo từ Cố vấn học tập</h1>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                        <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '12px', display: 'flex' }}>
                            <AlertTriangle size={22} color="#dc2626" />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>{pendingCount}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Chờ xử lý</div>
                        </div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                        <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', display: 'flex' }}>
                            <CheckCircle size={22} color="#16a34a" />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>{reports.length - pendingCount}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Đã xử lý</div>
                        </div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                        <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '12px', display: 'flex' }}>
                            <AlertTriangle size={22} color="#0369a1" />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0369a1' }}>{reports.length}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Tổng báo cáo</div>
                        </div>
                    </div>
                </div>

                {/* Filter tabs + refresh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[{ key: 'ALL', label: 'Tất cả' }, { key: 'PENDING', label: 'Chờ xử lý' }, { key: 'RESOLVED', label: 'Đã xử lý' }].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                style={{
                                    padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                                    background: filter === tab.key ? '#0369a1' : '#f3f4f6',
                                    color: filter === tab.key ? '#fff' : '#374151',
                                    transition: 'all 0.15s'
                                }}
                            >{tab.label}</button>
                        ))}
                    </div>
                    <button onClick={fetchReports} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                        <RefreshCw size={14} /> Làm mới
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Đang tải...</div>
                    ) : filteredReports.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                            <AlertTriangle size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                            <p>Không có báo cáo nào</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                                    {['#', 'Hội thoại', 'CVHT báo cáo', 'Sinh viên bị báo cáo', 'Lý do', 'Thời gian', 'Trạng thái', 'Hành động'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((r, idx) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>{idx + 1}</td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                                            <div style={{ fontWeight: '600', color: '#0369a1' }}>#{r.conversationId}</div>
                                            {r.tieuDeConversation && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.tieuDeConversation}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                                            <div style={{ fontWeight: '500', color: '#374151' }}>{r.tenCv || '---'}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.maCv || ''}</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                                            <div style={{ fontWeight: '500', color: '#374151' }}>{r.tenSv || '---'}</div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{r.maSv || ''}</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '14px', maxWidth: '200px' }}>
                                            <span style={{ display: 'inline-block', background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                                {r.lyDo}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDateTime(r.thoiGianBaoCao)}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {r.trangThai === 'PENDING' ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                                    <Clock size={12} /> Chờ xử lý
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                                                    <CheckCircle size={12} /> Đã xử lý
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => navigate(`/admin/conversations/${r.conversationId}`)}
                                                    title="Xem hội thoại"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#374151' }}
                                                >
                                                    <Eye size={14} /> Xem
                                                </button>
                                                {r.trangThai === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleResolve(r.id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#16a34a', cursor: 'pointer', fontSize: '13px', color: '#fff', fontWeight: '500' }}
                                                    >
                                                        <CheckCircle size={14} /> Xử lý xong
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ReportsManagement;
