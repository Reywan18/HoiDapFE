import React, { useState, useEffect } from 'react';
import {
    Users, Search, Plus, Edit2, Trash2, X, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../common/QuestionList.css';
import api from '../../services/api';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [createMaSv, setCreateMaSv] = useState('');
    const [newAccountInfo, setNewAccountInfo] = useState(null); // To show generated password
    const [currentStudent, setCurrentStudent] = useState(null);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, classesRes] = await Promise.all([
                api.get(`/admin/users/students`, {
                    params: {
                        page: currentPage,
                        size: itemsPerPage,
                        keyword: searchTerm
                    }
                }),
                api.get('/admin/classes')
            ]);

            if (studentsRes.data.status === 200) {
                setStudents(studentsRes.data.data.content || []);
                setTotalPages(studentsRes.data.data.totalPages || 0);
            }
            if (classesRes.data.status === 200) {
                // Since classes API was changed to return page, we need content
                // Or if it's the new endpoint, classesRes.data.data.content
                setClasses(classesRes.data.data?.content || classesRes.data.data || []);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu sinh viên:', error);
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

    // --- Create Student ---
    const openCreateModal = () => {
        setCreateMaSv('');
        setNewAccountInfo(null);
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const computedEmail = `${createMaSv.toLowerCase()}@thanglong.edu.vn`;
            const res = await api.post('/admin/accounts/student', {
                maDinhDanh: createMaSv.toUpperCase(),
                email: computedEmail
            });
            if (res.data.status === 200) {
                setNewAccountInfo(res.data.data); // Shows email, password, defaultName
                fetchData();
                // We keep modal open to show password
            }
        } catch (error) {
            alert('Lỗi tạo sinh viên: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Edit Student (Profile update) ---
    const openEditModal = (sv) => {
        setCurrentStudent({
            maSv: sv.maSv,
            hoTen: sv.hoTen || '',
            email: sv.email || '',
            soDienThoai: sv.soDienThoai || '',
            maLop: sv.lop ? sv.lop.maLop : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Need to map maLop to a lop object expected by the backend
            const payload = {
                maSv: currentStudent.maSv,
                hoTen: currentStudent.hoTen,
                email: currentStudent.email,
                soDienThoai: currentStudent.soDienThoai,
                lop: currentStudent.maLop ? { maLop: currentStudent.maLop } : null
            };

            await api.put(`/admin/users/students/${currentStudent.maSv}`, payload);
            fetchData();
            setIsEditModalOpen(false);
        } catch (error) {
            alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- Delete Student ---
    const handleDelete = async (maSv) => {
        if (window.confirm(`Bạn có chắc muốn xóa sinh viên ${maSv}?`)) {
            try {
                await api.delete(`/admin/users/students/${maSv}`);
                fetchData();
            } catch (error) {
                alert('Lỗi xóa sinh viên (Có thể sinh viên này đã có dữ liệu câu hỏi).');
            }
        }
    };

    // Filter
    // Note: Since we use Server-Side Pagination and Searching, 
    // the backend will handle filtering and we will directly use students buffer.
    const displayedStudents = students;

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Quản Lý Sinh Viên</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Sinh Viên</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-input-wrapper" style={{ width: '400px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã sinh viên, họ tên, email..."
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
                            <Plus size={18} /> Tạo tài khoản SV
                        </button>
                    </div>
                </div>

                <div className="table-card">
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
                        Hiển thị <strong>{displayedStudents.length}</strong> sinh viên / Trang
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th>Mã SV</th>
                                    <th>Họ Tên</th>
                                    <th>Email</th>
                                    <th>Lớp Học</th>
                                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            Không tìm thấy sinh viên nào.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedStudents.map((sv) => (
                                        <tr key={sv.maSv} className="question-row">
                                            <td style={{ fontWeight: '600' }}>{sv.maSv}</td>
                                            <td>{sv.hoTen ? sv.hoTen : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Chưa cập nhật</span>}</td>
                                            <td>{sv.email}</td>
                                            <td>
                                                {sv.lop ? (
                                                    <span className="status-badge pending">{sv.lop.maLop}</span>
                                                ) : (
                                                    <span style={{ color: '#aaa', fontStyle: 'italic' }}>Không có lớp</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(sv); }}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '5px' }}
                                                    title="Khôi phục / Sửa"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(sv.maSv); }}
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

            {/* Modal Create via Email */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '450px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Tạo Tài Khoản Sinh Viên</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {!newAccountInfo ? (
                            <form onSubmit={handleCreateSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Nhập Mã Sinh Viên</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: A28123"
                                        value={createMaSv}
                                        onChange={(e) => setCreateMaSv(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', textTransform: 'uppercase' }}
                                    />
                                    {createMaSv && (
                                        <p style={{ fontSize: '13px', color: '#059669', marginTop: '8px', fontWeight: '500' }}>
                                            Email tạo ra: {createMaSv.toLowerCase()}@thanglong.edu.vn
                                        </p>
                                    )}
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                        Hệ thống sẽ tự động tạo email và mật khẩu ngẫu nhiên cho sinh viên.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                                    <button type="submit" className="btn-primary">Tạo Tài Khoản</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '15px' }}>
                                <h3 style={{ color: '#166534', margin: '0 0 15px 0', fontSize: '16px' }}>Thành công! Hãy gửi thông tin đăng nhập này cho SV:</h3>
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

            {/* Modal Edit */}
            {isEditModalOpen && currentStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>Sửa Thông Tin Sinh Viên</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Mã SV (Read-only)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={currentStudent.maSv}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#f9fafb' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Số Điện Thoại</label>
                                    <input
                                        type="text"
                                        value={currentStudent.soDienThoai}
                                        onChange={(e) => setCurrentStudent({ ...currentStudent, soDienThoai: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Họ và Tên</label>
                                <input
                                    type="text"
                                    required
                                    value={currentStudent.hoTen}
                                    onChange={(e) => setCurrentStudent({ ...currentStudent, hoTen: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={currentStudent.email}
                                    onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Gán Lớp Học</label>
                                <select
                                    value={currentStudent.maLop}
                                    onChange={(e) => setCurrentStudent({ ...currentStudent, maLop: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#fff' }}
                                >
                                    <option value="">-- Chưa có lớp --</option>
                                    {classes.map(cls => (
                                        <option key={cls.maLop} value={cls.maLop}>
                                            {cls.maLop} - {cls.chuyenNganh}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Hủy bỏ</button>
                                <button type="submit" className="btn-primary">Cập Nhật</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default StudentManagement;
