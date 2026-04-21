import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../../services/api';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'bot',
            content: 'Chào bạn! Mình là Trợ lý AI của Đại học Thăng Long. Hỏi mình bất cứ điều gì về lịch học, quy chế hoặc thủ tục nhé!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputQuery, setInputQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Focus vào input khi mở 
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const trimmedMsg = inputQuery.trim();
        if (!trimmedMsg) return;

        // Xoá input ngay lập tức để người dùng trải nghiệm mượt mà
        setInputQuery('');

        const userMessage = {
            id: messages.length + 1,
            role: 'user',
            content: trimmedMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Cập nhật State để hiện tin nhắn của người dùng ngay lập tức
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            // Gọi API backend (Đã nối sẵn với Spring AI -> Chroma -> Gemini)
            const response = await aiApi.chat(trimmedMsg);

            // Do endpoint backend trả về text trực tiếp (String) hoặc JSON tuỳ config. 
            // Ở đây ta handle mặc định là text gốc của Gemini
            const botContent = (typeof response.data === 'string') ? response.data : JSON.stringify(response.data);

            const botMessage = {
                id: messages.length + 2,
                role: 'bot',
                content: botContent,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Lỗi khi chat với AI:', error);

            // Xử lý lỗi tinh tế
            const errorMessage = {
                id: messages.length + 2,
                role: 'bot',
                content: 'Xin lỗi, hiện tại máy chủ AI đang xử lý quá nhiều yêu cầu hoặc không thể kết nối. Bạn vui lòng đợi một lát và thử lại nhé.',
                isError: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <div className="header-icon-wrapper">
                    <Sparkles className="sparkles-icon" size={24} />
                </div>
                <div>
                    <h2 className="chatbot-title">Hỏi Đáp Nhanh - AI</h2>
                    <p className="chatbot-subtitle">Hệ thống thông minh truy xuất trực tiếp Quy chế và Sổ tay SV</p>
                </div>
            </div>

            <div className="chatbot-messages-area">
                <div className="messages-stream">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}
                        >
                            <div className={`message-avatar ${msg.role}`}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className="message-content-container">
                                <div className={`message-bubble ${msg.role} ${msg.isError ? 'bubble-error' : ''}`}>
                                    <span className="message-text">{msg.content}</span>
                                </div>
                                <span className="message-time">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-wrapper bot-wrapper">
                            <div className="message-avatar bot">
                                <Bot size={18} />
                            </div>
                            <div className="message-content-container">
                                <div className="message-bubble bot typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="chatbot-input-area">
                <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chatbot-text-input"
                        placeholder="Nhập câu hỏi của bạn (VD: Sinh viên nghỉ bao nhiêu buổi thì cấm thi?)"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        className={`chatbot-send-btn ${!inputQuery.trim() || isTyping ? 'disabled' : ''}`}
                        disabled={!inputQuery.trim() || isTyping}
                    >
                        {isTyping ? <Loader2 className="spinning" size={20} /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
