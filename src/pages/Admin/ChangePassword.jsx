import React, { useState } from 'react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        try {
            setIsSubmitting(true);
            await authService.changePassword(formData);
            toast.success('Đổi mật khẩu thành công!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="u-flex u-justify-center u-p-t-80">
            <div style={{ maxWidth: '440px', width: '100%', padding: '0 20px' }}>
                <div className="u-text-center u-m-b-48">
                    <div className="u-m-x-auto u-m-b-24 u-flex-center u-rounded-full" 
                         style={{ width: '56px', height: '56px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--admin-primary)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2 className="u-size-26 u-weight-700 u-color-slate-800 u-m-b-12">Đổi mật khẩu</h2>
                    <p className="u-size-15 u-color-slate-500">Cập nhật mật khẩu để tài khoản của bạn luôn an toàn.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="u-flex-column u-gap-32">
                        <div className="minimal-form-group">
                            <label className="u-size-11 u-weight-700 u-color-slate-400 u-m-b-12" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                className="u-w-full"
                                style={{ 
                                    border: 'none', 
                                    borderBottom: '2px solid #e2e8f0', 
                                    padding: '12px 0', 
                                    fontSize: '16px', 
                                    fontWeight: '500', 
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: 'transparent'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--admin-primary)'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#e2e8f0'}
                                placeholder="••••••••"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="minimal-form-group">
                            <label className="u-size-11 u-weight-700 u-color-slate-400 u-m-b-12" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Mật khẩu mới</label>
                            <input
                                type="password"
                                className="u-w-full"
                                style={{ 
                                    border: 'none', 
                                    borderBottom: '2px solid #e2e8f0', 
                                    padding: '12px 0', 
                                    fontSize: '16px', 
                                    fontWeight: '500', 
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: 'transparent'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--admin-primary)'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#e2e8f0'}
                                placeholder="Nhập ít nhất 6 ký tự"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="minimal-form-group">
                            <label className="u-size-11 u-weight-700 u-color-slate-400 u-m-b-12" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                className="u-w-full"
                                style={{ 
                                    border: 'none', 
                                    borderBottom: '2px solid #e2e8f0', 
                                    padding: '12px 0', 
                                    fontSize: '16px', 
                                    fontWeight: '500', 
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    background: 'transparent'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--admin-primary)'}
                                onBlur={(e) => e.target.style.borderBottomColor = '#e2e8f0'}
                                placeholder="Nhập lại mật khẩu mới"
                                value={formData.confirmNewPassword}
                                onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="admin-btn-primary u-w-full u-m-t-20"
                            style={{ 
                                height: '52px', 
                                borderRadius: '12px', 
                                fontSize: '15px', 
                                fontWeight: '700',
                                boxShadow: '0 10px 20px -5px rgba(26, 58, 143, 0.3)'
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT MẬT KHẨU'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
