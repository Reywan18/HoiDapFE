import React, { useState } from 'react';
import { Upload, FileText, Send, CheckCircle, AlertCircle, Search } from 'lucide-react';
import api from '../../services/api';
import '../common/QuestionList.css';

const AiTraining = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState('');
    const [testing, setTesting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus({ type: '', message: '' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus({ type: 'error', message: 'Vui lòng chọn một tệp PDF trước!' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadStatus({ type: 'info', message: 'Đang xử lý và nạp tri thức vào ChromaDB... (Vui lòng đợi)' });

        try {
            // Special config for multipart/form-data
            const response = await api.post('/admin/ai/upload-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadStatus({
                type: 'success',
                message: response.data || 'Tệp đã được nạp thành công vào hệ thống tri thức AI!'
            });
            setFile(null); // Reset
        } catch (error) {
            console.error('Lỗi upload PDF:', error);
            setUploadStatus({
                type: 'error',
                message: error.response?.data || 'Lỗi khi xử lý tệp PDF. Vui lòng kiểm tra lại định dạng file.'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleTestKnowledge = async () => {
        if (!testQuery.trim()) return;

        setTesting(true);
        setTestResult('');
        try {
            const response = await api.get('/admin/ai/test-chroma', {
                params: { question: testQuery }
            });
            setTestResult(response.data);
        } catch (error) {
            setTestResult('Lỗi truy vấn: ' + (error.response?.data || error.message));
        } finally {
            setTesting(false);
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Huấn luyện AI</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Huấn luyện Tri thức Chatbot</h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '14px' }}>
                    Tải lên các tệp quy chế, hướng dẫn đào tạo định dạng PDF để AI học tập và hỗ trợ sinh viên chính xác hơn.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Upload Section */}
                    <div className="table-card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Upload size={20} color="#0284c7" /> Tải file mới
                        </h2>

                        <div
                            style={{
                                border: '2px dashed #e2e8f0',
                                borderRadius: '12px',
                                padding: '2.5rem',
                                textAlign: 'center',
                                backgroundColor: '#f8fafc',
                                marginBottom: '1.5rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('pdf-upload').click()}
                        >
                            <input
                                type="file"
                                id="pdf-upload"
                                hidden
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <FileText size={48} color="#94a3b8" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                            {file ? (
                                <p style={{ color: '#0f172a', fontWeight: '600' }}>{file.name}</p>
                            ) : (
                                <>
                                    <p style={{ color: '#0f172a', fontWeight: '500' }}>Click để chọn tệp PDF</p>
                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Chấp nhận định dạng .pdf (Tối đa 20MB)</p>
                                </>
                            )}
                        </div>

                        {uploadStatus.message && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: uploadStatus.type === 'success' ? '#065f46' : (uploadStatus.type === 'error' ? '#991b1b' : '#1e40af'),
                                backgroundColor: uploadStatus.type === 'success' ? '#ecfdf5' : (uploadStatus.type === 'error' ? '#fef2f2' : '#eff6ff'),
                                border: `1px solid ${uploadStatus.type === 'success' ? '#a7f3d0' : (uploadStatus.type === 'error' ? '#fecaca' : '#bfdbfe')}`
                            }}>
                                {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{uploadStatus.message}</span>
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.8rem', justifyContent: 'center' }}
                            disabled={!file || uploading}
                            onClick={handleUpload}
                        >
                            {uploading ? 'Đang nạp dữ liệu...' : 'Bắt đầu huấn luyện AI'}
                        </button>
                    </div>

                    {/* Sandbox Section */}
                    <div className="table-card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={20} color="#10b981" /> Kiểm thử (Sandbox)
                        </h2>

                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1rem' }}>
                            Đặt câu hỏi để kiểm tra xem AI có tìm thấy thông tin trong bộ nhớ ChromaDB hay không.
                        </p>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Nhập câu hỏi cần kiểm tra..."
                                style={{ flex: 1 }}
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTestKnowledge()}
                            />
                            <button
                                className="btn-secondary"
                                onClick={handleTestKnowledge}
                                disabled={testing || !testQuery.trim()}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: '#0f172a',
                            color: '#e2e8f0',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            minHeight: '230px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {testing ? (
                                <p style={{ color: '#94a3b8' }}>Đang kiểm tra...</p>
                            ) : testResult ? (
                                testResult
                            ) : (
                                <p style={{ color: '#475569' }}>Kết quả truy vấn tri thức sẽ hiển thị tại đây.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default AiTraining;
