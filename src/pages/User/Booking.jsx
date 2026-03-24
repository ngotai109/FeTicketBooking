import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/styles/Booking.css';
import bg3 from '../../assets/images/bg3.jpg';
import noScheduleImg from '../../assets/images/route-no-schedule-2.png';
import { getBusLayout } from '../../constants/busLayouts';

const LOCATIONS = [
    'Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Vinh (Nghệ An)', 'Thanh Hóa', 'Huế', 'Nam Định', 'Thái Bình'
];

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchData = location.state || { departure: '', destination: '', date: '' };
    const [departure, setDeparture] = useState(searchData.departure);
    const [destination, setDestination] = useState(searchData.destination);
    const [showDepList, setShowDepList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);
    const [date, setDate] = useState(searchData.date);
    const [sortType, setSortType] = useState('earliest');

    // MOCK DATA: Chuyến đi
    const trips = [
        {
            id: 101, type: 'Limousine giường CABIN', busType: '22', departureTime: '17:00', arrivalTime: '05:00',
            departurePoint: 'BX Nước Ngầm, Hà Nội', arrivalPoint: 'VP Vinh, Nghệ An', duration: '6h00',
            price: 350000, availableSeats: 16, image: bg3
        },
        {
            id: 102, type: 'Limousine 34 Giường', busType: '34', departureTime: '18:30', arrivalTime: '06:30',
            departurePoint: 'BX Nam Trần, Đà Nẵng', arrivalPoint: 'BX Mỹ Đình, Hà Nội', duration: '12h00',
            price: 500000, availableSeats: 12, image: bg3
        },
        {
            id: 103, type: 'Xe Giường Nằm 40 Chỗ', busType: '40', departureTime: '21:00', arrivalTime: '04:00',
            departurePoint: 'BX Giáp Bát, Hà Nội', arrivalPoint: 'BX Chợ Vinh', duration: '7h00',
            price: 250000, availableSeats: 25, image: bg3
        }
    ];

    // --- State cho hệ thống Mua Vé ---
    const [expandedTripId, setExpandedTripId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookingStep, setBookingStep] = useState(1); // 1: Chọn chỗ, 2: Thông tin, 3: Thanh toán
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', pickup: '', dropoff: '', note: '' });
    const [paymentMethod, setPaymentMethod] = useState('vnpay');

    const toggleExpand = (tripId) => {
        if (expandedTripId === tripId) {
            setExpandedTripId(null);
        } else {
            setExpandedTripId(tripId);
            setSelectedSeats([]);
            setBookingStep(1);
        }
    };

    const handleSeatToggle = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            if (selectedSeats.length >= 6) {
                toast.warning('Chỉ được chọn tối đa 6 ghế trên mỗi giao dịch!');
                return;
            }
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const renderSeatMap = (trip) => {
        const layout = getBusLayout(trip.busType || '34');
        return (
            <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
                {/* Lưới Legend / Chú thích y hệt ảnh */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '16px', background: '#b3d4ff', borderRadius: '4px' }}></div><span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>Trống</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '16px', background: '#fbedce', borderRadius: '4px' }}></div><span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>Đặt</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '16px', background: '#f5c6cb', borderRadius: '4px' }}></div><span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>Bán</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '16px', background: '#e2e3e5', borderRadius: '4px' }}></div><span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>Giữ</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '24px', height: '16px', background: '#c3e6cb', borderRadius: '4px' }}></div><span style={{ fontSize: '13px', color: '#4a5568', fontWeight: '500' }}>Tạm</span></div>
                </div>

                <div style={{ display: 'flex', gap: '60px', justifyContent: 'center' }}>
                    {/* Tầng 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748', fontWeight: '700', fontSize: '16px' }}>Tầng 1</h4>
                        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${layout.columns}, 54px)`, gap: '15px' }}>
                            {/* Biểu tượng Vô lăng Tài xế */}
                            <div style={{ position: 'absolute', top: '-40px', left: '0', fontSize: '24px' }}>👨‍✈️</div>
                            {layout.floor1.map(seat => {
                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                // Render logic for mock states (Giả lập màu)
                                let bgColor = '#b3d4ff'; // Trống
                                let color = '#2d3748';
                                if (isSelected) {
                                    bgColor = '#c3e6cb'; // Tạm (Đang chọn)
                                } else if (seat.seatNumber === 'A1' || seat.seatNumber === 'A2') {
                                    bgColor = '#f5c6cb'; // Bán mốc
                                } else if (seat.seatNumber === 'B1' || seat.seatNumber === 'B2') {
                                    bgColor = '#e2e3e5'; // Giữ mốc
                                } else if (seat.seatNumber === 'C1') {
                                    bgColor = '#fbedce'; // Đặt mốc
                                }

                                return (
                                    <div key={seat.seatNumber} onClick={() => {
                                        if (bgColor !== '#b3d4ff' && !isSelected) return; // Khóa ghế không trống
                                        handleSeatToggle(seat.seatNumber);
                                    }}
                                        style={{
                                            gridRow: seat.row + 1, gridColumn: seat.col + 1, height: '32px',
                                            background: bgColor, color: color,
                                            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: '600', cursor: bgColor === '#b3d4ff' || isSelected ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                        {seat.seatNumber}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tầng 2 */}
                    {layout.floor2 && layout.floor2.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748', fontWeight: '700', fontSize: '16px' }}>Tầng 2</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${layout.columns}, 54px)`, gap: '15px' }}>
                                {layout.floor2.map(seat => {
                                    const isSelected = selectedSeats.includes(seat.seatNumber);
                                    let bgColor = '#b3d4ff'; // Trống
                                    let color = '#2d3748';
                                    if (isSelected) bgColor = '#c3e6cb';

                                    return (
                                        <div key={seat.seatNumber} onClick={() => handleSeatToggle(seat.seatNumber)}
                                            style={{
                                                gridRow: seat.row + 1, gridColumn: seat.col + 1, height: '32px',
                                                background: bgColor, color: color,
                                                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}>
                                            {seat.seatNumber}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        toast.success('Hệ thống đang chuyển hướng tới Cổng Thanh Toán VNPay...');
        setTimeout(() => {
            toast.success('Thanh toán thành công! Mã vé của bạn là #TK-8921');
            setExpandedTripId(null);
            navigate('/lookup/ticket');
        }, 3000);
    };

    return (
        <div className="booking-page">
            {/* Top Search Modifier Bar - Sticky */}
            <div className="search-modifier-bar">
                <div className="container">
                    <div className="modifier-inputs">
                        <div className="mod-input custom-select-wrapper">
                            <label>Điểm khởi hành</label>
                            <div className="custom-select-display" onClick={() => setShowDepList(!showDepList)}>{departure || 'Chọn điểm đi'}</div>
                            {showDepList && (
                                <ul className="custom-select-list">
                                    {LOCATIONS.map(loc => (
                                        <li key={loc} onClick={() => { setDeparture(loc); setShowDepList(false); }} className={departure === loc ? 'active' : ''}>{loc}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mod-swap" onClick={() => { const temp = departure; setDeparture(destination); setDestination(temp); }}>⇌</div>
                        <div className="mod-input custom-select-wrapper">
                            <label>Nơi đến</label>
                            <div className="custom-select-display" onClick={() => setShowDestList(!showDestList)}>{destination || 'Chọn điểm đến'}</div>
                            {showDestList && (
                                <ul className="custom-select-list">
                                    {LOCATIONS.map(loc => (
                                        <li key={loc} onClick={() => { setDestination(loc); setShowDestList(false); }} className={destination === loc ? 'active' : ''}>{loc}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mod-input">
                            <label>Ngày đi</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <button className="mod-search-btn">TÌM VÉ XE</button>
                    </div>
                </div>
            </div>

            <div className="container booking-content" style={{ display: 'block', paddingBottom: '30px' }}>
                
                {/* Thanh Lọc Ngang & Sắp Xếp */}
                <div className="filter-sort-bar">
                    <div className="filter-group">
                         {/* Dropdowns */}
                         <div className="filter-controls">
                             <select className="filter-select">
                                 <option value="">Khoảng Giờ đi</option>
                                 <option>00:00 - 06:00 (Sáng sớm)</option>
                                 <option>06:00 - 12:00 (Sáng)</option>
                                 <option>12:00 - 18:00 (Chiều)</option>
                                 <option>18:00 - 24:00 (Tối)</option>
                             </select>
                             <select className="filter-select">
                                 <option value="">Khoảng Giá vé</option>
                                 <option>Dưới 200,000 đ</option>
                                 <option>200,000 đ - 500,000 đ</option>
                                 <option>Từ 500,000 đ trở lên</option>
                             </select>
                             <select className="filter-select">
                                 <option value="">Loại Xe</option>
                                 <option>Xe Limousine VIP</option>
                                 <option>Xe Giường Nằm Tiêu Chuẩn</option>
                             </select>
                             <button className="clear-filter-btn">Xóa lọc</button>
                         </div>
                    </div>

                    <div className="sort-group">
                        <span className="sort-label">Sắp xếp theo:</span>
                        <div className="sort-actions">
                            <button className={`sort-tab ${sortType === 'earliest' ? 'active' : ''}`} onClick={() => setSortType('earliest')}>Giờ đi</button>
                            <button className={`sort-tab ${sortType === 'price-asc' ? 'active' : ''}`} onClick={() => setSortType('price-asc')}>Giá tăng dần</button>
                        </div>
                    </div>
                </div>

                {/* Main Results List */}
                <main style={{ width: '100%' }}>
                    <div className="trip-list">
                        {trips.length > 0 ? (
                            trips.map(trip => (
                                <div key={trip.id} className="trip-card">
                                    <div className="trip-main-info">
                                        <div className="trip-image">
                                            <img src={trip.image} alt="Bus" />
                                            <div className="trip-notice">KHUYẾN MÃI TỚI 20%</div>
                                        </div>

                                        <div className="trip-details">
                                            <div className="bus-type">{trip.type}</div>
                                            <div className="trip-timeline">
                                                <div className="time-point">
                                                    <span className="time">{trip.departureTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.departurePoint}</span>
                                                </div>
                                                <div className="duration-line"><span className="duration">{trip.duration}</span></div>
                                                <div className="time-point">
                                                    <span className="time arrival">{trip.arrivalTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.arrivalPoint}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="trip-pricing">
                                            <div className="price-value">
                                                {trip.price.toLocaleString('vi-VN')} đ
                                            </div>
                                            <div className="seat-status">Còn {trip.availableSeats} chỗ trống</div>
                                            <button 
                                                className={`select-seat-btn ${expandedTripId === trip.id ? 'active' : ''}`}
                                                onClick={() => toggleExpand(trip.id)}
                                            >
                                                {expandedTripId === trip.id ? 'Đóng ▴' : 'Chọn chỗ ▾'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* --- GIAO DIỆN ĐẶT VÉ NẰM TRONG CARD --- */}
                                    {expandedTripId === trip.id && (
                                        <div style={{ borderTop: '2px dashed #e2e8f0', padding: '25px', background: '#f8fafc', display: 'flex', gap: '30px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                            {renderSeatMap(trip)}

                                            {/* Phần Tổng kết Ghế Đã Chọn Bên Phải */}
                                            <div style={{ flex: 1, padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#2d3748', fontWeight: '700', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>Thông tin vé đang chọn</h3>
                                                
                                                {selectedSeats.length === 0 ? (
                                                    <div style={{ padding: '30px', background: '#edf2f7', borderRadius: '12px', textAlign: 'center', color: '#718096', margin: 'auto 0' }}>
                                                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>💺</div>
                                                        Vui lòng click chọn ghế ở cấu hình xe bên trái để tiếp tục.
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#4a5568', fontSize: '15px' }}>
                                                            <span>Chuyến xe:</span>
                                                            <span style={{ fontWeight: '600', color: '#2d3748' }}>{trip.departureTime} • {trip.departurePoint.split(',')[0]}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#4a5568', fontSize: '15px' }}>
                                                            <span>Loại xe:</span>
                                                            <span style={{ fontWeight: '600', color: '#2d3748' }}>{trip.type}</span>
                                                        </div>

                                                        <div style={{ marginBottom: '20px' }}>
                                                            <div style={{ color: '#4a5568', fontSize: '15px', marginBottom: '10px' }}>Ghế đã chọn ({selectedSeats.length}):</div>
                                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                                {selectedSeats.map(s => <span key={s} style={{ background: '#e6fffa', color: '#2c7a7b', border: '1px solid #81e6d9', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold' }}>{s}</span>)}
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
                                                            <span style={{ color: '#4a5568' }}>Tạm tính:</span>
                                                            <span style={{ color: '#e53e3e', fontSize: '24px' }}>{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => navigate('/checkout', { state: { trip, selectedSeats } })} 
                                                            style={{ width: '100%', padding: '16px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 6px rgba(49, 130, 206, 0.3)' }}
                                                        >
                                                            TIẾP TỤC ĐẶT VÉ
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <h2>Không tìm thấy chuyến xe</h2>
                                <div className="empty-bus-img"><img src={noScheduleImg} alt="No Schedule" style={{ width: '100%', maxWidth: '300px' }} /></div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Booking;
