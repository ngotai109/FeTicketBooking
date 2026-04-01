import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';
import officeService from '../../services/office.service';
import tripService from '../../services/trip.service';
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
    const [offices, setOffices] = useState([]);
    const [departure, setDeparture] = useState(searchData.departure);
    const [destination, setDestination] = useState(searchData.destination);
    const [showDepList, setShowDepList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);
    const [date, setDate] = useState(searchData.date);
    const [sortType, setSortType] = useState('earliest');

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const [provinceRes, wardRes, officeRes] = await Promise.all([
                    provinceService.getAllProvincesActive(),
                    wardService.getAllWardsActive(),
                    officeService.getAllOffices()
                ]);
                if (provinceRes && provinceRes.data) {
                    setProvinces(provinceRes.data);
                }
                if (wardRes && wardRes.data) {
                    setWards(wardRes.data);
                }
                if (officeRes && officeRes.data) {
                    setOffices(officeRes.data?.data || officeRes.data || []);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách địa điểm:', error);
            }
        };
        fetchLocations();
    }, []);

    const getGroupedOffices = () => {
        if (!offices.length) return [];
        const map = {};

        offices.forEach(o => {
            let pId = o.provinceId ? parseInt(o.provinceId) : null;
            const ward = wards.find(w => parseInt(w.wardId) === parseInt(o.wardId));
            if (!pId && ward) pId = parseInt(ward.provinceId);

            const province = provinces.find(p => parseInt(p.provinceId) === pId);
            const pName = province ? province.provinceName : 'Văn phòng khác';

            if (!map[pName]) map[pName] = [];

            // Chỉ hiển thị office name (không mix ward)
            const label = o.officeName;

            map[pName].push({ id: o.officeId, name: label });
        });

        return Object.keys(map).sort((a, b) => {
            if (a.toLowerCase().includes('hà nội')) return -1;
            if (b.toLowerCase().includes('hà nội')) return 1;
            return a.localeCompare(b);
        }).map(name => ({ label: name, items: map[name] }));
    };

    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tripSeats, setTripSeats] = useState([]);
    const [expandedTripId, setExpandedTripId] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Filter states
    const [timeFilter, setTimeFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [busTypeFilter, setBusTypeFilter] = useState('');
    
    // Visibility states for custom dropdowns
    const [showTimeFilter, setShowTimeFilter] = useState(false);
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [showBusTypeFilter, setShowBusTypeFilter] = useState(false);

    const handleSearch = async () => {
        if (!departure || !destination) {
            toast.warning('Vui lòng chọn điểm đi và điểm đến');
            return;
        }
        setIsLoading(true);
        try {
            const res = await tripService.searchTrips({
                departure,
                destination,
                date
            });
            setTrips(res.data?.data || res.data || []);
            setExpandedTripId(null);
            setSelectedSeats([]);
        } catch (error) {
            console.error('Error fetching trips:', error);
            toast.error('Lỗi khi tìm kiếm chuyến xe');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Chỉ fetch khi có đủ dữ liệu tìm kiếm
        if (!searchData.departure || !searchData.destination || !searchData.date) {
            setTrips([]);
            setIsLoading(false);
            return;
        }

        const fetchTrips = async () => {
            setIsLoading(true);
            try {
                const res = await tripService.searchTrips({
                    departure: searchData.departure,
                    destination: searchData.destination,
                    date: searchData.date
                });
                setTrips(res.data?.data || res.data || []);
            } catch (error) {
                console.error('Error fetching trips:', error);
                setTrips([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrips();
    }, [searchData]);

    // Filter and Sort Logic
    const filteredAndSortedTrips = [...trips].filter(trip => {
        // Time Filter
        if (timeFilter) {
            const [hours] = (trip.departureTime || trip.DepartureTime || "00:00").split(':').map(Number);
            if (timeFilter === '0-6' && (hours < 0 || hours >= 6)) return false;
            if (timeFilter === '6-12' && (hours < 6 || hours >= 12)) return false;
            if (timeFilter === '12-18' && (hours < 12 || hours >= 18)) return false;
            if (timeFilter === '18-24' && (hours < 18 || hours >= 24)) return false;
        }

        // Price Filter
        if (priceFilter) {
            const price = trip.ticketPrice || trip.TicketPrice || 0;
            if (priceFilter === 'under200' && price >= 200000) return false;
            if (priceFilter === '200-500' && (price < 200000 || price > 500000)) return false;
            if (priceFilter === 'above500' && price <= 500000) return false;
        }

        // Bus Type Filter
        if (busTypeFilter) {
            const type = (trip.busType || trip.type || "").toLowerCase();
            if (busTypeFilter === 'limousine' && !type.includes('limousine')) return false;
            if (busTypeFilter === 'sleeper' && !type.includes('giường nằm')) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortType === 'earliest') {
            return (a.departureTime || a.DepartureTime || "").localeCompare(b.departureTime || b.DepartureTime || "");
        }
        if (sortType === 'price-asc') {
            return (a.ticketPrice || a.TicketPrice || 0) - (b.ticketPrice || b.TicketPrice || 0);
        }
        return 0;
    });

    const clearFilters = () => {
        setTimeFilter('');
        setPriceFilter('');
        setBusTypeFilter('');
        setSortType('earliest');
    };

    const toggleExpand = async (tripId) => {
        if (expandedTripId === tripId) {
            setExpandedTripId(null);
        } else {
            setExpandedTripId(tripId);
            setSelectedSeats([]);
            setTripSeats([]); // Reset
            try {
                const res = await tripService.getTripSeats(tripId);
                const data = res.data?.data || res.data || [];
                setTripSeats(data);
                if (data.length === 0) {
                    toast.error(`Không tìm thấy dữ liệu ghế cho chuyến #${tripId}. Vui lòng thử lại!`);
                }
            } catch (error) {
                toast.error('Lỗi khi lấy sơ đồ ghế');
            }
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
                                const targetNum = seat.seatNumber?.toString().trim().toUpperCase();
                                const apiSeat = tripSeats.find(s => {
                                    const sNum = (s.seatNumber || s.SeatNumber || '').toString().trim().toUpperCase();
                                    return sNum === targetNum;
                                });
                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                let statusClass = 'empty';

                                if (isSelected) statusClass = 'selecting';
                                else if (apiSeat) {
                                    if (apiSeat.status === 1 || apiSeat.status === 'Booked') statusClass = 'sold';
                                    else if (apiSeat.status === 2) statusClass = 'hold';
                                }

                                const isSelectable = statusClass === 'empty';

                                return (
                                    <div
                                        key={seat.seatNumber}
                                        onClick={() => isSelectable || isSelected ? handleSeatToggle(seat.seatNumber) : null}
                                        className={`seat-item ${statusClass} ${isSelectable || isSelected ? 'pointer' : 'not-allowed'}`}
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
                                    {getGroupedOffices().length > 0 ? getGroupedOffices().map(group => (
                                        <React.Fragment key={group.label}>
                                            <li className="province-header">{group.label}</li>
                                            {group.items.map(item => (
                                                <li key={item.id} onClick={(e) => { e.stopPropagation(); setDeparture(item.name); setShowDepList(false); }} className={`ward-item ${departure === item.name ? 'active' : ''}`}>{item.name}</li>
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
                                    {getGroupedOffices().length > 0 ? getGroupedOffices().map(group => (
                                        <React.Fragment key={group.label}>
                                            <li className="province-header">{group.label}</li>
                                            {group.items.map(item => (
                                                <li key={item.id} onClick={(e) => { e.stopPropagation(); setDestination(item.name); setShowDestList(false); }} className={`ward-item ${destination === item.name ? 'active' : ''}`}>{item.name}</li>
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
                        <button className="mod-search-btn" onClick={handleSearch}>TÌM VÉ XE</button>
                    </div>
                </div>
            </div>

            <div className="container booking-content u-flex-column u-p-b-32">
                <div className="filter-sort-bar">
                    <div className="filter-group">
                        <div className="filter-controls">
                            {/* Custom Filter Dropdowns */}
                            <div className="custom-filter-dropdown">
                                <div className="dropdown-trigger" onClick={() => setShowTimeFilter(!showTimeFilter)}>
                                    {timeFilter === '0-6' ? '00:00 - 06:00' :
                                     timeFilter === '6-12' ? '06:00 - 12:00' :
                                     timeFilter === '12-18' ? '12:00 - 18:00' :
                                     timeFilter === '18-24' ? '18:00 - 24:00' : 'Khoảng Giờ đi'}
                                    <span className="arrow">▾</span>
                                </div>
                                {showTimeFilter && (
                                    <ul className="dropdown-menu">
                                        <li onClick={() => { setTimeFilter(''); setShowTimeFilter(false); }}>Khoảng Giờ đi</li>
                                        <li onClick={() => { setTimeFilter('0-6'); setShowTimeFilter(false); }}>00:00 - 06:00</li>
                                        <li onClick={() => { setTimeFilter('6-12'); setShowTimeFilter(false); }}>06:00 - 12:00</li>
                                        <li onClick={() => { setTimeFilter('12-18'); setShowTimeFilter(false); }}>12:00 - 18:00</li>
                                        <li onClick={() => { setTimeFilter('18-24'); setShowTimeFilter(false); }}>18:00 - 24:00</li>
                                    </ul>
                                )}
                            </div>

                            <div className="custom-filter-dropdown">
                                <div className="dropdown-trigger" onClick={() => setShowPriceFilter(!showPriceFilter)}>
                                    {priceFilter === 'under200' ? 'Dưới 200,000 đ' :
                                     priceFilter === '200-500' ? '200,000 đ - 500,000 đ' :
                                     priceFilter === 'above500' ? 'Từ 500,000 đ trở lên' : 'Khoảng Giá vé'}
                                    <span className="arrow">▾</span>
                                </div>
                                {showPriceFilter && (
                                    <ul className="dropdown-menu">
                                        <li onClick={() => { setPriceFilter(''); setShowPriceFilter(false); }}>Khoảng Giá vé</li>
                                        <li onClick={() => { setPriceFilter('under200'); setShowPriceFilter(false); }}>Dưới 200,000 đ</li>
                                        <li onClick={() => { setPriceFilter('200-500'); setShowPriceFilter(false); }}>200,000 đ - 500,000 đ</li>
                                        <li onClick={() => { setPriceFilter('above500'); setShowPriceFilter(false); }}>Từ 500,000 đ trở lên</li>
                                    </ul>
                                )}
                            </div>

                            <div className="custom-filter-dropdown">
                                <div className="dropdown-trigger" onClick={() => setShowBusTypeFilter(!showBusTypeFilter)}>
                                    {busTypeFilter === 'limousine' ? 'Xe Limousine VIP' :
                                     busTypeFilter === 'sleeper' ? 'Xe Giường Nằm' : 'Loại Xe'}
                                    <span className="arrow">▾</span>
                                </div>
                                {showBusTypeFilter && (
                                    <ul className="dropdown-menu">
                                        <li onClick={() => { setBusTypeFilter(''); setShowBusTypeFilter(false); }}>Loại Xe</li>
                                        <li onClick={() => { setBusTypeFilter('limousine'); setShowBusTypeFilter(false); }}>Xe Limousine VIP</li>
                                        <li onClick={() => { setBusTypeFilter('sleeper'); setShowBusTypeFilter(false); }}>Xe Giường Nằm</li>
                                    </ul>
                                )}
                            </div>

                            <button className="clear-filter-btn" onClick={clearFilters}>Xóa lọc</button>
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
                        {!departure || !destination || !date ? (
                            <div className="no-results">
                                <h2 className="u-size-24 u-weight-700 u-m-b-16">⚠️ Vui lòng chọn địa điểm</h2>
                                <p className="u-size-14">Hãy chọn điểm khởi hành, điểm đến và ngày khởi hành ở trên để tìm kiếm chuyến xe</p>
                            </div>
                        ) : isLoading ? (
                            <div className="no-results">
                                <h2 className="u-size-24 u-weight-700 u-m-b-16">⏳ Đang tìm kiếm...</h2>
                            </div>
                        ) : filteredAndSortedTrips.length > 0 ? (
                            filteredAndSortedTrips.map(trip => (
                                <div key={trip.tripId || trip.id} className="trip-card">
                                    <div className="trip-main-info">
                                        <div className="trip-image">
                                            <img src={trip.image || '/default-bus.png'} alt="Bus" onError={(e) => e.target.src = '/default-bus.png'} />
                                            <div className="trip-notice">KHUYẾN MÃI TỚI 20%</div>
                                        </div>

                                        <div className="trip-details">
                                            <div className="bus-type">{trip.busType || trip.type}</div>
                                            <div className="trip-timeline">
                                                <div className="time-point">
                                                    <span className="time">{trip.departureTime || trip.DepartureTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.departureOfficeName || trip.DepartureOfficeName || '--'}</span>
                                                </div>
                                                <div className="duration-line"><span className="duration">{trip.duration || '--:--'}</span></div>
                                                <div className="time-point">
                                                    <span className="time arrival">{trip.arrivalTime || trip.ArrivalTime}</span>
                                                    <span className="dot">•</span>
                                                    <span className="point">{trip.arrivalOfficeName || trip.ArrivalOfficeName || '--'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="trip-pricing">
                                            <div className="price-value">{(trip.ticketPrice || trip.TicketPrice || 0).toLocaleString('vi-VN')} đ</div>
                                            <div className="seat-status">Còn {trip.availableSeats ?? trip.AvailableSeats ?? 0} chỗ trống</div>
                                            {(() => {
                                                const now = new Date();
                                                const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
                                                const isToday = date === todayStr;
                                                const isPastDate = date < todayStr;
                                                
                                                const [h, m] = (trip.departureTime || trip.DepartureTime || "00:00").split(':');
                                                const tripTime = new Date();
                                                tripTime.setHours(parseInt(h), parseInt(m), 0, 0);
                                                
                                                const isExpired = isPastDate || (isToday && now > tripTime);

                                                if (isExpired) {
                                                    return (
                                                        <button className="select-seat-btn expired" disabled>
                                                            Đã khởi hành
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        className={`select-seat-btn ${expandedTripId === (trip.tripId || trip.id) ? 'active' : ''}`}
                                                        onClick={() => toggleExpand(trip.tripId || trip.id)}
                                                    >
                                                        {expandedTripId === (trip.tripId || trip.id) ? 'Đóng ▴' : 'Chọn chỗ ▾'}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {expandedTripId === (trip.tripId || trip.id) && (
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
                                                            <span className="summary-value">{trip.departureTime || trip.DepartureTime} • {(trip.departureOfficeName || trip.DepartureOfficeName || '--').split(',')[0]}</span>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span className="summary-label">Loại xe:</span>
                                                            <span className="summary-value">{trip.busType || trip.type}</span>
                                                        </div>

                                                        <div className="selected-seats-container">
                                                            <div className="summary-label u-size-14 u-m-b-8">Ghế đã chọn ({selectedSeats.length}):</div>
                                                            <div className="selected-seats-list">
                                                                {selectedSeats.map(s => <span key={s} className="seat-badge">{s}</span>)}
                                                            </div>
                                                        </div>

                                                        <div className="total-price-section">
                                                            <span className="total-label">Tạm tính:</span>
                                                            <span className="total-value">{(selectedSeats.length * (trip.ticketPrice || trip.TicketPrice || trip.price || 0)).toLocaleString('vi-VN')} đ</span>
                                                        </div>
                                                        <button
                                                            className="select-seat-btn active"
                                                            onClick={() => {
                                                                const tId = trip.tripId || trip.TripId || trip.id;
                                                                if (!tId) {
                                                                    toast.error("Không tìm thấy mã chuyến xe!");
                                                                    return;
                                                                }
                                                                navigate('/checkout', {
                                                                    state: {
                                                                        trip: { ...trip, tripId: tId },
                                                                        selectedSeats,
                                                                        tripSeats
                                                                    }
                                                                });
                                                            }}
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
                                <p className="u-size-14">Không có chuyến xe nào phù hợp với thông tin tìm kiếm của bạn</p>
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
