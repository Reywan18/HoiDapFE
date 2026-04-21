import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import '../common/QuestionList.css';
import api from '../../services/api';

const CVHTManagement = () => {
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [createMaCv, setCreateMaCv] = useState('');
    const [newAccountInfo, setNewAccountInfo] = useState(null);
    const [currentAdvisor, setCurrentAdvisor] = useState(null);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await api.get(`/admin/users/cvht`, {
                params: {
                    page: currentPage,
                    size: itemsPerPage,
                    keyword: searchTerm
                }
            });

            if (result.data.status === 200) {
                setAdvisors(result.data.data.content || []);
                setTotalPages(result.data.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu CVHT:', error);
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

    // --- Create CVHT ---
    const openCreateModal = () => {
        setCreateMaCv('');
        setNewAccountInfo(null);
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const computedEmail = `${createMaCv.toLowerCase()}@thanglong.edu.vn`;
            const res = await api.post('/admin/accounts/cvht', {
                maDinhDanh: createMaCv.toUpperCase(),
                email: computedEmail
            });
            if (res.data.status === 200) {
                setNewAccountInfo(res.data.data);
                fetchData();
            }
        } catch (error) {
            alert('Lỗi tạo CVHT: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Edit CVHT ---
    const openEditModal = (cv) => {
        setCurrentAdvisor({
            id: cv.maCv,
            hoTen: cv.hoTen || '',
            soDienThoai: cv.soDienThoai || '',
            chuyenMon: cv.chuyenMon || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/cvht/${currentAdvisor.id}`, {
                hoTen: currentAdvisor.hoTen,
                soDienThoai: currentAdvisor.soDienThoai,
                chuyenMon: currentAdvisor.chuyenMon
            });
            alert('Cập nhật thành công!');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Delete CVHT ---
    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa hệ thống tài khoản CVHT ${id}? Hành động này không thể hoàn tác.`)) {
            try {
                await api.delete(`/admin/users/cvht/${id}`);
                fetchData();
            } catch (error) {
                alert('Lỗi xóa CVHT: Đảm bảo Cố vấn này không được trỏ đến Lớp học nào.');
            }
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Quản Lý CVHT</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Cố Vấn Học Tập</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-input-wrapper" style={{ width: '400px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã CV, họ tên hoặc email..."
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
                            <Plus size={18} /> Tạo Tài khoản CVHT
                        </button>
                    </div>
                </div>

                <div className="table-card">
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
                        Hiển thị <strong>{advisors.length}</strong> Cố Vấn / Trang
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th>Mã CVHT</th>
                                    <th>Họ Tên</th>
                                    <th>Email</th>
                                    <th>Chuyên Môn</th>
                                    <th>SĐT</th>
                                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advisors.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                            Không tìm thấy CVHT nào.
                                        </td>
                                    </tr>
                                ) : (
                                    advisors.map((cv) => (
                                        <tr key={cv.maCv} className="question-row">
                                            <td style={{ fontWeight: '600', color: '#0369a1' }}>{cv.maCv}</td>
                                            <td style={{ fontWeight: '600' }}>{cv.hoTen.toUpperCase()}</td>
                                            <td>{cv.email}</td>
                                            <td>
                                                {cv.chuyenMon ? <span className="status-badge processing">{cv.chuyenMon}</span> : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa cập nhật</span>}
                                            </td>
                                            <td>{cv.soDienThoai || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={() => openEditModal(cv)}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '5px' }}
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cv.maCv)}
                                                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '5px', marginLeft: '10px' }}
                                                    title="Xóa"
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

            {/* Modal Create */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '450px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
                                Tạo Tài Khoản CVHT
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {!newAccountInfo ? (
                            <form onSubmit={handleCreateSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Nhập Mã CVHT</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: B888"
                                        value={createMaCv}
                                        onChange={(e) => setCreateMaCv(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', textTransform: 'uppercase' }}
                                    />
                                    {createMaCv && (
                                        <p style={{ fontSize: '13px', color: '#059669', marginTop: '8px', fontWeight: '500' }}>
                                            Email tạo ra: {createMaCv.toLowerCase()}@thanglong.edu.vn
                                        </p>
                                    )}
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        Hệ thống sẽ tự động tạo email và mật khẩu ngẫu nhiên cho cán bộ.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                                    <button type="submit" className="btn-primary">Tạo Tài Khoản</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '15px' }}>
                                <h3 style={{ color: '#166534', margin: '0 0 15px 0', fontSize: '16px' }}>Thành công! Hãy gửi thông tin đăng nhập này cho Cán bộ:</h3>
                                <div style={{ marginBottom: '10px' }}><strong>Email Đăng Nhập:</strong> {newAccountInfo.email}</div>
                                <div style={{ marginBottom: '10px' }}><strong>Mật Khẩu Ngẫu Nhiên:</strong></div>
                                <div style={{ marginBottom: '10px', fontSize: '18px', padding: '10px', backgroundColor: '#fff', border: '1px dashed #22c55e', color: '#000', fontWeight: 'bold', textAlign: 'center' }}>
                                    {newAccountInfo.generatedPassword}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                    <button onClick={() => setIsCreateModalOpen(false)} className="btn-primary">Hoàn tất</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Edit CVHT Info */}
            {isEditModalOpen && currentAdvisor && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
                                Cập Nhật Thông Tin: <span style={{ color: '#0369a1' }}>{currentAdvisor.id}</span>
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Họ Tên</label>
                                <input
                                    type="text"
                                    required
                                    value={currentAdvisor.hoTen}
                                    onChange={(e) => setCurrentAdvisor({ ...currentAdvisor, hoTen: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Chuyên Môn</label>
                                <input
                                    type="text"
                                    placeholder="Khoa CNTT, Phân tích dữ liệu..."
                                    value={currentAdvisor.chuyenMon}
                                    onChange={(e) => setCurrentAdvisor({ ...currentAdvisor, chuyenMon: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Số điện thoại</label>
                                <input
                                    type="text"
                                    value={currentAdvisor.soDienThoai}
                                    onChange={(e) => setCurrentAdvisor({ ...currentAdvisor, soDienThoai: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                                <button type="submit" className="btn-primary">Lưu Thay Đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default CVHTManagement;
