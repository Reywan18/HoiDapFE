import React, { useState, useEffect, useRef } from 'react';
import {
    BookOpen, Search, Plus, Edit2, Trash2,
    Upload, Download, X, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import '../common/QuestionList.css';
import api from '../../services/api';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentClass, setCurrentClass] = useState({
        maLop: '',
        khoaHoc: '',
        chuyenNganh: '',
        maCvht: ''
    });

    const fileInputRef = useRef(null);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [classesRes, advisorsRes] = await Promise.all([
                api.get('/admin/classes', {
                    params: {
                        page: currentPage,
                        size: itemsPerPage,
                        keyword: searchTerm
                    }
                }),
                api.get('/admin/users/cvht') // Fetch CVHT list for dropdown
            ]);

            console.log("classesRes:", classesRes.data);
            console.log("advisorsRes:", advisorsRes.data);

            if (classesRes.data.status === 200) {
                setClasses(classesRes.data.data?.content || classesRes.data.data || []);
                setTotalPages(classesRes.data.data?.totalPages || 0);
            }
            if (advisorsRes.data.status === 200) {
                setAdvisors(advisorsRes.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu lớp:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300); // debounce search
        
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm]);

    // Handlers
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page when searching
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setCurrentClass({ maLop: '', khoaHoc: '', chuyenNganh: '', maCvht: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (cls) => {
        setIsEditMode(true);
        setCurrentClass({
            maLop: cls.maLop,
            khoaHoc: cls.khoaHoc,
            chuyenNganh: cls.chuyenNganh,
            maCvht: cls.cvht ? cls.cvht.maCv : ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/admin/classes/${currentClass.maLop}`, currentClass);
            } else {
                await api.post('/admin/classes', currentClass);
            }
            fetchData();
            closeModal();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (maLop) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa lớp ${maLop}?`)) {
            try {
                await api.delete(`/admin/classes/${maLop}`);
                fetchData();
            } catch (error) {
                alert('Lỗi khi xóa lớp. Đảm bảo lớp không có sinh viên trước khi xóa.');
            }
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/admin/classes/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Nhập dữ liệu thành công!');
            fetchData();
        } catch (error) {
            alert('Lỗi import: ' + (error.response?.data?.message || 'Kiểm tra lại định dạng file Excel (.xlsx)'));
        }
        e.target.value = null; // Reset input
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get('/admin/classes/export', { responseType: 'blob' });
            // Create blob link to download
            const date = new Date();
            const fileName = `danh_sach_lop_${date.getMonth() + 1}_${date.getFullYear()}.xlsx`;
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Lỗi khi xuất excel:', error);
            alert('Lỗi xuất file Excel!');
        }
    };

    // Filter classes
    // Note: Since we use Server-Side Pagination and Searching, 
    // the backend will handle filtering and we will directly use classes buffer.
    const displayedClasses = classes;

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Quản Lý Lớp Học</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Lớp</h1>

                <div className="controls-area" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="search-input-wrapper" style={{ width: '400px', maxWidth: '100%' }}>
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã lớp, chuyên ngành..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => fileInputRef.current.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Upload size={18} /> Import
                        </button>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImportExcel}
                        />

                        <button
                            className="btn-secondary"
                            onClick={handleExportExcel}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Download size={18} /> Export
                        </button>

                        <button
                            className="btn-primary"
                            onClick={openCreateModal}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Thêm Lớp
                        </button>
                    </div>
                </div>

                <div className="table-card">
                    <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#666' }}>
                        Hiển thị <strong>{displayedClasses.length}</strong> lớp / Trang
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th>Mã Lớp</th>
                                    <th>Chuyên Ngành</th>
                                    <th>Khóa Học</th>
                                    <th>Cố Vấn Học Tập</th>
                                    <th style={{ textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            Không tìm thấy lớp nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedClasses.map((cls) => (
                                        <tr key={cls.maLop} className="question-row">
                                            <td style={{ fontWeight: '600' }}>{cls.maLop}</td>
                                            <td>{cls.chuyenNganh}</td>
                                            <td>
                                                <span className="status-badge processing">{cls.khoaHoc}</span>
                                            </td>
                                            <td>
                                                {cls.cvht ? (
                                                    <span style={{ fontWeight: 'bold' }}>{cls.cvht.hoTen.toUpperCase()} - {cls.cvht.maCv}</span>
                                                ) : (
                                                    <span style={{ color: '#aaa', fontStyle: 'italic' }}>Chưa phân công</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(cls); }}
                                                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '5px' }}
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(cls.maLop); }}
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

            {/* Modal Creates/Edits */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937' }}>
                                {isEditMode ? 'Cập Nhật Lớp' : 'Thêm Lớp Mới'}
                            </h2>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Mã Lớp *</label>
                                <input
                                    type="text"
                                    required
                                    readOnly={isEditMode}
                                    placeholder="VD: TT34CL01"
                                    value={currentClass.maLop}
                                    onChange={(e) => setCurrentClass({ ...currentClass, maLop: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: isEditMode ? '#f9fafb' : '#fff' }}
                                />
                                {isEditMode && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>Không thể thay đổi mã lớp sau khi tạo.</p>}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Chuyên Ngành *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Hệ thống thông tin..."
                                        value={currentClass.chuyenNganh}
                                        onChange={(e) => setCurrentClass({ ...currentClass, chuyenNganh: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Khóa Học *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VD: K34"
                                        value={currentClass.khoaHoc}
                                        onChange={(e) => setCurrentClass({ ...currentClass, khoaHoc: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Cố Vấn Học Tập</label>
                                <select
                                    value={currentClass.maCvht}
                                    onChange={(e) => setCurrentClass({ ...currentClass, maCvht: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#fff' }}
                                >
                                    <option value="">-- Chọn Cố Vấn Học Tập --</option>
                                    {advisors.map(adv => (
                                        <option key={adv.maCv} value={adv.maCv}>
                                            {adv.hoTen} ({adv.maCv})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn-secondary"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ClassManagement;
