import React, { useState } from 'react';
import { Accessibility, Key, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import buildingImg from '../../assets/Ảnh_bìa_tlu.png';
import api, { authApi } from '../../services/api';

// SVG Icon for Microsoft/Office (simplified)
const OfficeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z" />
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    // Steps: 'initial' | 'email' | 'password'
    const [step, setStep] = useState('initial');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailNext = () => {
        if (email.trim()) {
            setStep('password');
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setPassword('');
        setError('');
    };

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const handleLoginSubmit = async () => {
        if (!password) return;
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(email, password);

            if (response.data && response.data.token) {
                const token = response.data.token;
                localStorage.setItem('token', token);

                // Decode token to get role
                const decoded = parseJwt(token);
                // Assuming the role is stored in a claim like 'role' or 'roles' or 'scope'
                // Adjust based on actual JWT structure. Defaulting to student if unclear.
                let role = 'student';
                if (decoded) {
                    // Check common claim names
                    const rawRole = decoded.role || decoded.roles || decoded.scope || '';
                    const lowerRole = String(rawRole).toLowerCase();
                    if (lowerRole.includes('admin')) {
                        role = 'admin';
                    } else if (lowerRole.includes('cvht') || lowerRole.includes('teacher')) {
                        role = 'cvht';
                    }
                    // Save user info if available
                    if (decoded.sub) localStorage.setItem('userEmail', decoded.sub);
                }

                localStorage.setItem('role', role);
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'cvht') {
                    navigate('/cvht');
                } else {
                    navigate('/sinhvien');
                }
            } else {
                setError('Phản hồi không hợp lệ từ máy chủ');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    // Render Microsoft Login Flow (Email or Password step)
    if (step === 'email' || step === 'password') {
        return (
            <div className="ms-login-container">
                <div className="ms-background-shape"></div>

                <div className="ms-login-card">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Logo_Đại_học_Thăng_Long.png"
                        alt="TLU Logo"
                        className="ms-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />

                    {step === 'email' ? (
                        <>
                            <div className="ms-title">Đăng nhập</div>
                            <div className="ms-input-container">
                                <input
                                    type="text"
                                    className="ms-input"
                                    placeholder="Email, điện thoại hoặc Skype"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                                    autoFocus
                                />
                            </div>

                            <a className="ms-link" href="#">Bạn không truy cập được vào tài khoản?</a>

                            <div className="ms-btn-group">
                                <button className="ms-btn ms-btn-back" onClick={() => setStep('initial')}>
                                    Quay lại
                                </button>
                                <button className="ms-btn ms-btn-next" onClick={handleEmailNext}>
                                    Tiếp theo
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Password Step Header with Email and Back Arrow */}
                            <div className="ms-user-display" onClick={handleBackToEmail} title="Quay lại">
                                <ArrowLeft size={16} style={{ marginRight: '8px', cursor: 'pointer' }} />
                                <span>{email}</span>
                            </div>

                            <div className="ms-title" style={{ marginTop: '16px' }}>Nhập mật khẩu</div>

                            {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

                            <div className="ms-input-container">
                                <input
                                    type="password"
                                    className="ms-input"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                                    autoFocus
                                />
                            </div>

                            <a className="ms-link" href="#">Quên mật khẩu?</a>

                            <div className="ms-btn-group">
                                <button className="ms-btn ms-btn-next" onClick={handleLoginSubmit} disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div className="ms-opts-card">
                    <Key className="ms-key-icon" />
                    <span className="ms-opts-text">Tùy chọn đăng nhập</span>
                </div>

                <div className="ms-dots">...</div>
            </div>
        );
    }

    // Initial TLU Login Screen
    return (
        <div className="login-container">
            {/* Left Side: Image */}
            <div className="login-banner">
                <img
                    src={buildingImg}
                    alt="Thang Long University"
                />
            </div>

            {/* Right Side: Form */}
            <div className="login-form-container">
                <div className="uni-header">
                    {/* Placeholder Logo */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Logo_Đại_học_Thăng_Long.png"
                        alt="TLU Logo"
                        className="uni-logo"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }} // Hide if fails to load
                    />
                    <div className="uni-title">TRƯỜNG ĐẠI HỌC THĂNG LONG</div>
                    <div className="portal-title">CỔNG THÔNG TIN ĐÀO TẠO</div>
                </div>

                <div className="login-card">
                    <h2 className="card-title">ĐĂNG NHẬP</h2>
                    <p className="card-subtitle">Cổng thông tin đào tạo</p>

                    <button className="btn-office-login" onClick={() => setStep('email')}>
                        <OfficeIcon />
                        <span>Đăng nhập Office 365</span>
                    </button>

                    <div className="card-divider"></div>
                </div>

                <div className="login-footer">
                    @Copyright 2022 Trường Đại Học Thăng Long | All Rights Reserved Developed by PSC
                </div>

                <button className="floating-access-btn">
                    <Accessibility size={20} />
                </button>
            </div>
        </div>
    );
};

export default Login;
