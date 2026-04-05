import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuestionList.css';
import './CVHTQuestions.css';
import { userApi, conversationApi } from '../services/api';

const PendingQuestions = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                // Get CVHT info
                const pRes = await userApi.getProfile();
                console.log("Raw pRes:", pRes);
                
                // Trường hợp api trả về ApiResponse bọc trong axios data
                // hoặc api interceptor đã unwrap dữ liệu
                const profile = pRes.data?.data || pRes.data;
                const maCv = profile?.maDinhDanh || profile?.maCv;

                if (!maCv) {
                    console.error("Không tìm thấy định danh CVHT. Response content:", pRes.data);
                    setLoading(false);
                    return;
                }

                // Gọi tới Conversation Controller
                const response = await conversationApi.getCvhtConversations(maCv, {
                    page: page,
                    size: 10
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

        fetchQuestions();
    }, [page]);

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
            case 'RESOLVED': return 'Đã đóng';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (String(status).toUpperCase()) {
            case 'WAITING_FOR_CVHT': return '#f59e0b';
            case 'CHATTING_WITH_CVHT': return '#3b82f6';
            case 'CHATTING_WITH_BOT': return '#6366f1';
            case 'RESOLVED': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Phòng Chat Hỗ Trợ</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Danh sách câu hỏi</h1>

                {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Đang tải phòng chat...</p> : (
                    <>
                        <div className="questions-list">
                            {questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    Không có phòng hỏi đáp nào.
                                </div>
                            ) : (
                                questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className="question-card-horizontal"
                                        onClick={() => handleView(q.id, q.tieuDe)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="card-header-flex">
                                            <h3 className="card-title-lg">{q.tieuDe}</h3>
                                            <div className="card-status-badge" style={{
                                                background: getStatusColor(q.trangThai),
                                                color: '#fff',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getStatusLabel(q.trangThai)}
                                            </div>
                                        </div>

                                        <div className="card-details-grid">
                                            <div className="detail-row highlight">
                                                <User size={14} />
                                                <span>Sinh viên: {q.tenSv || q.maSv}</span>
                                            </div>
                                            <div className="detail-row">
                                                <Clock size={14} />
                                                <span>Tạo lúc: {formatDate(q.ngayTao)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pagination" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                className="page-btn"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '14px', alignSelf: 'center' }}>Trang {page + 1} / {totalPages || 1}</span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default PendingQuestions;
