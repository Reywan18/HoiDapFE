import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import api, { userApi, conversationApi } from '../../services/api';
import { Send, Paperclip, X, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import '../common/QuestionList.css';
import './NewQuestion.css';

const NewQuestion = () => {
    const { toggleSidebar } = useOutletContext();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('HOCTAP');
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cvhtInfo, setCvhtInfo] = useState('');
    const [errors, setErrors] = useState({});

    React.useEffect(() => {
        userApi.getProfile()
            .then(res => {
                if (res.data && res.data.data) {
                    const u = res.data.data;

                    if (u.tenCoVan && u.maCoVan) {
                        setCvhtInfo(`${u.maCoVan} - ${u.tenCoVan}`);
                    } else if (u.tenCoVan) {
                        setCvhtInfo(u.tenCoVan);
                    } else {
                        setCvhtInfo('⚠️ Chưa được phân công Cố vấn');
                    }
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
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Vui lòng nhập chủ đề câu hỏi.';
        if (!content.trim()) newErrors.content = 'Vui lòng nhập nội dung chi tiết.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Vui lòng kiểm tra lại các trường bị thiếu.');
            return;
        }
        
        setErrors({});

        setLoading(true);
        try {
            const requestData = {
                tieuDe: title,
                noiDung: content
            };

            const response = await conversationApi.createConversation(requestData);

            if (response.data && response.data.status === 200) {
                toast.success('Gửi câu hỏi thành công! Đang chuyển đến danh sách...');
                setTimeout(() => navigate('/sinhvien/my-question'), 1500);
            }
        } catch (error) {
            console.error('Lỗi khi gửi:', error);
            toast.error('Gửi thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
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
                    <span>Tạo câu hỏi mới</span>
                </div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Sinh viên</span>
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
                            style={errors.title ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                            placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors({...errors, title: ''});
                            }}
                        />
                        {errors.title && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
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
                            style={{ 
                                backgroundColor: cvhtInfo.includes('⚠️') ? '#fff1f2' : '#f8fafc', 
                                color: cvhtInfo.includes('⚠️') ? '#e11d48' : '#334155', 
                                fontWeight: 600,
                                border: cvhtInfo.includes('⚠️') ? '1px solid #fecdd3' : '1px solid #e2e8f0'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Nội dung chi tiết <span className="highlight">*</span></label>
                        <textarea
                            id="content"
                            className="form-textarea"
                            style={errors.content ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                            placeholder="Mô tả chi tiết thắc mắc của bạn..."
                            rows={8}
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                if (errors.content) setErrors({...errors, content: ''});
                            }}
                        ></textarea>
                        {errors.content && <span style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px', display: 'block' }}>{errors.content}</span>}
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
