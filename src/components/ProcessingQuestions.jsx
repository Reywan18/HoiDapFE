import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, CheckCircle, BookOpen, Layers, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuestionList.css';
import './CVHTQuestions.css';
import api from '../services/api';

const ProcessingQuestions = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('ANSWER');
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');
    const [majorFilter, setMajorFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    // Data for dropdowns
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [majors, setMajors] = useState([]);

    // Generate years list (e.g. 5 years back, 1 year forward)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i).reverse();

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [classRes, cohortRes, majorRes] = await Promise.all([
                    api.get('/classes'),
                    api.get('/classes/cohorts'),
                    api.get('/classes/majors')
                ]);

                if (classRes.data && classRes.data.data) setClasses(classRes.data.data);
                if (cohortRes.data && cohortRes.data.data) setCohorts(cohortRes.data.data);
                if (majorRes.data && majorRes.data.data) setMajors(majorRes.data.data);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchFilters();
        fetchQuestions();
    }, [page, statusFilter, classFilter, cohortFilter, majorFilter, yearFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuestions();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: 10,
                sort: 'ngayCapNhatCuoi,desc',
                maLop: classFilter,
                khoa: cohortFilter,
                chuyenNganh: majorFilter,
                nam: yearFilter,
                keyword: searchTerm
            };

            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            const response = await api.get('/questions', { params });
            if (response.data && response.data.data) {
                const pageData = response.data.data;
                setQuestions(pageData.content || []);
                setTotalPages(pageData.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleView = (id) => {
        navigate(`/cvht/question-detail/${id}`);
    };

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'Chờ duyệt';
            case 'PROCESSING': return 'Đang xử lý';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return 'Đã trả lời';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return '#f59e0b';
            case 'PROCESSING': return '#3b82f6';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Lịch sử trả lời</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Lịch sử trả lời</h1>

                {/* Filter Bar */}


                {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</p> : (
                    <>
                        <div className="questions-list">
                            {questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    Không có câu hỏi nào.
                                </div>
                            ) : (
                                questions.map((q) => (
                                    <div
                                        key={q.maCauHoi}
                                        className="question-card-horizontal"
                                        onClick={() => handleView(q.maCauHoi)}
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
                                            <div className="detail-row">
                                                <User size={14} />
                                                <span>{q.tenSinhVien || q.maSinhVien}</span>
                                            </div>
                                            <div className="detail-row">
                                                <CheckCircle size={14} color="#10b981" />
                                                <span>Cập nhật: {formatDate(q.ngayCapNhatCuoi || q.ngayGui)}</span>
                                            </div>
                                            <div className="detail-row highlight">
                                                <Users size={14} />
                                                <span>{q.maLop || '---'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <Layers size={14} />
                                                <span>{q.khoaHoc || '---'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <BookOpen size={14} />
                                                <span>{q.chuyenNganh || '---'}</span>
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

export default ProcessingQuestions;
