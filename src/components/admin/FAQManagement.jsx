import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import '../common/QuestionList.css';
import api from '../../services/api';

const FAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const initialFaqState = {
        chuDe: '',
        tieuDe: '',
        noiDung: '',
        khoaVien: '',
        khoaHoc: '',
        namHoc: ''
    };
    const [currentFaq, setCurrentFaq] = useState(initialFaqState);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/admin/faqs`, {
                params: {
                    page: currentPage,
                    size: itemsPerPage,
                    keyword: searchTerm
                }
            });

            if (result.data.status === 200) {
                setFaqs(result.data.data.content || []);
                setTotalPages(result.data.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu FAQ:', error);
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

    // --- Create FAQ ---
    const openCreateModal = () => {
        setCurrentFaq(initialFaqState);
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/admin/faqs', currentFaq);
            if (res.data.status === 200) {
                alert('Tạo FAQ thành công!');
                setIsCreateModalOpen(false);
                fetchData();
            }
        } catch (error) {
            alert('Lỗi tạo FAQ: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Edit FAQ ---
    const openEditModal = (faq) => {
        setCurrentFaq({
            maFaq: faq.maFaq,
            chuDe: faq.chuDe || '',
            tieuDe: faq.tieuDe || '',
            noiDung: faq.noiDung || '',
            khoaVien: faq.khoaVien || '',
            khoaHoc: faq.khoaHoc || '',
            namHoc: faq.namHoc || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/faqs/${currentFaq.maFaq}`, currentFaq);
            alert('Cập nhật thành công!');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Delete FAQ ---
    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bản ghi FAQ #${id}?`)) {
            try {
                await api.delete(`/admin/faqs/${id}`);
                fetchData();
            } catch (error) {
                alert('Lỗi xóa FAQ: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Quản Lý FAQ</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title"> Danh sách FAQ</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-input-wrapper" style={{ width: '450px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung FAQ..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-primary"
                            onClick={openCreateModal}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Thêm FAQ Mới
                        </button>
                    </div>
                </div>

                <div className="table-card">
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
                        Hiển thị <strong>{faqs.length}</strong> / Trang
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Mã FAQ</th>
                                    <th>Chủ Đề</th>
                                    <th style={{ width: '40%' }}>Nội Dung Tóm Tắt</th>
                                    <th>Khoa Viện</th>
                                    <th style={{ textAlign: 'center' }}>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faqs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            Chưa có bài viết FAQ nào trong hệ thống.
                                        </td>
                                    </tr>
                                ) : (
                                    faqs.map((faq) => (
                                        <tr key={faq.maFaq} className="question-row">
                                            <td style={{ fontWeight: '600', color: '#0369a1' }}>#{faq.maFaq}</td>
                                            <td>
                                                <span className="status-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                                    {faq.chuDe || 'Chung'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{faq.tieuDe}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {faq.noiDung}
                                                </div>
                                            </td>
                                            <td>{faq.khoaVien || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => openEditModal(faq)}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '5px' }}
                                                    title="Sửa FAQ"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq.maFaq)}
                                                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '5px', marginLeft: '10px' }}
                                                    title="Xóa FAQ"
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

            {/* Modal CRUD FAQ */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '700px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
                                {isCreateModalOpen ? 'Soạn Thảo FAQ Mới' : `Sửa FAQ #${currentFaq.maFaq}`}
                            </h2>
                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSubmit}>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Tiêu đề (Câu hỏi)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Quy định nộp học phí muộn như thế nào?"
                                    value={currentFaq.tieuDe}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, tieuDe: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Nội dung trả lời</label>
                                <textarea
                                    required
                                    placeholder="Nhập thông tin hướng dẫn..."
                                    value={currentFaq.noiDung}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, noiDung: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', minHeight: '150px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Chủ Đề (Phân Loại)</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Học Vụ, Học Phí..."
                                        value={currentFaq.chuDe}
                                        onChange={(e) => setCurrentFaq({ ...currentFaq, chuDe: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Khoa / Viện Dành Riêng</label>
                                    <input
                                        type="text"
                                        placeholder="VD: Khoa CNTT (Để trống nếu dùng chung)"
                                        value={currentFaq.khoaVien}
                                        onChange={(e) => setCurrentFaq({ ...currentFaq, khoaVien: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Khóa Học (K)</label>
                                    <input
                                        type="text"
                                        placeholder="VD: K35, K36..."
                                        value={currentFaq.khoaHoc}
                                        onChange={(e) => setCurrentFaq({ ...currentFaq, khoaHoc: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Năm Học</label>
                                    <input
                                        type="text"
                                        placeholder="VD: 2024-2025"
                                        value={currentFaq.namHoc}
                                        onChange={(e) => setCurrentFaq({ ...currentFaq, namHoc: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="btn-secondary">Đóng</button>
                                <button type="submit" className="btn-primary">
                                    {isCreateModalOpen ? 'Lưu Bài Viết Này' : 'Cập Nhật Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default FAQManagement;
