import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, Menu, Search, Filter } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import '../common/QuestionList.css';
import './CVHTQuestions.css';
import { userApi, conversationApi } from '../../services/api';

const PendingQuestions = () => {
    const { toggleSidebar } = useOutletContext();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('OPEN'); // Mặc định chỉ hiện tin chưa xong
    const [classFilter, setClassFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [classes, setClasses] = useState([]);
    const [maCv, setMaCv] = useState(null);

    // Initial load: get profile and classes
    useEffect(() => {
        const init = async () => {
            try {
                const pRes = await userApi.getProfile();
                const profile = pRes.data?.data || pRes.data;
                const code = profile?.maDinhDanh || profile?.maCv;
                if (code) {
                    setMaCv(code);
                    // Fetch classes for this advisor
                    const cRes = await conversationApi.getAdvisorClasses(code);
                    if (cRes.data && cRes.data.data) {
                        setClasses(cRes.data.data);
                    }
                }
            } catch (error) {
                console.error("Error initializing advisor data", error);
            }
        };
        init();
    }, []);

    const fetchQuestions = async () => {
        if (!maCv) return;
        setLoading(true);
        try {
            const response = await conversationApi.getCvhtConversations(maCv, {
                page: page,
                size: 10,
                trangThai: statusFilter,
                maLop: classFilter,
                keyword: searchTerm
            });

            if (response.data && response.data.data) {
                const pageData = response.data.data;
                setQuestions(pageData.content || []);
                setTotalPages(pageData.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchQuestions();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [page, statusFilter, classFilter, searchTerm, maCv]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN') + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleView = (id, title) => {
        navigate(`/cvht/question-detail/${id}`, { state: { title } });
    };

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'WAITING_FOR_CVHT': return 'Chờ tiếp nhận';
            case 'CHATTING_WITH_CVHT': return 'Đang hỗ trợ trực tiếp';
            case 'CHATTING_WITH_BOT': return 'SV đang chat Bot';
            case 'REPORTED': return 'Bị báo cáo';
            case 'RESOLVED': return 'Đã đóng';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (String(status).toUpperCase()) {
            case 'WAITING_FOR_CVHT': return '#f59e0b';
            case 'CHATTING_WITH_CVHT': return '#3b82f6';
            case 'CHATTING_WITH_BOT': return '#6366f1';
            case 'REPORTED': return '#dc2626';
            case 'RESOLVED': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left">
                    <button className="mobile-toggle-btn" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                </div>
                <div className="top-bar-center">
                    <span>Phòng chat hỗ trợ</span>
                </div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Cố vấn</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Quản lý Hội thoại</h1>

                {/* Filters Area */}
                <div className="filters-bar" style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginBottom: '2rem', 
                    flexWrap: 'wrap',
                    background: '#fff',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div className="filter-item" style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm theo tiêu đề, tên sinh viên..." 
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value); setPage(0);}}
                            style={{ 
                                width: '100%', 
                                padding: '10px 12px 10px 40px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={16} color="#64748b" />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => {setStatusFilter(e.target.value); setPage(0);}}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#fff', minWidth: '160px' }}
                        >
                            <option value="OPEN">Chưa hoàn thành</option>
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="WAITING_FOR_CVHT">Chờ tiếp nhận</option>
                            <option value="CHATTING_WITH_CVHT">Đang hỗ trợ</option>
                            <option value="REPORTED">Bị báo cáo</option>
                            <option value="RESOLVED">Đã đóng</option>
                        </select>
                    </div>

                    <div className="filter-item">
                        <select 
                            value={classFilter} 
                            onChange={(e) => {setClassFilter(e.target.value); setPage(0);}}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#fff', minWidth: '140px' }}
                        >
                            <option value="ALL">Tất cả lớp</option>
                            {classes.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Đang tải phòng chat...</p> : (
                    <>
                        <div className="questions-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                            {questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', gridColumn: '1/-1', background: '#fff', borderRadius: '12px' }}>
                                    Không có phòng hỏi đáp nào khớp với bộ lọc.
                                </div>
                            ) : (
                                questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className="question-card-horizontal"
                                        onClick={() => handleView(q.id, q.tieuDe)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            margin: 0, 
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                                            <h3 className="card-title-lg" style={{ margin: 0, fontSize: '1rem', lineHeight: '1.4', flex: 1 }}>{q.tieuDe}</h3>
                                            <div className="card-status-badge" style={{
                                                background: getStatusColor(q.trangThai),
                                                color: '#fff',
                                                padding: '0.25rem 0.6rem',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getStatusLabel(q.trangThai)}
                                            </div>
                                        </div>

                                        <div className="card-details-grid" style={{ marginTop: 'auto' }}>
                                            <div className="detail-row highlight" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                                <User size={14} color="#3b82f6" />
                                                <span style={{ fontWeight: 600 }}>{q.tenSv || q.maSv}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>• {q.maLopSv}</span>
                                            </div>
                                            <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                                <Clock size={14} />
                                                <span>Cập nhật: {formatDate(q.ngayCapNhatCuoi || q.ngayTao)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pagination" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
                            <button
                                className="page-btn"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                style={{ 
                                    padding: '8px', 
                                    borderRadius: '50%', 
                                    border: '1px solid #e2e8f0', 
                                    background: page === 0 ? '#f8fafc' : '#fff',
                                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>Trang {page + 1} / {totalPages || 1}</span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                style={{ 
                                    padding: '8px', 
                                    borderRadius: '50%', 
                                    border: '1px solid #e2e8f0', 
                                    background: page >= totalPages - 1 ? '#f8fafc' : '#fff',
                                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default PendingQuestions;

