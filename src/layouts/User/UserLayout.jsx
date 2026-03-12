import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

import '../../assets/styles/UserLayout.css';
import logo from '../../assets/images/logo.webp';
import bg1 from '../../assets/images/bg1.webp';

const UserLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogoClick = () => {
        navigate('/');
        closeMenu(); // Close menu on logo click
    };

    return (
        <div className="user-layout">
            <header className={`user-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="user-header-inner">
                    <div className="user-logo" onClick={handleLogoClick}>
                        <img src={logo} alt="Đồng Hương Sông Lam" className="user-logo-img" />
                        <div className="user-logo-text">
                            <span className="user-logo-title">Đồng Hương Sông Lam</span>
                        </div>
                    </div>

                    <button
                        className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
                        onClick={toggleMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <nav className={`user-nav ${isMenuOpen ? 'active' : ''}`}>
                        <NavLink
                            to="/home"
                            end
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={closeMenu}
                        >
                            Trang chủ
                        </NavLink>
                        <div className="nav-dropdown">
                            <NavLink
                                to="/home/about-us"
                                className={({ isActive }) =>
                                    `user-nav-link ${isActive ? 'active' : ''}`
                                }
                                onClick={closeMenu}
                            >
                                Giới thiệu ▾
                            </NavLink>
                            <div className="nav-dropdown-content">
                                <NavLink to="/home/about-us" onClick={closeMenu}>Về chúng tôi</NavLink>
                                <NavLink to="/home/office-system" onClick={closeMenu}>Hệ thống văn phòng</NavLink>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <NavLink
                                to="/services"
                                className={({ isActive }) =>
                                    `user-nav-link ${isActive ? 'active' : ''}`
                                }
                                onClick={closeMenu}
                            >
                                Dịch vụ ▾
                            </NavLink>
                            <div className="nav-dropdown-content">
                                <NavLink to="/services/transport" onClick={closeMenu}>Vận tải hành khách</NavLink>
                                <NavLink to="/services/cargo" onClick={closeMenu}>Giao nhận hàng hóa</NavLink>
                                <NavLink to="/services/rental" onClick={closeMenu}>Thuê xe hợp đồng</NavLink>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <NavLink
                                to="/home/lookup"
                                className={({ isActive }) =>
                                    `user-nav-link ${isActive ? 'active' : ''}`
                                }
                                onClick={closeMenu}
                            >
                                Tra cứu ▾
                            </NavLink>
                            <div className="nav-dropdown-content">
                                <NavLink to="/home/lookup/ticket" onClick={closeMenu}>Tra cứu vé xe</NavLink>
                                <NavLink to="/lookup/schedule" onClick={closeMenu}>Lịch trình chạy</NavLink>
                            </div>
                        </div>
                        <NavLink
                            to="/news"
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={closeMenu}
                        >
                            Tin tức
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `user-nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={closeMenu}
                        >
                            Liên hệ
                        </NavLink>
                    </nav>

                    {/* Overlay for mobile menu */}
                    {isMenuOpen && <div className="mobile-overlay" onClick={closeMenu}></div>}
                </div>
            </header>

            {location.pathname === '/home' && (
                <div className="user-hero-background">
                    <img
                        src={bg1}
                        alt="Banner Tân Kim Chi - Đà Nẵng"
                        className="hero-banner-img active"
                    />
                </div>
            )}


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

            {/* Global Floating Social Buttons */}
            <div className="floating-social">
                <a href="https://www.facebook.com/share/1CJ5fqhUdL/" target="_blank" rel="noreferrer" className="social-btn facebook" title="Facebook">
                    <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noreferrer" className="social-btn zalo" title="Zalo">
                    <span className="zalo-text">Zalo</span>
                </a>
                <a href="tel:0123456789" className="social-btn phone" title="Gọi ngay">
                    <i className="fas fa-phone"></i>
                </a>
            </div>
        </div>
    );
};

export default UserLayout;