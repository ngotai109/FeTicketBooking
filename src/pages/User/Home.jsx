import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Home.css';
import bg3 from '../../assets/images/bg3.jpg';

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const Home = () => {
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        // Implement search navigation
        console.log("Searching for:", departure, destination, date);
    };

    const handleSwap = () => {
        setDeparture(destination);
        setDestination(departure);
    };

    return (
        <div className="home-container">
            <div className="search-widget">
                <div className="search-form">
                    <div className="input-group">
                        <label><LocationIcon />Điểm khởi hành</label>
                        <input
                            type="text"
                            placeholder="Nhập điểm khởi hành"
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                        />
                    </div>

                    <button className="swap-button" onClick={handleSwap}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>⇌</span>
                    </button>

                    <div className="input-group">
                        <label><LocationIcon /> Điểm đến</label>
                        <input
                            type="text"
                            placeholder="Nhập điểm đến"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>

                    <div className="input-group date-group">
                        <label>Ngày đi</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <button className="search-button" onClick={handleSearch}>
                        <span style={{ fontSize: '18px' }}>🔍</span> Tìm vé xe
                    </button>
                </div>

                <div className="booking-steps-section">
                    <h3>DỄ DÀNG ĐẶT VÉ XE TRÊN WEBSITE</h3>
                    <div className="booking-steps">
                        <div className="step-item">
                            <div className="step-icon">
                                <span>🔍</span>
                            </div>
                            <h4>Tìm kiếm</h4>
                            <p>Chọn thông tin hành trình ấn "Đặt vé"</p>
                        </div>
                        <div className="step-arrow">➔</div>
                        <div className="step-item">
                            <div className="step-icon">
                                <span>🚌</span>
                            </div>
                            <h4>Chọn chuyến</h4>
                            <p>Lựa chọn chỗ ngồi phù hợp và điền thông tin cá nhân</p>
                        </div>
                        <div className="step-arrow">➔</div>
                        <div className="step-item">
                            <div className="step-icon">
                                <span>💳</span>
                            </div>
                            <h4>Thanh toán</h4>
                            <p>Tiến hành thanh toán online hoặc giữ chỗ trước</p>
                        </div>
                        <div className="step-arrow">➔</div>
                        <div className="step-item">
                            <div className="step-icon">
                                <span>🎟️</span>
                            </div>
                            <h4>Nhận vé</h4>
                            <p>Nhận mã vé, xác nhận và lên xe!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section className="home-about-section">
                <div className="about-content">
                    <div className="about-text">
                        <div className="about-header">
                            <h2>Giới thiệu về <strong>Đồng Hương Sông Lam</strong></h2>
                        </div>
                        <p className="about-desc">
                            Đồng Hương Sông Lam – thương hiệu vận tải số 1 trên tuyến Nghệ An – Hà Nội – Nội Bài – Phú Thọ .
                            Với đội ngũ tài xế chuyên nghiệp cùng hệ thống xe limousine cabin, giường nằm hiện đại bậc nhất tại Việt Nam.
                            Tân Kim Chi sẽ mang đến sự sang trọng, tiện nghi và an toàn cho hành khách.
                        </p>

                        <div className="office-system">
                            <h3>Hệ thống văn phòng</h3>

                            <div className="office-group">
                                <div className="city-title">
                                    <span className="city-icon"><LocationIcon /></span> Tại Hà Nội
                                </div>
                                <div className="office-list">
                                    <div className="office-item">
                                        <span className="item-icon">🏢</span> VP Mỗ Lao:364 P.Nguyễn Văn Lộc, Khu đô thị Mỗ Lao, Hà Đông
                                    </div>
                                    <div className="office-item">
                                        <span className="item-icon">🏢</span> VP Trần Vỹ:160 P.Trần Vỹ, Mai Dịch, Cầu Giấy
                                    </div>
                                    <div className="office-item">
                                        <span className="item-icon">🏢</span> VP Giải Phóng : 769 Giải Phóng, Hoàng Mai
                                    </div>
                                </div>
                            </div>
                            <div className="office-group">
                                <div className="city-title">
                                    <span className="city-icon"><LocationIcon /></span> Tại Nghệ An
                                </div>
                                <div className="office-list">
                                    <div className="office-item">
                                        <span className="item-icon">🏢</span> Bến xe Nước Ngầm: Số 1 Ngọc Hồi, Hoàng Liệt, Hoàng Mai
                                    </div>
                                </div>
                            </div>

                            <div className="hotline-box">
                                <div className="hotline-title">📞 Hotline</div>
                                <div className="hotline-number">
                                    <span>🔍</span> Đặt vé: 1900.51.51
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-image-container">
                        <img src={bg3} alt="Giới thiệu Tân Kim Chi" className="about-main-image" />
                        <div className="contact-footer-info">
                            LIÊN HỆ ĐẶT VÉ: <strong>1900 5151</strong>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
