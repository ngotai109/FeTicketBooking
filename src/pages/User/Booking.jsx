import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';
import '../../assets/styles/Booking.css';
import bg3 from '../../assets/images/bg3.jpg';
import noScheduleImg from '../../assets/images/route-no-schedule-2.png';
import { getBusLayout } from '../../constants/busLayouts';

const Booking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchData = location.state || { departure: '', destination: '', date: '' };
    
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [departure, setDeparture] = useState(searchData.departure);
    const [destination, setDestination] = useState(searchData.destination);
    const [showDepList, setShowDepList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);
    const [date, setDate] = useState(searchData.date);
    const [sortType, setSortType] = useState('earliest');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const [provinceRes, wardRes] = await Promise.all([
                    provinceService.getAllProvincesActive(),
                    wardService.getAllWardsActive()
                ]);
                if (provinceRes && provinceRes.data) {
                    setProvinces(provinceRes.data);
                }
                if (wardRes && wardRes.data) {
                    setWards(wardRes.data);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách địa điểm:', error);
            }
        };
        fetchLocations();
    }, []);

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

    const [expandedTripId, setExpandedTripId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const toggleExpand = (tripId) => {
        if (expandedTripId === tripId) {
            setExpandedTripId(null);
        } else {
            setExpandedTripId(tripId);
            setSelectedSeats([]);
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
            <div className="seat-map-card">
                <div className="seat-legend">
                    <div className="legend-item"><div className="legend-color u-bg-empty"></div><span>Trống</span></div>
                    <div className="legend-item"><div className="legend-color u-bg-booked"></div><span>Đặt</span></div>
                    <div className="legend-item"><div className="legend-color u-bg-sold"></div><span>Bán</span></div>
                    <div className="legend-item"><div className="legend-color u-bg-hold"></div><span>Giữ</span></div>
                    <div className="legend-item"><div className="legend-color u-bg-selecting"></div><span>Đang chọn</span></div>
                </div>

                <div className="floor-container">
                    <div className="floor-section">
                        <h4 className="floor-title">Tầng 1</h4>
                        <div className="seat-grid" style={{ gridTemplateColumns: `repeat(${layout.columns}, 54px)` }}>
                            <div className="steering-wheel">👨‍✈️</div>
                            {layout.floor1.map(seat => {
                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                let statusClass = 'empty';
                                if (isSelected) {
                                    statusClass = 'selecting';
                                } else if (seat.seatNumber === 'A1' || seat.seatNumber === 'A2') {
                                    statusClass = 'sold';
                                } else if (seat.seatNumber === 'B1' || seat.seatNumber === 'B2') {
                                    statusClass = 'hold';
                                } else if (seat.seatNumber === 'C1') {
                                    statusClass = 'booked';
                                }

                                const isSelectable = statusClass === 'empty' || isSelected;

                                return (
                                    <div 
                                        key={seat.seatNumber} 
                                        onClick={() => isSelectable && handleSeatToggle(seat.seatNumber)}
                                        className={`seat-item ${statusClass} ${isSelectable ? 'pointer' : 'not-allowed'}`}
                                        style={{
                                            gridRow: seat.row + 1, 
                                            gridColumn: seat.col + 1
                                        }}
                                    >
                                        {seat.seatNumber}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {layout.floor2 && layout.floor2.length > 0 && (
                        <div className="floor-section">
                            <h4 className="floor-title">Tầng 2</h4>
                            <div className="seat-grid" style={{ gridTemplateColumns: `repeat(${layout.columns}, 54px)` }}>
                                {layout.floor2.map(seat => {
                                    const isSelected = selectedSeats.includes(seat.seatNumber);
                                    
                                    return (
                                        <div 
                                            key={seat.seatNumber} 
                                            onClick={() => handleSeatToggle(seat.seatNumber)}
                                            className={`seat-item pointer ${isSelected ? 'selecting' : 'empty'}`}
                                            style={{
                                                gridRow: seat.row + 1, 
                                                gridColumn: seat.col + 1
                                            }}
                                        >
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

    return (
        <div className="booking-page">
            <div className="search-modifier-bar">
                <div className="container">
                    <div className="modifier-inputs">
                        <div className="mod-input custom-select-wrapper">
                            <label>Điểm khởi hành</label>
                            <div className="custom-select-display" onClick={() => setShowDepList(!showDepList)}>{departure || 'Chọn điểm đi'}</div>
                             {showDepList && (
                                  <ul className="custom-select-list">
                                      {provinces.length > 0 ? provinces.map(prov => (
                                          <React.Fragment key={prov.provinceId}>
                                              <li className="province-header">{prov.provinceName}</li>
                                              {wards.filter(w => w.provinceId === prov.provinceId).map(ward => (
                                                  <li key={ward.wardId} onClick={(e) => { e.stopPropagation(); setDeparture(ward.wardName); setShowDepList(false); }} className={`ward-item ${departure === ward.wardName ? 'active' : ''}`}>{ward.wardName}</li>
                                              ))}
                                          </React.Fragment>
                                      )) : (
                                          <li className="loading-item">Đang tải...</li>
                                      )}
                                  </ul>
                             )}
                        </div>
                        <div className="mod-swap" onClick={() => { const temp = departure; setDeparture(destination); setDestination(temp); }}>⇌</div>
                        <div className="mod-input custom-select-wrapper">
                            <label>Nơi đến</label>
                            <div className="custom-select-display" onClick={() => setShowDestList(!showDestList)}>{destination || 'Chọn điểm đến'}</div>
                             {showDestList && (
                                  <ul className="custom-select-list">
                                      {provinces.length > 0 ? provinces.map(prov => (
                                          <React.Fragment key={prov.provinceId}>
                                              <li className="province-header">{prov.provinceName}</li>
                                              {wards.filter(w => w.provinceId === prov.provinceId).map(ward => (
                                                  <li key={ward.wardId} onClick={(e) => { e.stopPropagation(); setDestination(ward.wardName); setShowDestList(false); }} className={`ward-item ${destination === ward.wardName ? 'active' : ''}`}>{ward.wardName}</li>
                                              ))}
                                          </React.Fragment>
                                      )) : (
                                          <li className="loading-item">Đang tải...</li>
                                      )}
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

            <div className="container booking-content u-flex-column u-p-b-32">
                <div className="filter-sort-bar">
                    <div className="filter-group">
                         <div className="filter-controls">
                             <select className="filter-select">
                                 <option value="">Khoảng Giờ đi</option>
                                 <option>00:00 - 06:00</option>
                                 <option>06:00 - 12:00</option>
                                 <option>12:00 - 18:00</option>
                                 <option>18:00 - 24:00</option>
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
                                 <option>Xe Giường Nằm</option>
                             </select>
                             <button className="clear-filter-btn">Xóa lọc</button>
                         </div>
                    </div>

                    <div className="sort-group">
                        <span className="sort-label">Sắp xếp:</span>
                        <div className="sort-actions">
                            <button className={`sort-tab ${sortType === 'earliest' ? 'active' : ''}`} onClick={() => setSortType('earliest')}>Giờ đi</button>
                            <button className={`sort-tab ${sortType === 'price-asc' ? 'active' : ''}`} onClick={() => setSortType('price-asc')}>Giá vé</button>
                        </div>
                    </div>
                </div>

                <main className="u-w-full">
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
                                            <div className="price-value">{trip.price.toLocaleString('vi-VN')} đ</div>
                                            <div className="seat-status">Còn {trip.availableSeats} chỗ trống</div>
                                            <button 
                                                className={`select-seat-btn ${expandedTripId === trip.id ? 'active' : ''}`}
                                                onClick={() => toggleExpand(trip.id)}
                                            >
                                                {expandedTripId === trip.id ? 'Đóng ▴' : 'Chọn chỗ ▾'}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedTripId === trip.id && (
                                        <div className="booking-expand-container">
                                            {renderSeatMap(trip)}

                                            <div className="booking-summary-card">
                                                <h3 className="summary-title">Thông tin vé đã chọn</h3>
                                                
                                                {selectedSeats.length === 0 ? (
                                                    <div className="summary-empty">
                                                        <div className="u-size-40 u-m-b-12">💺</div>
                                                        <p className="u-size-14">Vui lòng chọn ghế để tiếp tục đặt vé</p>
                                                    </div>
                                                ) : (
                                                    <div className="u-flex u-flex-column u-flex-1">
                                                        <div className="summary-row">
                                                            <span className="summary-label">Chuyến xe:</span>
                                                            <span className="summary-value">{trip.departureTime} • {trip.departurePoint.split(',')[0]}</span>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span className="summary-label">Loại xe:</span>
                                                            <span className="summary-value">{trip.type}</span>
                                                        </div>

                                                        <div className="selected-seats-container">
                                                            <div className="summary-label u-size-14 u-m-b-8">Ghế đã chọn ({selectedSeats.length}):</div>
                                                            <div className="selected-seats-list">
                                                                {selectedSeats.map(s => <span key={s} className="seat-badge">{s}</span>)}
                                                            </div>
                                                        </div>

                                                        <div className="total-price-section">
                                                            <span className="total-label">Tạm tính:</span>
                                                            <span className="total-value">{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => navigate('/checkout', { state: { trip, selectedSeats } })} 
                                                            className="btn-proceed"
                                                        >
                                                            Tiếp tục đặt vé
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
                                <h2 className="u-size-24 u-weight-700 u-m-b-16">Không tìm thấy chuyến xe</h2>
                                <div className="empty-bus-img u-m-x-auto"><img src={noScheduleImg} alt="No Schedule" className="u-w-full" style={{ maxWidth: '300px' }} /></div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Booking;
