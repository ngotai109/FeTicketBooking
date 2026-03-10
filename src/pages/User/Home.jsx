import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Home.css';

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
                        <label>Nơi đi</label>
                        <input
                            type="text"
                            placeholder="Nhập nơi đi"
                            value={departure}
                            onChange={(e) => setDeparture(e.target.value)}
                        />
                    </div>

                    <button className="swap-button" onClick={handleSwap}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>⇌</span>
                    </button>

                    <div className="input-group">
                        <label>Nơi đến</label>
                        <input
                            type="text"
                            placeholder="Nhập nơi đến"
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
        </div>
    );
};

export default Home;
