import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/styles/Login.css';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.webp';
import busImg from '../assets/images/482248215_1000882942146826_2467553716153928696_n.jpg';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Vui lòng nhập email hoặc số điện thoại';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            
            toast.success('Chào mừng bạn quay trở lại!');
            
            const isDriver = data.roles.includes('Driver');
            const isAdmin = data.roles.includes('Admin');

            setTimeout(() => {
                if (isAdmin) navigate('/admin');
                else if (isDriver) navigate('/driver/schedule');
                else navigate('/home');
            }, 800);
        } catch (error) {
            toast.error('Email hoặc mật khẩu không chính xác');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-v2-container">
            {/* Left Section: Official Branding */}
            <div className="login-v2-left">
                <div className="brand-header">
                    <img src={logo} alt="Logo" className="brand-logo" />
                    <span className="brand-name">Đồng Hương Sông Lam</span>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">KẾT NỐI <br/><span className="text-yellow">NGHỆ AN - HÀ NỘI</span></h1>
                    <p className="hero-desc">
                        Hệ thống quản lý vận tải chuyên nghiệp, mang lại trải nghiệm êm ái và an toàn trên mọi hành trình.
                    </p>
                    
                    <div className="hero-image-container">
                        <img src={busImg} alt="Bus Branding" className="hero-bus-img" />
                    </div>
                </div>

                <div className="login-footer-copy">
                    &copy; {new Date().getFullYear()} Đồng Hương Sông Lam Transport. <br/> "Ân cần - Thân thiện"
                </div>
            </div>

            {/* Right Section: Form */}
            <div className="login-v2-right">
                <div className="right-header">
                    <Link to="/home" className="back-link">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Quay lại trang chủ
                    </Link>
                </div>

                <div className="login-form-wrapper">
                    <h2 className="form-title">Đăng nhập</h2>
                    <p className="form-subtitle">Hệ thống Quản trị & Điều hành tài xế</p>

                    <form onSubmit={handleSubmit} className="modern-form">
                        <div className="input-group">
                            <label>Tên đăng nhập</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Email hoặc Số điện thoại"
                                value={formData.email}
                                onChange={handleChange}
                                spellCheck="false"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="err-text">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label>Mật khẩu</label>
                                <Link to="#" className="forgot-link">Quên mật khẩu?</Link>
                            </div>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    spellCheck="false"
                                    className={errors.password ? 'error' : ''}
                                />
                                <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="err-text">{errors.password}</span>}
                        </div>

                        <button type="submit" className="login-v2-btn" disabled={isLoading}>
                            {isLoading ? "Đang xác thực..." : "Đăng nhập ngay"}
                        </button>
                    </form>

                    <div className="login-instruction">
                        <h4 className="ins-title">Ghi chú đăng nhập:</h4>
                        <ul className="ins-list">
                            <li><strong>Admin:</strong> Dành cho ban điều hành</li>
                            <li><strong>Tài xế:</strong> Sử dụng SĐT đã đăng ký</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
