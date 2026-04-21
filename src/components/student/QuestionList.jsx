import React, { useEffect, useState } from 'react';
import { Search, Plus, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../common/QuestionList.css';
import api, { userApi, conversationApi } from '../../services/api';

const QuestionList = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 0) fetchQuestions();
            else setPage(0);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const pRes = await userApi.getProfile();
            const maSv = pRes.data.data.maDinhDanh;

            if (!maSv) {
                console.error("Không tìm thấy maSv trong profile");
                return;
            }

            const response = await conversationApi.getStudentConversations(maSv, {
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status) => {
        switch (String(status).toUpperCase()) {
            case 'WAITING_FOR_CVHT': return 'pending';
            case 'CHATTING_WITH_CVHT': return 'processing';
            case 'CHATTING_WITH_BOT': return 'processing';
            case 'RESOLVED': return 'completed';
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'WAITING_FOR_CVHT': return 'Chờ phản hồi';
            case 'CHATTING_WITH_CVHT': return 'Đang trực tiếp';
            case 'CHATTING_WITH_BOT': return 'Với trợ lý ảo';
            case 'RESOLVED': return 'Đã giải quyết';
            default: return status;
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Câu hỏi của tôi</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Câu hỏi</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between' }}>
                    <div className="search-input-wrapper" style={{ width: '600px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={() => navigate('/sinhvien/new-question')}
                    >
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Đặt câu hỏi mới
                    </button>
                </div>

                <div className="table-card">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Chủ đề</th>
                                    <th>Ngày gửi</th>
                                    <th>Cập nhật cuối</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có câu hỏi nào.</td></tr>
                                ) : (
                                    questions.map((q, index) => (
                                        <tr
                                            key={q.id}
                                            onClick={() => navigate(`/sinhvien/question-detail/${q.id}`, { state: { title: q.tieuDe } })}
                                            style={{ cursor: 'pointer' }}
                                            className="question-row"
                                        >
                                            <td>{index + 1 + (page * 10)}</td>
                                            <td className="subject-cell">{q.tieuDe}</td>
                                            <td className="date-cell">{formatDate(q.ngayTao)}</td>
                                            <td className="update-cell">{formatDate(q.ngayCapNhatCuoi || q.ngayTao)}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(q.trangThai)}`}>
                                                    {getStatusLabel(q.trangThai)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    <div className="pagination">
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ margin: '0 10px', fontSize: '14px' }}>Trang {page + 1} / {totalPages || 1}</span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default QuestionList;
