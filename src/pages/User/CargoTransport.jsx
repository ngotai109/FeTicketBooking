import React from 'react';
import '../../assets/styles/CargoTransport.css';
import transport1 from '../../assets/images/transport1.jpg';
import transport2 from '../../assets/images/transport2.jpg';

const CargoTransport = () => {
    return (
        <div className="cargo-page">
            {/* Hero Section */}
            <div className="cargo-hero">
                <div className="cargo-hero-overlay" />
                <div className="cargo-hero-content">
                    <span className="cargo-hero-badge">Dịch vụ vận tải</span>
                    <h1>Vận Tải Hàng Hóa</h1>
                    <p>Giải pháp gửi hàng Nghệ An - Hà Nội uy tín, nhanh chóng và tiết kiệm<br />cùng đội xe hiện đại của Đồng Hương Sông Lam</p>
                    <a href="tel:09690037123" className="cargo-hero-cta">
                        <span>📞</span> Liên hệ ngay: 0969.037.123
                    </a>
                </div>
            </div>

            <div className="cargo-container">

                {/* Intro Section */}
                <section className="cargo-intro-section">
                    <div className="cargo-intro-text">
                        <span className="cargo-section-badge">Giới thiệu dịch vụ</span>
                        <h2>Dịch Vụ Gửi Hàng Chất Lượng Cao</h2>
                        <p>
                            Đồng Hương Sông Lam cung cấp dịch vụ vận chuyển hàng hóa trên tuyến
                            <strong> Nghệ An - Hà Nội</strong> và các tỉnh thành lân cận.
                            Với đội ngũ nhân viên chuyên nghiệp, tận tâm và hệ thống xe hiện đại,
                            chúng tôi cam kết giao hàng đúng hẹn, an toàn và nguyên vẹn.
                        </p>
                        <p>
                            Mỗi kiện hàng đều được ghi nhận thông tin đầy đủ, đóng gói cẩn thận
                            và có thể theo dõi trạng thái vận chuyển qua hotline hỗ trợ 24/7.
                        </p>
                        <div className="cargo-intro-stats">
                            <div className="cargo-stat">
                                <span className="cargo-stat-number">10+</span>
                                <span className="cargo-stat-label">Năm kinh nghiệm</span>
                            </div>
                            <div className="cargo-stat">
                                <span className="cargo-stat-number">500+</span>
                                <span className="cargo-stat-label">Đơn hàng/ngày</span>
                            </div>
                            <div className="cargo-stat">
                                <span className="cargo-stat-number">99%</span>
                                <span className="cargo-stat-label">Đúng hẹn</span>
                            </div>
                        </div>
                    </div>
                    <div className="cargo-intro-image">
                        <img src={transport1} alt="Văn phòng giao nhận hàng hóa Đồng Hương Sông Lam" />
                    </div>
                </section>

                {/* Fleet Section */}
                <section className="cargo-fleet-section">
                    <div className="cargo-fleet-image">
                        <img src={transport2} alt="Xe tải Bưu Chính D.H.S.L POST 2025" />
                        <div className="cargo-fleet-badge-overlay">
                            <span>🚛 Xe tải thùng kín – Bưu Chính D.H.S.L POST 2025</span>
                        </div>
                    </div>
                    <div className="cargo-fleet-text">
                        <span className="cargo-section-badge">Đội xe vận tải</span>
                        <h2>Phương Tiện Hiện Đại, An Toàn</h2>
                        <p>
                            Đội xe tải thùng kín thương hiệu <strong>D.H.S.L POST</strong> được trang bị
                            thùng xe chuyên dụng, bảo vệ hàng hóa tránh mưa, bụi và va đập trong suốt
                            hành trình vận chuyển.
                        </p>
                        <ul className="cargo-feature-list">
                            <li>
                                <span className="cargo-feature-icon">✅</span>
                                <span>Thùng xe kín, chống thấm nước và bụi bẩn</span>
                            </li>
                            <li>
                                <span className="cargo-feature-icon">✅</span>
                                <span>Xe mới 100% – đăng kiểm đầy đủ, an toàn tuyệt đối</span>
                            </li>
                            <li>
                                <span className="cargo-feature-icon">✅</span>
                                <span>Tài xế có kinh nghiệm, thông thuộc tuyến đường</span>
                            </li>
                            <li>
                                <span className="cargo-feature-icon">✅</span>
                                <span>GPS định vị hành trình theo thời gian thực</span>
                            </li>
                            <li>
                                <span className="cargo-feature-icon">✅</span>
                                <span>Bảo hiểm hàng hóa trong suốt quá trình vận chuyển</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="cargo-services-section">
                    <div className="cargo-services-header">
                        <span className="cargo-section-badge">Các loại hàng nhận gửi</span>
                        <h2>Chúng Tôi Nhận Vận Chuyển</h2>
                    </div>
                    <div className="cargo-services-grid">
                        {[
                            { icon: '📦', title: 'Hàng bưu phẩm', desc: 'Kiện hàng nhỏ, tài liệu, thư từ, quà tặng cá nhân' },
                            { icon: '🛍️', title: 'Hàng thương mại', desc: 'Hàng kinh doanh, sỉ lẻ, đơn hàng online TMĐT' },
                            { icon: '🏠', title: 'Đồ gia dụng', desc: 'Nội thất, đồ điện tử, thiết bị gia đình' },
                            { icon: '🌾', title: 'Nông sản', desc: 'Thực phẩm đóng gói, đặc sản vùng miền' },
                            { icon: '⚙️', title: 'Máy móc thiết bị', desc: 'Phụ tùng, linh kiện công nghiệp nhẹ' },
                            { icon: '👕', title: 'Hàng may mặc', desc: 'Quần áo, giày dép, phụ kiện thời trang' },
                        ].map((item, idx) => (
                            <div className="cargo-service-card" key={idx}>
                                <div className="cargo-service-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Process Section */}
                <section className="cargo-process-section">
                    <div className="cargo-services-header">
                        <span className="cargo-section-badge">Quy trình gửi hàng</span>
                        <h2>Gửi Hàng Chỉ 4 Bước Đơn Giản</h2>
                    </div>
                    <div className="cargo-process-steps">
                        {[
                            { step: '01', title: 'Liên hệ đặt lịch', desc: 'Gọi hotline hoặc đến trực tiếp văn phòng để đặt lịch gửi hàng', icon: '📞' },
                            { step: '02', title: 'Đóng gói & khai báo', desc: 'Hàng được đóng gói cẩn thận, khai báo loại hàng và người nhận', icon: '📝' },
                            { step: '03', title: 'Vận chuyển', desc: 'Hàng được vận chuyển trên xe chuyên dụng theo lịch trình cố định', icon: '🚛' },
                            { step: '04', title: 'Giao hàng & thanh toán', desc: 'Người nhận xác nhận và thanh toán khi nhận hàng tại điểm đến', icon: '✅' },
                        ].map((item, idx) => (
                            <div className="cargo-step" key={idx}>
                                <div className="cargo-step-number">{item.step}</div>
                                <div className="cargo-step-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing Info */}
                <section className="cargo-pricing-section">
                    <div className="cargo-pricing-card">
                        <div className="cargo-pricing-left">
                            <h2>💰 Bảng Giá Vận Chuyển</h2>
                            <p>Giá cước của chúng tôi cạnh tranh và minh bạch, tính theo trọng lượng và tuyến đường.
                                Liên hệ trực tiếp để được tư vấn và báo giá chính xác.</p>
                            <div className="cargo-price-highlights">
                                <div className="price-highlight-item">
                                    <span>📌</span>
                                    <span>Giá tính theo <strong>kg/kiện</strong></span>
                                </div>
                                <div className="price-highlight-item">
                                    <span>📌</span>
                                    <span>Không phụ phí ẩn</span>
                                </div>
                                <div className="price-highlight-item">
                                    <span>📌</span>
                                    <span>Thanh toán khi nhận hàng</span>
                                </div>
                            </div>
                        </div>
                        <div className="cargo-pricing-right">
                            <h3>📞 Hotline hỗ trợ 24/7</h3>
                            <a href="tel:0969037123" className="cargo-cta-phone">0969.037.123</a>
                            <a href="tel:0969037456" className="cargo-cta-phone secondary">0969.037.456</a>
                            <p className="cargo-cta-note">Hoặc đến trực tiếp văn phòng gần nhất của chúng tôi</p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default CargoTransport;
