import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../common/QuestionList.css'; 
import api from '../../services/api';

const QuestionManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/admin/questions`, {
                params: {
                    page: currentPage,
                    size: itemsPerPage,
                    keyword: searchTerm
                }
            });
            
            if (result.data.status === 200) {
                setQuestions(result.data.data.content || []);
                setTotalPages(result.data.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu Câu hỏi:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300);
        
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm]);

    // Handlers
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleViewDetail = (id) => {
        navigate(`/admin/question-detail/${id}`);
    };

    // --- Edit Question ---
    const openEditModal = (q) => {
        setCurrentQuestion({
            id: q.id,
            tieuDe: q.tieuDe || '',
            trangThai: q.trangThai || 'CHUA_XU_LY'
            // We can add CVHT changing here if we build an advisor select list
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/questions/${currentQuestion.id}`, {
                tieuDe: currentQuestion.tieuDe,
                trangThai: currentQuestion.trangThai
            });
            alert('Cập nhật trạng thái câu hỏi thành công!');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Delete Question ---
    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn Câu hỏi #${id} cùng tất cả tin nhắn bên trong? Hành động này không thể hoàn tác.`)) {
            try {
                await api.delete(`/admin/questions/${id}`);
                fetchData();
            } catch (error) {
                alert('Lỗi xóa câu hỏi: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'CHUA_XU_LY': return 'Chưa xử lý';
            case 'DANG_XU_LY': return 'Đang trả lời';
            case 'DA_DONG': return 'Đã đóng';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'CHUA_XU_LY': return 'pending';
            case 'DANG_XU_LY': return 'processing';
            case 'DA_DONG': return 'closed';
            default: return '';
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Quản Lý Câu Hỏi</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Câu Hỏi / Sự Cố</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-input-wrapper" style={{ width: '450px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, tên sinh viên hoặc tên CVHT..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="table-card">
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
                        Hiển thị <strong>{questions.length}</strong> Câu hỏi / Trang
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th>Mã CH</th>
                                    <th>Tiêu Đề</th>
                                    <th>Người Đặt Hỏi (SV)</th>
                                    <th>Người Tiếp Nhận (CVHT)</th>
                                    <th>Trạng Thái</th>
                                    <th style={{ textAlign: 'center' }}>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                            Không tìm thấy Câu hỏi nào khớp hệ thống.
                                        </td>
                                    </tr>
                                ) : (
                                    questions.map((q) => (
                                        <tr key={q.id} className="question-row">
                                            <td style={{ fontWeight: '600', color: '#0369a1' }}>#{q.id}</td>
                                            <td style={{ fontWeight: '500', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {q.tieuDe}
                                            </td>
                                            <td>
                                                <div><strong>{q.tenSv}</strong></div>
                                                <div style={{fontSize: '12px', color: '#6b7280'}}>{q.maSv} - {q.maLopSv}</div>
                                            </td>
                                            <td>
                                                {q.tenCv ? (
                                                    <>
                                                        <div><strong>{q.tenCv}</strong></div>
                                                        <div style={{fontSize: '12px', color: '#6b7280'}}>{q.maCv}</div>
                                                    </>
                                                ) : (
                                                    <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Chưa có CVHT</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(q.trangThai)}`}>
                                                    {getStatusText(q.trangThai)}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleViewDetail(q.id)}
                                                    style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '5px' }}
                                                    title="Xem Chi Tiết Mật Đoạn Chat"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(q)}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '5px', marginLeft: '8px' }}
                                                    title="Sửa Thông Tin / Trạng Thái"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '5px', marginLeft: '8px' }}
                                                    title="Xóa Câu Hỏi"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                    
                    {!loading && totalPages > 1 && (
                        <div className="pagination" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem' }}>
                            <button
                                className="page-btn"
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '14px', alignSelf: 'center' }}>Trang {currentPage + 1} / {totalPages}</span>
                            <button
                                className="page-btn"
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edit Question Info */}
            {isEditModalOpen && currentQuestion && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
                                Điều Chỉnh Câu Hỏi: <span style={{color: '#0369a1'}}>#{currentQuestion.id}</span>
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Tiêu Đề Nhận Diện</label>
                                <input
                                    type="text"
                                    required
                                    value={currentQuestion.tieuDe}
                                    onChange={(e) => setCurrentQuestion({...currentQuestion, tieuDe: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Trạng Thái Giao Dịch</label>
                                <select
                                    value={currentQuestion.trangThai}
                                    onChange={(e) => setCurrentQuestion({...currentQuestion, trangThai: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#fff' }}
                                >
                                    <option value="CHUA_XU_LY">Chưa Xử Lý (Mở Mới)</option>
                                    <option value="DANG_XU_LY">Đang Phản Hồi</option>
                                    <option value="DA_DONG">Đã Đóng (Kết Thúc)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                                <button type="submit" className="btn-primary">Áp Dụng Chỉnh Sửa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default QuestionManagement;
