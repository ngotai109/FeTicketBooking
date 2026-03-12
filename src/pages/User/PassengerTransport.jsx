import React, { useState } from 'react';
import '../../assets/styles/PassengerTransport.css';

import img1 from '../../assets/images/483548392_996185719283215_6023502181359507049_n.jpg';
import img2 from '../../assets/images/483926643_996853629216424_7820725980001898967_n.jpg';
import img3 from '../../assets/images/484079053_996185689283218_3313850242335030153_n.jpg';
import img4 from '../../assets/images/483865268_996185659283221_5098812769290067135_n.jpg';

const amenities = [
    { icon: '🛏️', title: 'Giường nằm 2 tầng', desc: 'Cabin giường nằm riêng tư, đệm dày êm ái, chăn gối sạch sẽ tiêu chuẩn khách sạn' },
    { icon: '❄️', title: 'Điều hòa cá nhân', desc: 'Mỗi cabin có điều hòa riêng, điều chỉnh nhiệt độ theo sở thích hành khách' },
    { icon: '🎵', title: 'Hệ thống âm thanh', desc: 'Loa âm thanh nổi, ánh sáng LED dịu nhẹ tạo không gian thư giãn tuyệt vời' },
    { icon: '🔌', title: 'Sạc USB & Wifi', desc: 'Cổng sạc USB tại mỗi chỗ ngồi và wifi miễn phí trong suốt hành trình' },
    { icon: '🪟', title: 'Rèm che riêng tư', desc: 'Rèm cửa cách âm giúp không gian riêng tư, ngủ ngon không lo bị làm phiền' },
    { icon: '🧴', title: 'Tiện nghi vệ sinh', desc: 'Nhà vệ sinh trên xe sạch sẽ, nước rửa tay, khăn lạnh phục vụ miễn phí' },
];

const routes = [
    { from: 'Hà Nội', to: 'Vinh (Nghệ An)', duration: '~5 tiếng', departure: ['07:00', '13:00', '19:00', '21:00'] },
    { from: 'Hà Nội', to: 'Hà Tĩnh', duration: '~6 tiếng', departure: ['07:00', '13:00', '20:00', '22:00'] },
    { from: 'Vinh (Nghệ An)', to: 'Hà Nội', duration: '~5 tiếng', departure: ['06:00', '12:00', '18:00', '21:00'] },
    { from: 'Hà Tĩnh', to: 'Hà Nội', duration: '~6 tiếng', departure: ['06:00', '11:00', '17:00', '20:00'] },
];

const gallery = [
    { src: img1, caption: 'Cabin giường nằm cao cấp – không gian riêng tư', alt: 'Hành khách nằm nghỉ ngơi thoải mái trên xe Đồng Hương Sông Lam' },
    { src: img2, caption: 'Hành khách hài lòng với trải nghiệm trên xe', alt: 'Hai hành khách trong nội thất xe giường nằm Đồng Hương Sông Lam' },
    { src: img3, caption: 'Xe giường nằm 2 tầng hiện đại, tiêu chuẩn cao', alt: 'Nhân viên giới thiệu nội thất xe giường nằm 2 tầng' },
    { src: img4, caption: 'Đội ngũ phục vụ chuyên nghiệp, tận tâm', alt: 'Nhân viên chào đón hành khách lên xe Đồng Hương Sông Lam' },
];

const PassengerTransport = () => {
    const [activeImg, setActiveImg] = useState(0);

    return (
        <div className="passenger-page">

            {/* ===== HERO ===== */}
            <div className="passenger-hero">
                <div className="passenger-hero-bg" style={{ backgroundImage: `url(${img2})` }} />
                <div className="passenger-hero-overlay" />
                <div className="passenger-hero-content">
                    <span className="passenger-badge">Dịch vụ vận tải</span>
                    <h1>Vận Chuyển Hành Khách</h1>
                    <p>Trải nghiệm hành trình đẳng cấp trên xe giường nằm cao cấp<br />tuyến <strong>Nghệ An – Hà Nội</strong> cùng Đồng Hương Sông Lam</p>
                    <div className="passenger-hero-btns">
                        <a href="/booking" className="passenger-btn-primary">🎫 Đặt vé ngay</a>
                        <a href="tel:0969037123" className="passenger-btn-secondary">📞 0969.037.123</a>
                    </div>
                </div>
            </div>

            <div className="passenger-container">

                {/* ===== INTRO ===== */}
                <section className="passenger-intro">
                    <div className="passenger-intro-left">
                        <span className="passenger-section-badge">Về dịch vụ</span>
                        <h2>Hành Trình Thoải Mái – Đến Nơi An Toàn</h2>
                        <p>
                            Đồng Hương Sông Lam tự hào cung cấp dịch vụ vận chuyển hành khách
                            trên tuyến <strong>Nghệ An – Hà Tĩnh – Hà Nội</strong> với đội xe giường nằm
                            2 tầng cao cấp, tiêu chuẩn hiện đại nhất hiện nay.
                        </p>
                        <p>
                            Mỗi chuyến đi là một trải nghiệm trọn vẹn – từ cabin giường nằm riêng tư,
                            hệ thống ánh sáng LED dịu nhẹ, đến đội ngũ nhân viên phục vụ tận tâm,
                            luôn đồng hành cùng bạn trên mọi hành trình.
                        </p>
                        <div className="passenger-stats">
                            <div className="passenger-stat">
                                <span className="pstat-num">5+</span>
                                <span className="pstat-lbl">Năm hoạt động</span>
                            </div>
                            <div className="passenger-stat">
                                <span className="pstat-num">200+</span>
                                <span className="pstat-lbl">Chuyến/tháng</span>
                            </div>
                            <div className="passenger-stat">
                                <span className="pstat-num">98%</span>
                                <span className="pstat-lbl">Khách hài lòng</span>
                            </div>
                        </div>
                    </div>
                    <div className="passenger-intro-right">
                        <img src={img3} alt="Xe giường nằm cao cấp Đồng Hương Sông Lam" className="passenger-intro-img" />
                    </div>
                </section>

                {/* ===== GALLERY ===== */}
                <section className="passenger-gallery-section">
                    <div className="passenger-section-header">
                        <span className="passenger-section-badge">Hình ảnh thực tế</span>
                        <h2>Nội Thất Xe Cao Cấp</h2>
                        <p>Không gian sang trọng, sạch sẽ – chuẩn mực của mỗi chuyến đi</p>
                    </div>
                    <div className="passenger-gallery">
                        <div className="gallery-main">
                            <img
                                src={gallery[activeImg].src}
                                alt={gallery[activeImg].alt}
                                className="gallery-main-img"
                            />
                            <div className="gallery-main-caption">{gallery[activeImg].caption}</div>
                        </div>
                        <div className="gallery-thumbs">
                            {gallery.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`gallery-thumb ${activeImg === idx ? 'active' : ''}`}
                                    onClick={() => setActiveImg(idx)}
                                >
                                    <img src={item.src} alt={item.alt} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== AMENITIES ===== */}
                <section className="passenger-amenities-section">
                    <div className="passenger-section-header">
                        <span className="passenger-section-badge">Tiện nghi trên xe</span>
                        <h2>Đầy Đủ Tiện Nghi – Xứng Tầm Đẳng Cấp</h2>
                        <p>Mỗi chỗ ngồi được trang bị đầy đủ để bạn có một hành trình thư giãn nhất</p>
                    </div>
                    <div className="passenger-amenities-grid">
                        {amenities.map((item, idx) => (
                            <div className="amenity-card" key={idx}>
                                <div className="amenity-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== ROUTES ===== */}
                <section className="passenger-routes-section">
                    <div className="passenger-section-header">
                        <span className="passenger-section-badge">Lịch trình</span>
                        <h2>Các Tuyến Đường Hoạt Động</h2>
                        <p>Chúng tôi xuất phát nhiều chuyến trong ngày để phù hợp với lịch của bạn</p>
                    </div>
                    <div className="passenger-routes-grid">
                        {routes.map((route, idx) => (
                            <div className="route-card" key={idx}>
                                <div className="route-header">
                                    <div className="route-path">
                                        <span className="route-city from">{route.from}</span>
                                        <span className="route-arrow">✈</span>
                                        <span className="route-city to">{route.to}</span>
                                    </div>
                                    <span className="route-duration">⏱ {route.duration}</span>
                                </div>
                                <div className="route-departures">
                                    <p className="route-dep-label">Giờ xuất phát:</p>
                                    <div className="route-dep-times">
                                        {route.departure.map((t, i) => (
                                            <span className="dep-time" key={i}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <a href="/booking" className="route-book-btn">Đặt vé tuyến này →</a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== CTA BANNER ===== */}
                <section className="passenger-cta-section">
                    <div className="passenger-cta-left">
                        <img src={img4} alt="Dịch vụ hành khách Đồng Hương Sông Lam" />
                    </div>
                    <div className="passenger-cta-right">
                        <h2>Sẵn Sàng Cho Chuyến Đi Tiếp Theo?</h2>
                        <p>
                            Đặt vé ngay hôm nay để đảm bảo chỗ ngồi tốt nhất.<br />
                            Hoặc liên hệ trực tiếp với chúng tôi để được tư vấn lịch trình phù hợp.
                        </p>
                        <div className="passenger-cta-actions">
                            <a href="/booking" className="passenger-btn-primary large">🎫 Đặt vé online ngay</a>
                            <div className="passenger-cta-contacts">
                                <a href="tel:0969037123" className="cta-phone-link">
                                    <span>📞</span> 0969.037.123
                                </a>
                                <a href="tel:0969037456" className="cta-phone-link">
                                    <span>📞</span> 0969.037.456
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default PassengerTransport;
