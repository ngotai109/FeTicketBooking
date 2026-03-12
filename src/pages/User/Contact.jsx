import React, { useState } from 'react';
import '../../assets/styles/Contact.css';
import heroBg from '../../assets/images/483853635_995603086008145_130949029170951249_n.jpg';
import serviceImg from '../../assets/images/482248215_1000882942146826_2467553716153928696_n.jpg';

const offices = [
    {
        city: 'Hà Nội',
        icon: '🏙️',
        color: '#e74c3c',
        branches: [
            { name: 'VP Mỗ Lao', address: '364 P.Nguyễn Văn Lộc, Khu đô thị Mỗ Lao, Hà Đông, Hà Nội' },
            { name: 'VP Trần Vỹ', address: '160 P.Trần Vỹ, Mai Dịch, Cầu Giấy, Hà Nội' },
            { name: 'VP Giải Phóng', address: '769 Giải Phóng, Hoàng Mai, Hà Nội' },
        ],
    },
    {
        city: 'Nghệ An',
        icon: '🌊',
        color: '#2980b9',
        branches: [
            { name: 'VP Anh Sơn', address: 'Tổ dân phố 3, Khu đô thị Anh Sơn, Nghệ An' },
            { name: 'VP Tân Kì', address: 'Khối 2, Thị trấn Tân Kì, Nghệ An' },
            { name: 'VP Đô Lương', address: 'Ngã 3 Mét, KĐT Cầu Dâu, Thị trấn Đô Lương, Nghệ An' },
            { name: 'VP Diễn Châu', address: 'Xóm Trung Hồng, Khu đô thị Diễn Ngọc, Diễn Châu, Nghệ An' },
        ],
    },
];

const Contact = () => {
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            setForm({ name: '', phone: '', email: '', subject: '', message: '' });
        }, 1200);
    };

    return (
        <div className="contact-page">

            {/* ── Hero Banner ── */}
            <div className="contact-hero">
                <img src={heroBg} alt="Đồng Hương Sông Lam trên đường" className="contact-hero-img" />
                <div className="contact-hero-overlay">
                    <div className="contact-hero-content">
                        <span className="contact-hero-tag">LIÊN HỆ VỚI CHÚNG TÔI</span>
                        <h1 className="contact-hero-title">Liên Hệ</h1>
                        <p className="contact-hero-sub">
                            Đồng Hương Sông Lam luôn sẵn sàng lắng nghe và hỗ trợ bạn trên mọi hành trình
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Quick Info Cards ── */}
            <div className="contact-quick-bar">
                <div className="contact-quick-card">
                    <div className="cq-icon" style={{ background: 'linear-gradient(135deg,#f39c12,#e67e22)' }}>📞</div>
                    <div className="cq-info">
                        <span className="cq-label">Hotline đặt vé</span>
                        <a href="tel:0969037123" className="cq-value">0969 037 123</a>
                        <a href="tel:0969037456" className="cq-value">0969 037 456</a>
                    </div>
                </div>
                <div className="contact-quick-card">
                    <div className="cq-icon" style={{ background: 'linear-gradient(135deg,#2980b9,#1abc9c)' }}>✉️</div>
                    <div className="cq-info">
                        <span className="cq-label">Email hỗ trợ</span>
                        <a href="mailto:support@donghuongsonglam.vn" className="cq-value">support@donghuongsonglam.vn</a>
                    </div>
                </div>
                <div className="contact-quick-card">
                    <div className="cq-icon" style={{ background: 'linear-gradient(135deg,#8e44ad,#3498db)' }}>🕐</div>
                    <div className="cq-info">
                        <span className="cq-label">Giờ làm việc</span>
                        <span className="cq-value">Thứ 2 – CN: 6:00 – 22:00</span>
                    </div>
                </div>
                <div className="contact-quick-card">
                    <div className="cq-icon" style={{ background: 'linear-gradient(135deg,#e74c3c,#c0392b)' }}>📍</div>
                    <div className="cq-info">
                        <span className="cq-label">Tuyến hoạt động</span>
                        <span className="cq-value">Nghệ An – Hà Nội – Nội Bài</span>
                    </div>
                </div>
            </div>

            <div className="contact-main-wrap">

                {/* ── Left: Contact Form ── */}
                <div className="contact-form-section">
                    <div className="contact-section-label">
                        <span className="label-line"></span>
                        <span>GỬI TIN NHẮN</span>
                        <span className="label-line"></span>
                    </div>
                    <h2 className="contact-section-title">Bạn cần hỗ trợ gì?</h2>
                    <p className="contact-section-desc">
                        Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng <strong>24 giờ</strong>.
                    </p>

                    {submitted ? (
                        <div className="contact-success">
                            <div className="success-icon">✅</div>
                            <h3>Gửi thành công!</h3>
                            <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                            <button className="contact-reset-btn" onClick={() => setSubmitted(false)}>
                                Gửi tin nhắn khác
                            </button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit} id="contact-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="contact-name">Họ và tên <span className="required">*</span></label>
                                    <div className="input-wrap">
                                        <span className="input-icon">👤</span>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-phone">Số điện thoại <span className="required">*</span></label>
                                    <div className="input-wrap">
                                        <span className="input-icon">📱</span>
                                        <input
                                            id="contact-phone"
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="0969 037 123"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact-email">Email</label>
                                <div className="input-wrap">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact-subject">Chủ đề <span className="required">*</span></label>
                                <div className="input-wrap select-wrap">
                                    <span className="input-icon">📋</span>
                                    <select
                                        id="contact-subject"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Chọn chủ đề --</option>
                                        <option value="datve">Đặt vé xe</option>
                                        <option value="lichxe">Lịch xe & Tuyến đường</option>
                                        <option value="giave">Giá vé & Khuyến mãi</option>
                                        <option value="khieunat">Khiếu nại & Góp ý</option>
                                        <option value="khac">Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact-message">Nội dung <span className="required">*</span></label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder="Nhập nội dung bạn muốn nhắn gửi..."
                                    rows={5}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="contact-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner"></span> Đang gửi...</>
                                ) : (
                                    <>✈️ Gửi tin nhắn</>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* ── Right: Office List ── */}
                <div className="contact-offices-section">
                    <div className="contact-section-label">
                        <span className="label-line"></span>
                        <span>HỆ THỐNG VĂN PHÒNG</span>
                        <span className="label-line"></span>
                    </div>
                    <h2 className="contact-section-title">Văn phòng của chúng tôi</h2>

                    {offices.map((office) => (
                        <div className="office-city-block" key={office.city}>
                            <div className="office-city-header" style={{ borderColor: office.color }}>
                                <span className="office-city-icon">{office.icon}</span>
                                <h3 style={{ color: office.color }}>Tại {office.city}</h3>
                            </div>
                            <div className="office-branches">
                                {office.branches.map((branch) => (
                                    <div className="office-branch-item" key={branch.name}>
                                        <div className="branch-dot" style={{ background: office.color }}></div>
                                        <div className="branch-info">
                                            <strong>{branch.name}</strong>
                                            <span>{branch.address}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Hotline card */}
                    <div className="contact-hotline-card">
                        <div className="hotline-ring">📞</div>
                        <div className="hotline-details">
                            <p className="hotline-label">Hotline đặt vé – hỗ trợ 7/7</p>
                            <a href="tel:0969037123" className="hotline-num">0969 037 123</a>
                            <a href="tel:0969037456" className="hotline-num">0969 037 456</a>
                        </div>
                    </div>

                    {/* Social links */}
                    <div className="contact-social-row">
                        <a
                            href="https://www.facebook.com/nhaxedonghuongsonglam"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link facebook"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            Facebook
                        </a>
                        <a href="tel:0969037123" className="social-link zalo">
                            📱 Zalo
                        </a>
                        <a href="https://m.me/" target="_blank" rel="noopener noreferrer" className="social-link messenger">
                            💬 Messenger
                        </a>
                    </div>
                </div>
            </div>

            {/* ── Service Image Banner ── */}
            <div className="contact-service-banner">
                <img src={serviceImg} alt="Dịch vụ xe giường nằm Đồng Hương Sông Lam" className="service-banner-img" />
                <div className="service-banner-overlay">
                    <div className="service-banner-content">
                        <h2>Dịch Vụ Xe Giường Nằm</h2>
                        <p>Tuyến xe: <strong>Nghệ An – Hà Nội</strong> &nbsp;|&nbsp; Limousine 2025 – Tiện nghi, An toàn</p>
                        <a href="/booking" className="service-cta-btn">Đặt vé ngay →</a>
                    </div>
                </div>
            </div>

            {/* ── Google Map ── */}
            <div className="contact-map-section">
                <div className="contact-section-label" style={{ padding: '0 20px 20px' }}>
                    <span className="label-line"></span>
                    <span>BẢN ĐỒ</span>
                    <span className="label-line"></span>
                </div>
                <div className="contact-map-wrap">
                    <iframe
                        title="Bản đồ Đồng Hương Sông Lam - Văn phòng Mỗ Lao"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0987063505497!2d105.77247677507776!3d21.031241080618834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4e61cfbe01%3A0x5a58f4f41e33c6f0!2zMzY0IFAuTmd1eeG7hW4gVsSDbiBM4buZYywgTOG6rWMgTmluaCwgSMOgIMSQw7RuZywgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1709876543210!5m2!1svi!2s"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
