import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../assets/styles/Booking.css';
import bg3 from '../../assets/images/bg3.jpg';
import noScheduleImg from '../../assets/images/route-no-schedule-2.png';

const LOCATIONS = [
    'Hà Nội',
    'Đà Nẵng',
    'TP. Hồ Chí Minh',
    'Vinh (Nghệ An)',
    'Thanh Hóa',
    'Huế',
    'Nam Định',
    'Thái Bình'
];

const Booking = () => {

    const location = useLocation();
    const searchData = location.state || { departure: '', destination: '', date: '' };
    const [departure, setDeparture] = useState(searchData.departure);
    const [destination, setDestination] = useState(searchData.destination);
    const [showDepList, setShowDepList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);
    const [date, setDate] = useState(searchData.date);


    // Mock data for trips
    const trips = [
        {
            id: 1,
            type: 'Limousine giường phòng 24 chỗ (CABIN)',
            departureTime: '17:00',
            arrivalTime: '05:00',
            departurePoint: 'VP Thị Trấn - Anh Sơn, Nghệ An',
            arrivalPoint: 'BX Mỹ Đình, Hà Nội',
            duration: '12h00',
            price: '370.000',
            availableSeats: 16,
            image: bg3
        },
        {
            id: 2,
            type: 'Limousine giường phòng 24 chỗ (CABIN)',
            departureTime: '18:30',
            arrivalTime: '06:30',
            departurePoint: 'BX Nam Trần, Đà Nẵng',
            arrivalPoint: 'BX Mỹ Đình, Hà Nội',
            duration: '12h00',
            price: '500.000',
            availableSeats: 12,
            image: bg3
        },
        {
            id: 1,
            type: 'Limousine giường phòng 24 chỗ (CABIN)',
            departureTime: '17:00',
            arrivalTime: '05:00',
            departurePoint: 'VP Thị Trấn - Anh Sơn, Nghệ An',
            arrivalPoint: 'BX Mỹ Đình, Hà Nội',
            duration: '12h00',
            price: '370.000',
            availableSeats: 16,
            image: bg3
        },
        {
            id: 2,
            type: 'Limousine giường phòng 24 chỗ (CABIN)',
            departureTime: '18:30',
            arrivalTime: '06:30',
            departurePoint: 'BX Nam Trần, Đà Nẵng',
            arrivalPoint: 'BX Mỹ Đình, Hà Nội',
            duration: '12h00',
            price: '500.000',
            availableSeats: 12,
            image: bg3
        }
    ];

    const [sortType, setSortType] = useState('earliest');

    return (
        <div className="booking-page">
            {/* Top Search Modifier Bar - Sticky */}
            <div className="search-modifier-bar">
                <div className="container">
                    <div className="modifier-inputs">
                        <div className="mod-input custom-select-wrapper">
                            <label>Điểm khởi hành</label>
                            <div className="custom-select-display" onClick={() => setShowDepList(!showDepList)}>
                                {departure}
                            </div>
                            {showDepList && (
                                <ul className="custom-select-list">
                                    {LOCATIONS.map(loc => (
                                        <li
                                            key={loc}
                                            onClick={() => { setDeparture(loc); setShowDepList(false); }}
                                            className={departure === loc ? 'active' : ''}
                                        >
                                            {loc}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mod-swap">⇌</div>
                        <div className="mod-input custom-select-wrapper">
                            <label>Nơi đến</label>
                            <div className="custom-select-display" onClick={() => setShowDestList(!showDestList)}>
                                {destination}
                            </div>
                            {showDestList && (
                                <ul className="custom-select-list">
                                    {LOCATIONS.map(loc => (
                                        <li
                                            key={loc}
                                            onClick={() => { setDestination(loc); setShowDestList(false); }}
                                            className={destination === loc ? 'active' : ''}
                                        >
                                            {loc}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mod-input">
                            <label>Điểm đến</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <button className="mod-search-btn">TÌM VÉ XE</button>
                    </div>
                </div>
            </div>

            <div className="container booking-content">
                {/* Sidebar Filters - Sticky */}
                <aside className="filter-sidebar">
                    <div className="filter-header">
                        <span>Bộ lọc tìm kiếm</span>
                        <button className="reset-filter">Xóa lọc</button>
                    </div>

                    <div className="filter-section">
                        <h4>Tiêu chí phổ biến</h4>
                        <div className="checkbox-group">
                            <label><input type="checkbox" /> Giảm giá</label>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Giờ đi</h4>
                        <input type="range" className="range-slider" min="0" max="1439" />
                        <div className="range-labels">
                            <span>00:00</span>
                            <span>23:59</span>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Giá vé</h4>
                        <input type="range" className="range-slider" min="0" max="2000000" />
                        <div className="range-labels">
                            <span>0 đ</span>
                            <span>2.000.000 đ</span>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Số chỗ trống</h4>
                        <input type="range" className="range-slider" min="0" max="50" />
                        <div className="range-labels">
                            <span>0</span>
                            <span>50</span>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Điểm đón</h4>
                        <input type="text" placeholder="Nhập điểm đón" className="sidebar-search-input" />
                    </div>

                    <div className="filter-section">
                        <h4>Điểm trả</h4>
                        <input type="text" placeholder="Nhập điểm trả" className="sidebar-search-input" />
                    </div>

                    <div className="filter-section">
                        <h4>Loại xe</h4>
                        <div className="checkbox-group">
                            <label><input type="checkbox" /> Xe Limousine</label>
                            <label><input type="checkbox" /> Xe thường</label>
                        </div>
                    </div>
                </aside>

                {/* Main Results List */}
                <main className="results-list-section">
                    <div className="sort-bar">
                        <span className="sort-label">Sắp xếp theo:</span>
                        <div className="sort-tabs">
                            <button
                                className={`sort-tab ${sortType === 'earliest' ? 'active' : ''}`}
                                onClick={() => setSortType('earliest')}
                            >
                                Giờ đi sớm nhất
                            </button>
                            <button
                                className={`sort-tab ${sortType === 'latest' ? 'active' : ''}`}
                                onClick={() => setSortType('latest')}
                            >
                                Giờ đi muộn nhất
                            </button>
                            <button
                                className={`sort-tab ${sortType === 'price-asc' ? 'active' : ''}`}
                                onClick={() => setSortType('price-asc')}
                            >
                                Giá tăng dần
                            </button>
                            <button
                                className={`sort-tab ${sortType === 'price-desc' ? 'active' : ''}`}
                                onClick={() => setSortType('price-desc')}
                            >
                                Giá giảm dần
                            </button>
                        </div>
                    </div>

                    <div className="trip-list">
                        {trips.length > 0 ? (
                            trips.map(trip => (
                                <div key={trip.id} className="trip-card">
                                    <div className="trip-main-info">
                                        <div className="trip-image">
                                            <img src={trip.image} alt="Bus" />
                                            <div className="trip-notice">CHÚ Ý Xem thêm...</div>
                                        </div>

                                        <div className="trip-details">
                                            <div className="bus-type">{trip.type}</div>
                                            <div className="trip-timeline">
                                                <div className="time-point">
                                                    <span className="time">{trip.departureTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.departurePoint}</span>
                                                </div>
                                                <div className="duration-line">
                                                    <span className="duration">{trip.duration}</span>
                                                </div>
                                                <div className="time-point">
                                                    <span className="time">{trip.arrivalTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.arrivalPoint}</span>
                                                </div>
                                            </div>
                                            <button className="view-details-btn">Thông tin chi tiết ▾</button>
                                        </div>

                                        <div className="trip-pricing">
                                            <div className="price-value">Từ {trip.price} đ</div>
                                            <div className="seat-status">Còn {trip.availableSeats} ghế trống</div>
                                            <button className="select-seat-btn">Chọn chỗ</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <h2>Không tìm thấy chuyến xe</h2>
                                <p>Hiện tại, hệ thống chưa tìm thấy chuyến đi theo yêu cầu của quý khách, quý khách có thể thử:</p>
                                <div className="help-box">
                                    <div className="help-item">⚙️ Chọn lại các tiêu chí đặt vé</div>
                                    <div className="help-item">📞 Liên hệ tổng đài 1900.51.51 để được hỗ trợ tư vấn và đặt vé</div>
                                </div>
                                <div className="empty-bus-img">
                                    <img src={noScheduleImg} alt="No Schedule" style={{ width: '100%', maxWidth: '300px' }} />
                                </div>

                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Booking;
