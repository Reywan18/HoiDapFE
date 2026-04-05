import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Paperclip, User, Mail, Phone, MapPin, Copy, Check, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { conversationApi } from '../services/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './QuestionDetail.css';

const QuestionDetail = () => {
    const { id: questionId } = useParams();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const [copyStatus, setCopyStatus] = useState({ email: false, phone: false });

    const messagesEndRef = useRef(null);
    const clientRef = useRef(null);

    const role = localStorage.getItem('role') || 'student';
    const mySenderType = role === 'cvht' ? 'CVHT' : 'SINH_VIEN';

    useEffect(() => {
        if (questionId) {
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

    const handleSend = () => {
        if (!inputMessage.trim()) return;

        if (clientRef.current && clientRef.current.connected) {
            const payload = {
                conversationId: questionId,
                senderId: "Unknown",
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

    const handleResolve = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đánh dấu câu hỏi này là hoàn thành? Sau khi hoàn thành, cuộc trò chuyện sẽ được đóng lại.")) return;
        
        try {
            const res = await conversationApi.resolveConversation(questionId);
            if (res.data && res.data.status === 200) {
                alert("Đã hoàn thành câu hỏi!");
                fetchConversationDetail(); // Refresh data to update status
            }
        } catch (error) {
            console.error('Lỗi khi hoàn thành câu hỏi:', error);
            alert("Có lỗi xảy ra khi hoàn thành câu hỏi.");
        }
    };

    const handleReport = () => {
        alert("Tính năng báo cáo đang được phát triển. Cảm ơn bạn đã phản hồi!");
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải lịch sử trò chuyện...</div>;

    const isResolved = conversation?.trangThai === 'RESOLVED';

    // Determine whose info to show
    const isUserStudent = role === 'student';
    const displayInfo = isUserStudent ? {
        name: conversation?.tenCv || "Đang chờ CVHT...",
        id: conversation?.maCv || "---",
        idLabel: "Mã giảng viên",
        email: conversation?.emailCv || "---",
        phone: conversation?.sdtCv || "---",
        detail: conversation?.chuyenMonCv || "Chưa cập nhật",
        detailLabel: "Ngành",
        avatar: conversation?.tenCv,
        roleLabel: "Giảng viên / CVHT"
    } : {
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
                    <span className={`status-badge ${isResolved ? 'status-resolved' : 'status-online'}`}>
                        {isResolved ? "Đã giải quyết" : "Đang hoạt động"}
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
                                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.noiDung}</p>
                                        <div className="message-time">{formatTime(msg.thoiGianGui)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={`chat-input-area ${isResolved ? 'disabled-chat' : ''}`}>
                        <button className="btn-icon" title="Đính kèm tệp" disabled={isResolved}>
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder={isResolved ? "Cuộc trò chuyện này đã kết thúc." : "Nhập tin nhắn..."}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isResolved}
                        />
                        <button className="btn-send-chat" onClick={handleSend} disabled={!inputMessage.trim() || isResolved}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                <aside className="participant-info-sidebar">
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

                    <div className="info-body">
                        <div className="info-section">
                            <p className="section-title">Thông tin</p>

                            <div className="info-item">
                                <div className="item-icon"><User size={18} /></div>
                                <div className="item-text">
                                    <label>{displayInfo.idLabel}</label>
                                    <p>{displayInfo.id}</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="item-icon"><Mail size={18} /></div>
                                <div className="item-text">
                                    <label>Email</label>
                                    <p>{displayInfo.email}</p>
                                </div>
                                <button
                                    className="copy-btn-mini"
                                    onClick={() => handleCopy(displayInfo.email, 'email')}
                                    title="Copy Email"
                                >
                                    {copyStatus.email ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                </button>
                            </div>

                            <div className="info-item">
                                <div className="item-icon"><Phone size={18} /></div>
                                <div className="item-text">
                                    <label>Số điện thoại</label>
                                    <p>{displayInfo.phone}</p>
                                </div>
                                <button
                                    className="copy-btn-mini"
                                    onClick={() => handleCopy(displayInfo.phone, 'phone')}
                                    title="Copy SĐT"
                                >
                                    {copyStatus.phone ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                                </button>
                            </div>

                            <div className="info-item">
                                <div className="item-icon"><BookOpen size={18} /></div>
                                <div className="item-text">
                                    <label>{displayInfo.detailLabel}</label>
                                    <p>{displayInfo.detail}</p>
                                </div>
                            </div>

                            {displayInfo.detailExtra && (
                                <div className="info-item">
                                    <div className="item-icon"><MapPin size={18} /></div>
                                    <div className="item-text">
                                        <label>Khoa</label>
                                        <p>{displayInfo.detailExtra}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="info-footer">
                        <div className="action-buttons">
                            <button className="btn-action-outline btn-report" onClick={handleReport}>
                                <AlertTriangle size={16} />
                                <span>Báo cáo</span>
                            </button>
                            
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
            </div>
        </main>
    );
};

export default QuestionDetail;
