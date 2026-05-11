import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Paperclip, User, Mail, Phone, MapPin, Copy, Check, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationApi, userApi, reportIssueApi } from '../../services/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import './QuestionDetail.css';

const QuestionDetail = () => {
    const { id: questionId } = useParams();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const [copyStatus, setCopyStatus] = useState({ email: false, phone: false });
    const [myId, setMyId] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCustomText, setReportCustomText] = useState('');

    const messagesEndRef = useRef(null);
    const clientRef = useRef(null);
    const fileInputRef = useRef(null);

    const role = localStorage.getItem('role') || 'student';
    const mySenderType = role === 'cvht' ? 'CVHT' : 'SINH_VIEN';

    useEffect(() => {
        const fetchMyInfo = async () => {
            try {
                const res = await userApi.getProfile();
                const profile = res.data?.data || res.data;
                setMyId(profile?.maDinhDanh || profile?.maCv || profile?.maSv);
            } catch (error) {
                console.error("Lỗi lấy thông tin định danh cá nhân:", error);
            }
        };

        if (questionId) {
            fetchMyInfo();
            fetchConversationDetail();
            fetchMessages();
            connectWebSocket();
        }

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [questionId]);

    const fetchConversationDetail = async () => {
        try {
            const res = await conversationApi.getConversationDetail(questionId);
            if (res.data && res.data.status === 200) {
                setConversation(res.data.data);
            }
        } catch (error) {
            console.error('Lỗi tải thông tin cuộc hội thoại:', error);
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await conversationApi.getMessages(questionId);
            if (res.data && res.data.status === 200) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử tin nhắn:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 2000,
            onConnect: () => {
                console.log('Đã kết nối WebSockets');
                client.subscribe(`/topic/conversation/${questionId}`, (message) => {
                    const newMsg = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMsg]);
                });
            },
            onStompError: (frame) => {
                console.error('Lỗi WebSocketBroker: ', frame);
            },
        });
        client.activate();
        clientRef.current = client;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputMessage.trim() && !selectedFile) return;

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('senderId', myId || (role === 'cvht' ? conversation?.maCv : conversation?.maSv) || "Unknown");
            formData.append('senderType', mySenderType);
            if (inputMessage.trim()) {
                formData.append('content', inputMessage);
            }

            try {
                toast.loading("Đang gửi tin nhắn đính kèm...", { id: 'uploadFile' });
                await conversationApi.uploadFile(questionId, formData);
                toast.success("Đã gửi thành công", { id: 'uploadFile' });
                setInputMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (error) {
                console.error('Lỗi upload:', error);
                toast.error("Lỗi khi gửi tệp", { id: 'uploadFile' });
            }
        } else if (clientRef.current && clientRef.current.connected) {
            const payload = {
                conversationId: questionId,
                senderId: myId || (role === 'cvht' ? conversation?.maCv : conversation?.maSv) || "Unknown",
                senderType: mySenderType,
                content: inputMessage
            };

            clientRef.current.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(payload)
            });

            setInputMessage('');
        } else {
            console.log('Chưa kết nối server.');
        }
    };

    const handleCopy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopyStatus(prev => ({ ...prev, [type]: true }));
        setTimeout(() => setCopyStatus(prev => ({ ...prev, [type]: false })), 2000);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleResolve = async () => {
        setIsResolveModalOpen(true);
    };

    const handleDownload = async (messageId, fileName) => {
        try {
            toast.loading("Đang chuẩn bị tệp...", { id: `download-${messageId}` });
            const response = await conversationApi.downloadFile(messageId);
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Đã tải xuống", { id: `download-${messageId}` });
        } catch (error) {
            console.error("Lỗi khi tải tệp:", error);
            toast.error("Không thể tải tệp", { id: `download-${messageId}` });
        }
    };

    const confirmResolve = async () => {
        try {
            const res = await conversationApi.resolveConversation(questionId);
            if (res.data && res.data.status === 200) {
                toast.success("Đã hoàn thành câu hỏi!");
                setIsResolveModalOpen(false);
                if (role === 'cvht') {
                    navigate('/cvht/pending');
                } else {
                    fetchConversationDetail(); 
                }
            }
        } catch (error) {
            console.error('Lỗi khi hoàn thành câu hỏi:', error);
            toast.error("Có lỗi xảy ra khi hoàn thành câu hỏi.");
        }
    };

    const handleReport = () => {
        setReportReason('');
        setReportCustomText('');
        setIsReportModalOpen(true);
    };

    const handleSubmitReport = async () => {
        const finalReason = reportReason === 'Khác' ? reportCustomText : reportReason;
        if (!finalReason.trim()) {
            toast.error('Vui lòng chọn lý do báo cáo!');
            return;
        }
        try {
            await reportIssueApi.submitReport(questionId, finalReason);
            toast.success('Đã gửi báo cáo thành công! Admin sẽ xem xét sớm.');
            setIsReportModalOpen(false);
            fetchConversationDetail(); // Cập nhật lại trạng thái conversation
        } catch (err) {
            toast.error('Không thể gửi báo cáo: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải lịch sử trò chuyện...</div>;

    const isResolved = conversation?.trangThai === 'RESOLVED';
    const isReported = conversation?.trangThai === 'REPORTED';
    const isReadOnly = isResolved || isReported || role === 'admin';

    // Determine whose info to show
    const isUserStudent = role === 'student';
    // Admin & CVHT will see Student info on the sidebar to know who asked
    const cvhtInfo = {
        name: conversation?.tenCv || "Chưa phân công",
        id: conversation?.maCv || "---",
        idLabel: "Mã giảng viên",
        email: conversation?.emailCv || "---",
        phone: conversation?.sdtCv || "---",
        detail: conversation?.chuyenMonCv || "Chưa cập nhật",
        detailLabel: "Ngành",
        avatar: conversation?.tenCv,
        roleLabel: "Giảng viên / CVHT"
    };

    const studentInfo = {
        name: conversation?.tenSv || "Sinh viên",
        id: conversation?.maSv || "---",
        idLabel: "Mã sinh viên",
        email: conversation?.emailSv || "---",
        phone: conversation?.sdtSv || "---",
        detail: conversation?.maLopSv || "---",
        detailLabel: "Lớp",
        detailExtra: conversation?.khoaSv,
        avatar: conversation?.tenSv,
        roleLabel: "Sinh viên"
    };

    const displayInfo = isUserStudent ? cvhtInfo : studentInfo;

    const renderParticipantInfo = (info, index) => {
        if (!info) return null;
        return (
            <div className="info-body" key={index} style={{ borderBottom: index === 0 ? '1px solid #e5e7eb' : 'none', paddingBottom: index === 0 ? '16px' : '0', marginBottom: index === 0 ? '16px' : '0' }}>
                <div className="info-section">
                    <p className="section-title" style={{ color: '#0369a1', fontWeight: '600' }}>
                        Thông tin {info.roleLabel}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
                        <div className="avatar-circle" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${(info.avatar || "U").replace(/ /g, '+')}&background=random&color=fff`}
                                alt="Avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>{info.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{info.roleLabel}</div>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="item-icon"><User size={18} /></div>
                        <div className="item-text">
                            <label>{info.idLabel}</label>
                            <p>{info.id}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="item-icon"><Mail size={18} /></div>
                        <div className="item-text">
                            <label>Email</label>
                            <p>{info.email}</p>
                        </div>
                        <button
                            className="copy-btn-mini"
                            onClick={() => handleCopy(info.email, 'email')}
                            title="Copy Email"
                        >
                            {copyStatus.email ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="info-item">
                        <div className="item-icon"><Phone size={18} /></div>
                        <div className="item-text">
                            <label>Số điện thoại</label>
                            <p>{info.phone}</p>
                        </div>
                        <button
                            className="copy-btn-mini"
                            onClick={() => handleCopy(info.phone, 'phone')}
                            title="Copy SĐT"
                        >
                            {copyStatus.phone ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="info-item">
                        <div className="item-icon"><BookOpen size={18} /></div>
                        <div className="item-text">
                            <label>{info.detailLabel}</label>
                            <p>{info.detail}</p>
                        </div>
                    </div>

                    {info.detailExtra && (
                        <div className="info-item">
                            <div className="item-icon"><MapPin size={18} /></div>
                            <div className="item-text">
                                <label>Khoa</label>
                                <p>{info.detailExtra}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <main className="main-content chat-main-layout">
            <header className="top-bar">
                <div className="top-bar-left">
                    <button className="back-btn-minimal" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <div className="top-bar-center">
                    <span className="indicator-text">{conversation?.tieuDe || "Đang tải..."}</span>
                </div>
                <div className="top-bar-right">
                    <button className="info-toggle-btn" onClick={() => setShowInfo(!showInfo)}>
                        <User size={20} />
                    </button>
                    <span className={`status-badge ${isResolved ? 'status-resolved' : isReported ? 'status-reported' : 'status-online'}`}>
                        {isResolved ? "Đã giải quyết" : isReported ? "Bị báo cáo" : "Đang hoạt động"}
                    </span>
                </div>
            </header>

            <div className="chat-view-wrapper">
                <div className="chat-container">
                    <div className="messages-area">
                        {messages.length === 0 ? (
                            <div className="no-messages">Hãy là người gửi tin nhắn đầu tiên!</div>
                        ) : null}

                        {messages.map((msg, index) => {
                            const isMe = msg.nguoiGuiType === mySenderType;
                            return (
                                <div key={index} className={`message-bubble ${isMe ? 'message-mine' : 'message-yours'}`}>
                                    <div className="message-content">
                                        {msg.fileName ? (
                                            <div>
                                                <p style={{ whiteSpace: 'pre-wrap', margin: 0, marginBottom: '8px' }}>{msg.noiDung}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '4px' }}>
                                                    <Paperclip size={16} />
                                                    <span style={{ fontSize: '14px', fontWeight: '500', wordBreak: 'break-all' }}>{msg.fileName}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownload(msg.id, msg.fileName)}
                                                    style={{ background: 'none', border: 'none', color: isMe ? '#fff' : '#0369a1', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}
                                                >
                                                    Tải tệp về
                                                </button>
                                            </div>
                                        ) : (
                                            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.noiDung}</p>
                                        )}
                                        <div className="message-time">{formatTime(msg.thoiGianGui)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
                        {selectedFile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                                <Paperclip size={16} color="#64748b" />
                                <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {selectedFile.name}
                                </span>
                                <button 
                                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', fontSize: '12px' }}
                                    title="Xóa tệp đính kèm"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <div className={`chat-input-area ${isReadOnly ? 'disabled-chat' : ''}`} style={{ borderTop: 'none' }}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload}
                            />
                            <button className="btn-icon" title="Đính kèm tệp" disabled={isReadOnly} onClick={() => fileInputRef.current?.click()}>
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                className="chat-input"
                                placeholder={
                                    role === 'admin' ? "Quản trị viên chỉ có quyền xem ẩn danh." :
                                    isResolved ? "Cuộc trò chuyện này đã kết thúc." : "Nhập tin nhắn..."
                                }
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isReadOnly}
                            />
                            <button className="btn-send-chat" onClick={handleSend} disabled={(!inputMessage.trim() && !selectedFile) || isReadOnly}>
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <aside className={`participant-info-sidebar ${showInfo ? 'show-mobile' : ''}`} style={{ overflowY: 'auto' }}>
                    <div className="mobile-info-close">
                        <button onClick={() => setShowInfo(false)}>×</button>
                    </div>
                    {role === 'admin' ? (
                        <>
                            {renderParticipantInfo(studentInfo, 0)}
                            {renderParticipantInfo(cvhtInfo, 1)}
                        </>
                    ) : (
                        <>
                            <div className="info-header">
                                <div className="big-avatar-circle">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${(displayInfo.avatar || "U").replace(/ /g, '+')}&background=random&size=128&color=fff`}
                                        alt="Avatar"
                                    />
                                </div>
                                <h2 className="display-name">{displayInfo.name}</h2>
                                <span className="role-tag">{displayInfo.roleLabel}</span>
                            </div>
                            {renderParticipantInfo(displayInfo, 0)}
                        </>
                    )}

                    <div className="info-footer">
                        <div className="action-buttons">
                            {role === 'cvht' && !isReported && !isResolved && (
                                <button className="btn-action-outline btn-report" onClick={handleReport}>
                                    <AlertTriangle size={16} />
                                    <span>Báo cáo</span>
                                </button>
                            )}
                            {isReported && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '14px', fontWeight: '500', border: '1px solid #fecaca' }}>
                                    <AlertTriangle size={14} />
                                    <span>Đã báo cáo vi phạm</span>
                                </div>
                            )}
                            
                            {role === 'cvht' && !isResolved && (
                                <button className="btn-action-solid btn-complete" onClick={handleResolve}>
                                    <CheckCircle size={16} />
                                    <span>Hoàn thành</span>
                                </button>
                            )}

                            {isResolved && (
                                <div className="resolved-badge">
                                    <CheckCircle size={14} />
                                    <span>Đã hoàn thành</span>
                                </div>
                            )}
                        </div>
                        <p className="footer-note">Trao đổi văn minh & lịch sự</p>
                    </div>
                </aside>
                <ConfirmModal 
                    isOpen={isResolveModalOpen}
                    onClose={() => setIsResolveModalOpen(false)}
                    onConfirm={confirmResolve}
                    title="Xác nhận hoàn thành"
                    message="Bạn có chắc chắn muốn đánh dấu câu hỏi này là hoàn thành? Sau khi hoàn thành, cuộc trò chuyện sẽ được đóng lại."
                    confirmText="Hoàn thành"
                    type="primary"
                />

                {/* Report Modal */}
                {isReportModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '480px', maxWidth: '95%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                                        <AlertTriangle size={20} color="#dc2626" />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '18px', color: '#1f2937', fontWeight: '600' }}>Báo cáo vi phạm</h2>
                                </div>
                                <button onClick={() => setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '20px', lineHeight: 1 }}>×</button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Vui lòng chọn lý do báo cáo để Admin có thể xem xét và xử lý kịp thời.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {['Nội dung không phù hợp', 'Sinh viên không hợp tác', 'Câu hỏi sai lĩnh vực', 'Ngôn từ thiếu văn minh', 'Khác'].map((reason) => (
                                    <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${reportReason === reason ? '#dc2626' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: reportReason === reason ? '#fef2f2' : '#fff', transition: 'all 0.15s' }}>
                                        <input
                                            type="radio"
                                            name="reportReason"
                                            value={reason}
                                            checked={reportReason === reason}
                                            onChange={() => setReportReason(reason)}
                                            style={{ accentColor: '#dc2626', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: reportReason === reason ? '500' : '400' }}>{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {reportReason === 'Khác' && (
                                <textarea
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                    value={reportCustomText}
                                    onChange={(e) => setReportCustomText(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }}
                                />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                <button onClick={() => setIsReportModalOpen(false)} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>Hủy bỏ</button>
                                <button onClick={handleSubmitReport} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Gửi báo cáo</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default QuestionDetail;
