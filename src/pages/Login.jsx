import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/styles/Login.css';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.webp';
// Poster image - trying to match the original one with the bus and family
import posterImg from '../assets/images/482248215_1000882942146826_2467553716153928696_n.jpg';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (generalError) setGeneralError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email hoặc tên đăng nhập là bắt buộc';
        }
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('Auth/login', formData);
            const data = response.data;
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', formData.email);
            localStorage.setItem('userRoles', JSON.stringify(data.roles));
            
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            toast.success('Đăng nhập thành công');
            
            const isDriver = data.roles.includes('Driver');
            const isAdmin = data.roles.includes('Admin');

            setTimeout(() => {
                if (isAdmin) {
                    navigate('/admin');
                } else if (isDriver) {
                    navigate('/driver/schedule');
                } else {
                    navigate('/home');
                }
            }, 1000);
        } catch (error) {
            let message = 'Email hoặc mật khẩu không đúng';
            if (error.response && error.response.data) {
                message = error.response.data.message || message;
            }
            toast.error('Đăng nhập thất bại');
            setGeneralError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Section - Brand Poster */}
            <div className="login-brand-section">
                <div className="brand-header">
                    <img src={logo} alt="Logo" className="brand-logo" />
                    <span className="brand-name">Đồng Hương Sông Lam</span>
                </div>

                <div className="brand-main-content">
                    <h1 className="brand-title">KẾT NỐI</h1>
                    <h2 className="brand-subtitle">NGHỆ AN - HÀ NỘI</h2>
                    <p className="brand-description">
                        Hệ thống quản lý vận tải chuyên nghiệp, mang lại trải nghiệm êm ái và an toàn trên mọi hành trình.
                    </p>
                    <img src={posterImg} alt="Dịch vụ xe giường nằm" className="brand-poster" />
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="login-form-section">
                <Link to="/" className="back-to-home">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Quay lại trang chủ
                </Link>

                <div className="form-wrapper">
                    <div className="form-header">
                        <h2>Đăng nhập</h2>
                        <p>Hệ thống Quản trị & Điều hành tài xế</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {generalError && (
                            <div className="general-error" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                                {generalError}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Email hoặc số điện thoại"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-message" style={{ color: '#EF4444', fontSize: '12px' }}>{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <div className="label-row">
                                <label>Mật khẩu</label>
                                <Link to="/forgot-password" disable="true" className="forgot-password" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</Link>
                            </div>
                            <div className="input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="error-message" style={{ color: '#EF4444', fontSize: '12px' }}>{errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập ngay'}
                        </button>
                    </form>

                    <div className="login-notes-box">
                        <h4>Ghi chú đăng nhập:</h4>
                        <div className="note-item">
                            <span className="note-role">Admin:</span>
                            <span className="note-text">Dành cho ban điều hành</span>
                        </div>
                        <div className="note-item">
                            <span className="note-role">Tài xế:</span>
                            <span className="note-text">Sử dụng SĐT đã đăng ký</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
