import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Save, X, Lock, Eye, EyeOff } from 'lucide-react';
import './QuestionList.css'; // Re-use common styles
import './Profile.css';
import api, { userApi, authApi } from '../../services/api';

const Profile = () => {
    const userRole = localStorage.getItem('role');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        name: "",
        role: "",
        id: "",
        email: "",
        phone: "",
        className: "",
        faculty: "",
        dob: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userApi.getProfile();
            if (response.data && response.data.data) {
                const u = response.data.data;
                setProfileData({
                    name: u.hoTen || "Người dùng",
                    role: u.role === 'CVHT' ? "Giảng viên" : (u.role === 'SINH_VIEN' ? "Sinh viên" : u.role),
                    id: u.maDinhDanh || "",
                    email: u.email || "",
                    phone: u.soDienThoai || "Chưa cập nhật",
                    className: u.maLop || "",
                    faculty: u.chuyenMon || "Khoa Công nghệ Thông tin",
                    dob: u.ngaySinh || "Chưa cập nhật"
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile from API, falling back to token", error);
            loadProfileFromToken();
        } finally {
            setLoading(false);
        }
    };

    const loadProfileFromToken = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT with UTF-8 support
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                setProfileData({
                    name: payload.hoTen || payload.name || "Người dùng",
                    role: userRole === 'cvht' ? "Giảng viên" : "Sinh viên",
                    id: payload.maDinhDanh || payload.sub || "",
                    email: payload.email || payload.sub || "",
                    phone: payload.soDienThoai || "Chưa cập nhật",
                    className: payload.maLop || "",
                    faculty: payload.chuyenMon || "Khoa Công nghệ Thông tin",
                    dob: payload.ngaySinh || "01/01/2000"
                });
            } catch (e) {
                console.error("Failed to parse token", e);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        if (!confirm('Bạn có chắc chắn muốn cập nhật thông tin?')) return;

        try {
            // Updated to use the new authApi.updateProfile method which calls /api/auth/profile/update
            await authApi.updateProfile({
                maLop: profileData.className,
                chuyenMon: profileData.faculty,
                soDienThoai: profileData.phone
            });
            alert('Cập nhật hồ sơ thành công!');
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (error) {
            console.error(error);
            alert('Cập nhật thất bại.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchProfile(); // Reset
    };

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const submitChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        try {
            await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert("Đổi mật khẩu thành công!");
            setIsChangingPassword(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Đổi mật khẩu thất bại.");
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Hồ sơ cá nhân</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Hồ sơ cá nhân</h1>

                <div className="profile-grid">
                    {/* Left Column wrapper */}
                    <div>
                        <div className="profile-card identity-card">
                            <div className="profile-header-bg"></div>
                            <div className="profile-avatar-container">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${profileData.name.replace(/ /g, '+')}&background=random&size=200`}
                                    alt="Profile"
                                    className="big-avatar"
                                />
                                <button className="change-avatar-btn">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div className="identity-info">
                                <h2 className="profile-name">{profileData.name}</h2>
                                <p className="profile-role">{profileData.role}</p>
                                <p className="profile-id">
                                    {userRole === 'student' ? 'Mã SV: ' : 'Mã GV: '}
                                    <span className="font-mono">{profileData.id}</span>
                                </p>

                                <div className="profile-status active">
                                    <span className="status-dot"></span> Đang hoạt động
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column wrapper */}
                    <div>
                        <div className="profile-card details-card">
                            <div className="card-header">
                                <h3>Thông tin chi tiết</h3>
                                {!isEditing ? (
                                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                        <Edit3 size={16} />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                ) : (
                                    <div className="action-buttons">
                                        <button className="btn-cancel" onClick={handleCancel}>
                                            <X size={16} />
                                            <span>Hủy</span>
                                        </button>
                                        <button className="btn-save" onClick={handleSave}>
                                            <Save size={16} />
                                            <span>Lưu</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="details-list">
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <User size={20} />
                                    </div>
                                    <div className="detail-content">
                                        <label className="flex-label">
                                            Họ và tên <Lock size={12} className="lock-icon" title="Không thể chỉnh sửa" />
                                        </label>
                                        <p className="read-only-text">{profileData.name}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <Mail size={20} />
                                    </div>
                                    <div className="detail-content">
                                        <label>Email</label>
                                        <p className="read-only-text">{profileData.email}</p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <Phone size={20} />
                                    </div>
                                    <div className="detail-content">
                                        <label>Số điện thoại</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                className="profile-input"
                                                value={profileData.phone}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <p className="read-only-text">{profileData.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="detail-content">
                                        <label>Khoa / Viện <Lock size={12} className="lock-icon" /></label>
                                        <p className="read-only-text">{profileData.faculty}</p>
                                    </div>
                                </div>

                                {userRole === 'student' && (
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <User size={20} />
                                        </div>
                                        <div className="detail-content">
                                            <label>Lớp hành chính <Lock size={12} className="lock-icon" /></label>
                                            <p className="read-only-text">{profileData.className}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="profile-card password-card" style={{ marginTop: '2rem', padding: '2rem' }}>
                            <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                                <h3>Đổi mật khẩu</h3>
                                {!isChangingPassword ? (
                                    <button className="btn-edit" onClick={() => setIsChangingPassword(true)}>
                                        <Edit3 size={16} />
                                        <span>Thay đổi</span>
                                    </button>
                                ) : (
                                    <div className="action-buttons">
                                        <button className="btn-cancel" onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                        }}>
                                            <X size={16} />
                                            <span>Hủy</span>
                                        </button>
                                        <button className="btn-save" onClick={submitChangePassword}>
                                            <Save size={16} />
                                            <span>Lưu</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isChangingPassword && (
                                <div className="details-list">
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <Lock size={20} />
                                        </div>
                                        <div className="detail-content">
                                            <label>Mật khẩu hiện tại</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    name="currentPassword"
                                                    className="profile-input"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <Lock size={20} />
                                        </div>
                                        <div className="detail-content">
                                            <label>Mật khẩu mới</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    className="profile-input"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Ít nhất 6 ký tự"
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <Lock size={20} />
                                        </div>
                                        <div className="detail-content">
                                            <label>Xác nhận mật khẩu mới</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    className="profile-input"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Profile;
