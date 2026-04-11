import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/Common';
import driverService from '../../services/driver.service';
import authService from '../../services/auth.service';
import { toast } from 'react-toastify';

const DriverProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'security'
    
    // Change Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await driverService.getAllDrivers();
            const allDrivers = res.data?.data || res.data || [];
            const userEmail = localStorage.getItem('userEmail');
            const myInfo = allDrivers.find(d => d.email === userEmail);
            
            if (myInfo) {
                setProfile(myInfo);
            }
        } catch (error) {
            toast.error('Không thể tải thông tin hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error('Mật khẩu mới không khớp!');
            return;
        }
        try {
            setIsSubmitting(true);
            const requestData = {
                CurrentPassword: passwordData.currentPassword,
                NewPassword: passwordData.newPassword,
                ConfirmNewPassword: passwordData.confirmNewPassword
            };
            await authService.changePassword(requestData);
            toast.success('Đổi mật khẩu thành công!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="u-text-center u-p-80">
            <p className="u-color-slate-500 u-weight-600">Đang tải hồ sơ...</p>
        </div>
    );

    return (
        <div className="driver-profile-page">
            <div className="profile-summary-card u-m-b-32">
                <div className="u-flex u-align-center u-gap-32">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-circle" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {profile?.avatarUrl ? (
                                <img 
                                    src={profile.avatarUrl} 
                                    alt="Avatar" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                (profile?.fullName?.charAt(0) || 'U').toUpperCase()
                            )}
                        </div>
                        <div className="avatar-edit-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </div>
                    </div>
                    <div className="profile-summary-info">
                        <div className="profile-name-row u-flex u-align-center u-gap-12 u-m-b-8">
                            <h2 className="profile-display-name">{profile?.fullName || 'Tài xế Sông Lam'}</h2>
                        </div>
                        <p className="profile-display-email u-m-b-12">{profile?.email}</p>
                        <div className="u-flex u-gap-12">
                            <Badge type="info" style={{ color: '#10b981', background: '#ecfdf5', border: 'none' }}>Tài xế chuyên nghiệp</Badge>
                            <Badge type="warning" style={{ border: 'none' }}>Toàn quyền</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-tabs-container">
                <div className="profile-tabs">
                    <button 
                        className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin
                    </button>
                    <button 
                        className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Bảo mật
                    </button>
                </div>

                <div className="profile-tab-content admin-card">
                    {activeTab === 'info' ? (
                        <div className="tab-info-content">
                            <h3 className="tab-section-title u-m-b-24">Thông tin cá nhân</h3>
                            <div className="u-grid u-grid-2 u-gap-24">
                                <div className="profile-field-group">
                                    <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="u-m-r-8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Họ và tên</label>
                                    <div className="profile-field-value">{profile?.fullName || '--'}</div>
                                </div>
                                <div className="profile-field-group">
                                    <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="u-m-r-8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>Email</label>
                                    <div className="profile-field-value">{profile?.email || '--'}</div>
                                </div>
                                <div className="profile-field-group">
                                    <label><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="u-m-r-8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Số điện thoại</label>
                                    <div className="profile-field-value">{profile?.phoneNumber || '--'}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="tab-security-content">
                            <h3 className="tab-section-title u-m-b-24">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="u-m-r-10"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                Cập nhật mật khẩu
                            </h3>
                            <form onSubmit={handlePasswordChange} style={{ maxWidth: '600px' }}>
                                <div className="u-flex-column u-gap-20">
                                    <div className="profile-input-group">
                                        <label>Mật khẩu hiện tại</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type={showPasswords.current ? "text" : "password"} 
                                                placeholder="Nhập mật khẩu hiện tại"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                                required
                                                style={{ paddingRight: '45px' }}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                            >
                                                {showPasswords.current ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="profile-input-group">
                                        <label>Mật khẩu mới</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type={showPasswords.new ? "text" : "password"} 
                                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                required
                                                style={{ paddingRight: '45px' }}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                            >
                                                {showPasswords.new ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="profile-input-group">
                                        <label>Nhập lại mật khẩu mới</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                type={showPasswords.confirm ? "text" : "password"} 
                                                placeholder="Xác nhận mật khẩu mới"
                                                value={passwordData.confirmNewPassword}
                                                onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
                                                required
                                                style={{ paddingRight: '45px' }}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                            >
                                                {showPasswords.confirm ? (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" className="admin-btn-primary u-w-full" style={{ height: '44px', background: '#10b981' }} disabled={isSubmitting}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="u-m-r-8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverProfile;
