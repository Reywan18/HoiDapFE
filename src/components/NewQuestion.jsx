import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { userApi, conversationApi } from '../services/api';
import { Send, Paperclip, X } from 'lucide-react';
import './QuestionList.css'; // Common styles
import './NewQuestion.css';

const NewQuestion = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('HOCTAP'); // Default domain/field
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cvhtInfo, setCvhtInfo] = useState('');

    React.useEffect(() => {
        // Fetch current user profile to get CVHT info via the new API
        userApi.getProfile()
            .then(res => {
                if (res.data && res.data.data) {
                    const u = res.data.data;

                    // --- PHẦN SỬA ĐỔI: Map đúng field theo API mới ---
                    if (u.tenCoVan && u.maCoVan) {
                        setCvhtInfo(`${u.maCoVan} - ${u.tenCoVan}`);
                    } else if (u.tenCoVan) {
                        setCvhtInfo(u.tenCoVan);
                    } else {
                        setCvhtInfo('Chưa có Cố vấn học tập');
                    }
                    // ------------------------------------------------
                }
            })
            .catch(err => {
                console.error("Error fetching profile", err);
                setCvhtInfo('Không thể lấy thông tin CVHT');
            });
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
            return;
        }

        setLoading(true);
        try {
            const requestData = {
                tieuDe: title,
                noiDung: content
            };

            const response = await conversationApi.createConversation(requestData);

            if (response.data && response.data.status === 200) {
                // Điều hướng thẳng tới màn hình Chat vừa tạo
                navigate(`/sinhvien/question-detail/${response.data.data.id}`, { 
                    state: { title: title } 
                });
            }
        } catch (error) {
            console.error('Lỗi khi gửi:', error);
            alert('Gửi thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Tạo câu hỏi mới</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Gửi câu hỏi mới</h1>

                <div className="form-card">
                    <div className="form-group">
                        <label htmlFor="title">Chủ đề câu hỏi <span className="highlight">*</span></label>
                        <input
                            type="text"
                            id="title"
                            className="form-input"
                            placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="department">Lĩnh vực</label>
                        <select
                            id="department"
                            className="form-input"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="HOCTAP">Học tập</option>
                            <option value="DANGKYTINCHI">Đăng ký tín chỉ</option>
                            <option value="HP_HOCPHI">Học phí</option>
                            <option value="KHAC">Khác</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Gửi đến</label>
                        <input
                            type="text"
                            className="form-input"
                            value={cvhtInfo}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} // Lighter gray
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Nội dung chi tiết <span className="highlight">*</span></label>
                        <textarea
                            id="content"
                            className="form-textarea"
                            placeholder="Mô tả chi tiết thắc mắc của bạn..."
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Đính kèm tệp</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="file-upload"
                                className="file-input"
                                onChange={handleFileChange}
                                hidden
                            />
                            <label htmlFor="file-upload" className="file-label">
                                <Paperclip size={18} />
                                <span>{selectedFile ? selectedFile.name : 'Chọn tệp tin (Hình ảnh, PDF, Word...)'}</span>
                            </label>
                            {selectedFile && (
                                <button onClick={() => setSelectedFile(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={16} color="red" />
                                </button>
                            )}
                            <span className="file-help">Tối đa 10MB</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => { setTitle(''); setContent(''); }}>Hủy bỏ</button>
                        <button className="btn-primary btn-submit" onClick={handleSubmit} disabled={loading}>
                            <Send size={18} />
                            {loading ? 'Đang gửi...' : 'Gửi câu hỏi'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default NewQuestion;
