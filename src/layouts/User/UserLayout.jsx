import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../assets/styles/UserLayout.css';
import logo from '../../assets/images/logo.webp';

const UserLayout = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleAuthClick = () => {
        if (userEmail) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="user-layout">
            <header className={`user-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="user-header-inner">
                    <div className="user-logo" onClick={handleLogoClick}>
                        <img src={logo} alt="Đồng Hương Sông Lam" className="user-logo-img" />
                        <div className="user-logo-text">
                            <span className="user-logo-title">Đồng Hương Sông Lam</span>
                            <span className="user-logo-subtitle">Đặt vé xe khách văn minh</span>
                        </div>
                    </div>

                    <nav className="user-nav">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Trang chủ
                        </NavLink>
                        <NavLink
                            to="/routes"
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Tuyến đường
                        </NavLink>
                        <NavLink
                            to="/booking"
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Đặt vé
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                        >
                            Liên hệ
                        </NavLink>
                    </nav>

                    <div className="user-actions">
                        {userEmail ? (
                            <button className="user-auth-btn logged-in" onClick={handleAuthClick}>
                                <span className="user-auth-name">
                                    {userEmail.split('@')[0]}
                                </span>
                                <span className="user-auth-label">Tài khoản</span>
                            </button>
                        ) : (
                            <button className="user-auth-btn" onClick={handleAuthClick}>
                                <span className="user-auth-label">Đăng nhập / Đăng ký</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="user-hero-background" />

            <main className="user-main">
                <div className="user-main-inner">
                    <Outlet />
                </div>
            </main>

            <footer className="user-footer">
                <div className="user-footer-inner">
                    <div className="user-footer-left">
                        <img src={logo} alt="Đồng Hương Sông Lam" className="user-footer-logo" />
                        <div className="user-footer-text">
                            <p>Đặt vé xe khách an toàn, nhanh chóng và tiện lợi.</p>
                            <p>Đồng hành cùng bạn trên mọi hành trình.</p>
                        </div>
                    </div>
                    <div className="user-footer-right">
                        <div className="user-footer-column">
                            <h4>Dịch vụ</h4>
                            <a href="/routes">Tuyến đường</a>
                            <a href="/booking">Đặt vé online</a>
                        </div>
                        <div className="user-footer-column">
                            <h4>Liên hệ</h4>
                            <p>Hotline: 1900 xxxx</p>
                            <p>Email: support@donghuongsonglam.vn</p>
                        </div>
                    </div>
                </div>
                <div className="user-footer-bottom">
                    <span>© {new Date().getFullYear()} Đồng Hương Sông Lam. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;