import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.webp';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

        if (generalError) {
            setGeneralError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
            const res = await fetch('https://localhost:7000/api/Auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                let message = 'Email hoặc mật khẩu không đúng';
                try {
                    const errorData = await res.json();
                    message = errorData.message || message;
                } catch (_) { }
                setGeneralError(message);
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', formData.email);
            toast.success('Đăng nhập thành công')
            setTimeout(() => {
                navigate('/admin')
            }, 3000);
        } catch (error) {
            toast.error('Đăng nhập thất bại');
            setGeneralError('Không thể kết nối tới server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Animated background blobs */}

            <div className="login-card">
                {/* Header with logo */}
                <div className="login-header">
                    <div className="logo-container">
                        <img src={logo} alt="Đồng Hương Sông Lam" className="logo-img" />
                    </div>
                    <h1>Quản Trị Viên</h1>
                    <p>Đăng nhập để truy cập trang quản trị</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {generalError && (
                        <div className="general-error">
                            {generalError}
                        </div>
                    )}

                    {/* Email */}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>Đồng Hương Sông Lam &copy; {new Date().getFullYear()}</span>
                </div>

                <p className="login-footer-note">Ân cần – Thân thiện</p>
            </div>
        </div>
    );
};

export default Login;
