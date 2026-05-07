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
    // Steps: 'initial' | 'accounts' | 'email' | 'password' | 'stay_signed_in'
    const [step, setStep] = useState('initial');
    const [savedAccounts, setSavedAccounts] = useState(() => {
        const saved = localStorage.getItem('savedAccounts');
        return saved ? JSON.parse(saved) : [];
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // For account menu
    const [activeMenu, setActiveMenu] = useState(null);

    // For pending login
    const [pendingToken, setPendingToken] = useState(null);
    const [pendingRole, setPendingRole] = useState(null);

    const handleEmailNext = () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!trimmedEmail.endsWith('@thanglong.edu.vn')) {
            setError('Tài khoản bắt buộc phải có đuôi @thanglong.edu.vn');
            return;
        }
        setError('');
        setStep('password');
    };

    const handleBackToEmail = () => {
        setStep('email');
        setPassword('');
        setError('');
    };

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) {
                base64 += '=';
            }
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const handleLoginSubmit = async () => {
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(email, password);

            if (response.data && response.data.token) {
                const token = response.data.token;
                
                // Decode token to get role
                const decoded = parseJwt(token);
                let role = 'student';
                if (decoded) {
                    const rawRole = decoded.role || decoded.roles || decoded.scope || '';
                    const lowerRole = String(rawRole).toLowerCase();
                    if (lowerRole.includes('admin')) {
                        role = 'admin';
                    } else if (lowerRole.includes('cvht') || lowerRole.includes('teacher')) {
                        role = 'cvht';
                    }
                }

                // Always ask to stay signed in after manual password entry
                setPendingToken(token);
                setPendingRole(role);
                setStep('stay_signed_in');
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

    const handleFinalizeLogin = (remember) => {
        localStorage.setItem('token', pendingToken);
        localStorage.setItem('role', pendingRole);
        
        const decoded = parseJwt(pendingToken);
        if (decoded && decoded.sub) localStorage.setItem('userEmail', decoded.sub);

        const newAccount = { 
            email, 
            name: decoded?.name || decoded?.hoTen || email.split('@')[0],
            remember,
            token: remember ? pendingToken : null
        };
        
        const updatedAccounts = savedAccounts.filter(acc => acc.email !== email);
        updatedAccounts.unshift(newAccount);
        setSavedAccounts(updatedAccounts);
        localStorage.setItem('savedAccounts', JSON.stringify(updatedAccounts));

        if (pendingRole === 'admin') navigate('/admin');
        else if (pendingRole === 'cvht') navigate('/cvht');
        else navigate('/sinhvien');
    };

    // Render Microsoft Login Flow (Email or Password step)
    if (step === 'accounts' || step === 'email' || step === 'password' || step === 'stay_signed_in') {
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

                    {step === 'accounts' ? (
                        <>
                            <div className="ms-title" style={{ marginBottom: '24px' }}>Chọn một tài khoản</div>
                            
                            <div className="ms-accounts-list">
                                {savedAccounts.map((acc, index) => (
                                    <div key={index} className="ms-account-item" onClick={() => {
                                        if (acc.remember && acc.token) {
                                            const decoded = parseJwt(acc.token);
                                            const isExpired = decoded && decoded.exp && (decoded.exp * 1000 < Date.now());
                                            
                                            if (isExpired || !decoded) {
                                                setEmail(acc.email);
                                                setStep('password');
                                                setError('Phiên đăng nhập đã hết hạn, vui lòng nhập mật khẩu.');
                                                return;
                                            }

                                            // Auto login
                                            localStorage.setItem('token', acc.token);
                                            let role = 'student';
                                            if (decoded) {
                                                const rawRole = decoded.role || decoded.roles || decoded.scope || '';
                                                const lowerRole = String(rawRole).toLowerCase();
                                                if (lowerRole.includes('admin')) role = 'admin';
                                                else if (lowerRole.includes('cvht') || lowerRole.includes('teacher')) role = 'cvht';
                                                if (decoded.sub) localStorage.setItem('userEmail', decoded.sub);
                                            }
                                            localStorage.setItem('role', role);
                                            if (role === 'admin') navigate('/admin');
                                            else if (role === 'cvht') navigate('/cvht');
                                            else navigate('/sinhvien');
                                        } else {
                                            setEmail(acc.email);
                                            setStep('password');
                                            setError('');
                                        }
                                    }}>
                                        <div className="ms-account-avatar">
                                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        </div>
                                        <div className="ms-account-info">
                                            <div className="ms-account-name">{acc.name}</div>
                                            <div className="ms-account-email">{acc.email}</div>
                                            <div className="ms-account-status">{acc.remember ? 'Đã lưu thông tin' : 'Đã đăng xuất'}</div>
                                        </div>
                                        <div className="ms-account-more" onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === acc.email ? null : acc.email);
                                        }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                        </div>
                                        
                                        {activeMenu === acc.email && (
                                            <div className="ms-account-menu" onClick={(e) => e.stopPropagation()}>
                                                <div className="ms-account-menu-item" onClick={() => {
                                                    const newAccounts = savedAccounts.map(a => 
                                                        a.email === acc.email ? { ...a, remember: false, token: null } : a
                                                    );
                                                    setSavedAccounts(newAccounts);
                                                    localStorage.setItem('savedAccounts', JSON.stringify(newAccounts));
                                                    setActiveMenu(null);
                                                }}>Đăng xuất</div>
                                                <div className="ms-account-menu-item" onClick={() => {
                                                    const newAccounts = savedAccounts.filter(a => a.email !== acc.email);
                                                    setSavedAccounts(newAccounts);
                                                    localStorage.setItem('savedAccounts', JSON.stringify(newAccounts));
                                                    if (newAccounts.length === 0) setStep('email');
                                                    setActiveMenu(null);
                                                }}>Đăng xuất và quên</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                <div className="ms-account-item ms-add-account" onClick={() => {
                                    setEmail('');
                                    setStep('email');
                                    setError('');
                                }}>
                                    <div className="ms-account-avatar" style={{ background: '#f3f4f6' }}>
                                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </div>
                                    <div className="ms-account-info">
                                        <div className="ms-account-name" style={{ fontWeight: '400' }}>Dùng tài khoản khác</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : step === 'email' ? (
                        <>
                            <div className="ms-title">Đăng nhập</div>
                            
                            {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

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
                    ) : step === 'stay_signed_in' ? (
                        <>
                            <div className="ms-title">Duy trì đăng nhập?</div>
                            <div style={{ fontSize: '15px', color: '#1b1b1b', marginBottom: '16px', marginTop: '16px' }}>
                                Thực hiện việc này để giảm số lần bạn được yêu cầu đăng nhập.
                            </div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', cursor: 'pointer', fontSize: '14px' }}>
                                <input type="checkbox" defaultChecked />
                                Không hiển thị lại thông báo này
                            </label>

                            <div className="ms-btn-group" style={{ marginTop: '32px' }}>
                                <button className="ms-btn ms-btn-back" onClick={() => handleFinalizeLogin(false)}>
                                    Không
                                </button>
                                <button className="ms-btn ms-btn-next" onClick={() => handleFinalizeLogin(true)}>
                                    Có
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

                    <button className="btn-office-login" onClick={() => setStep(savedAccounts.length > 0 ? 'accounts' : 'email')}>
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
