import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

import '../../assets/styles/UserLayout.css';
import logo from '../../assets/images/logo.webp';
import bg1 from '../../assets/images/bg1.webp';

const UserLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ── Chatbot widget state ──────────────────────────────────
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            role: 'bot',
            text: 'Xin chào! 👋 Tôi là trợ lý ảo của Đồng Hương Sông Lam. Tôi có thể giúp bạn đặt vé, tra lịch xe, hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatBodyRef = useRef(null);
    const chatWidgetRef = useRef(null);

    const quickReplies = ['Đặt vé xe', 'Xem lịch trình', 'Giá vé', 'Liên hệ hotline'];

    // Scroll to bottom whenever messages change
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const sendMessage = (text) => {
        const msg = text || chatInput.trim();
        if (!msg) return;
        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: msg,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setChatLoading(true);

        // ──────────────────────────────────────────────────────
        // TODO: TÍCH HỢP CHATBOT API TẠI ĐÂY
        // Gọi API chatbot (Dialogflow, OpenAI, Rasa, v.v.)
        // và thay thế đoạn setTimeout bên dưới bằng response thật.
        // Ví dụ:
        //   const res = await fetch('/api/chatbot', { method:'POST', body: JSON.stringify({ message: msg }) });
        //   const data = await res.json();
        //   setChatMessages(prev => [...prev, { id: Date.now(), role:'bot', text: data.reply, time: '...' }]);
        // ──────────────────────────────────────────────────────
        setTimeout(() => {
            const botReply = {
                id: Date.now() + 1,
                role: 'bot',
                text: 'Cảm ơn bạn đã nhắn tin! Chúng tôi sẽ phản hồi sớm. Hoặc liên hệ hotline: 📞 0969 037 123 để được hỗ trợ ngay.',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
            setChatMessages(prev => [...prev, botReply]);
            setChatLoading(false);
        }, 900);
    };

    const handleChatKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // Click outside to close chatbot
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (chatOpen && chatWidgetRef.current && !chatWidgetRef.current.contains(e.target)) {
                setChatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [chatOpen]);
    // ─────────────────────────────────────────────────────────

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
                            <span
                                className={`user-nav-link ${location.pathname.startsWith('/about') ? 'active' : ''}`}
                                role="button"
                            >
                                Giới thiệu ▾
                            </span>
                            <div className="nav-dropdown-content">
                                <NavLink to="/about/our" onClick={closeMenu}>Về chúng tôi</NavLink>
                                <NavLink to="/about/history" onClick={closeMenu}>Hệ thống văn phòng</NavLink>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <span
                                className={`user-nav-link ${location.pathname.startsWith('/services') ? 'active' : ''}`}
                                role="button"
                            >
                                Dịch vụ ▾
                            </span>
                            <div className="nav-dropdown-content">
                                <NavLink to="/services/transport" onClick={closeMenu}>Dịch vụ vận tải hành khách</NavLink>
                                <NavLink to="/services/cargo" onClick={closeMenu}>Dịch vụ vận tải hàng hóa</NavLink>
                            </div>
                        </div>
                        <div className="nav-dropdown">
                            <span
                                className={`user-nav-link ${location.pathname.startsWith('/lookup') ? 'active' : ''}`}
                                role="button"
                            >
                                Tra cứu ▾
                            </span>
                            <div className="nav-dropdown-content">
                                <NavLink to="/lookup/ticket" onClick={closeMenu}>Tra cứu vé xe</NavLink>
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

            {/* ── Floating Social Buttons ─────────────────────── */}
            <div className="floating-social">
                <a
                    href="tel:1900xxxx"
                    className="social-btn phone"
                    title="Gọi điện"
                >
                    📞
                </a>
                <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn facebook"
                    title="Facebook"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                </a>
                <a
                    href="https://m.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn zalo"
                    title="Messenger"
                    style={{ background: 'linear-gradient(135deg, #f800af, #a200ff, #0078ff)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.686 7.21V22l3.37-1.85A11.3 11.3 0 0 0 12 20.486c5.523 0 10-4.144 10-9.243C22 6.145 17.523 2 12 2zm1.05 12.45-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
                    </svg>
                </a>
            </div>

            {/* ── Chatbot Widget ───────────────────────────────── */}
            <div className="chatbot-widget" ref={chatWidgetRef}>
                {/* Toggle Button */}
                <button
                    className={`chatbot-toggle-btn ${chatOpen ? 'open' : ''}`}
                    onClick={() => setChatOpen(!chatOpen)}
                    title={chatOpen ? 'Đóng chat' : 'Trợ lý tư vấn'}
                    aria-label="Chatbot"
                >
                    {chatOpen ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    ) : (
                        <img src={logo} alt="Chatbot" className="chatbot-logo" />
                    )}
                    {!chatOpen && <span className="chatbot-badge">1</span>}
                </button>

                {/* Chat Panel */}
                {chatOpen && (
                    <div className="chatbot-panel" role="dialog" aria-label="Hỗ trợ trực tuyến">
                        {/* Header */}
                        <div className="chatbot-header">
                            <img src={logo} alt="Logo" className="chatbot-header-logo" />
                            <div className="chatbot-header-info">
                                <span className="chatbot-header-name">Đồng Hương Sông Lam</span>
                                <span className="chatbot-header-status">
                                    <span className="chatbot-online-dot"></span> Trực tuyến
                                </span>
                            </div>
                            <button
                                className="chatbot-close-btn"
                                onClick={() => setChatOpen(false)}
                                aria-label="Đóng"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chatbot-body" ref={chatBodyRef}>
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                                    {msg.role === 'bot' && (
                                        <img src={logo} alt="bot" className="chatbot-msg-avatar" />
                                    )}
                                    <div className="chatbot-msg-bubble">
                                        <p>{msg.text}</p>
                                        <span className="chatbot-msg-time">{msg.time}</span>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="chatbot-msg chatbot-msg--bot">
                                    <img src={logo} alt="bot" className="chatbot-msg-avatar" />
                                    <div className="chatbot-msg-bubble chatbot-typing">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Replies */}
                        <div className="chatbot-quick-replies">
                            {quickReplies.map((q) => (
                                <button key={q} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>{q}</button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="chatbot-footer">
                            <textarea
                                className="chatbot-input"
                                rows={1}
                                placeholder="Nhập tin nhắn..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={handleChatKey}
                                aria-label="Nhập tin nhắn"
                            />
                            <button
                                className="chatbot-send-btn"
                                onClick={() => sendMessage()}
                                disabled={!chatInput.trim() || chatLoading}
                                aria-label="Gửi"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

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