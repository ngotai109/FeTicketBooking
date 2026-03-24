import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tripService from '../../services/trip.service';
import routeService from '../../services/route.service';
import { getBusLayout } from '../../constants/busLayouts';

const TripMonitoring = () => {
    // ---- State Filter ----
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoute, setSelectedRoute] = useState('all');
    
    // ---- State Data ----
    const [trips, setTrips] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // ---- State Detail & Seats ----
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripSeats, setTripSeats] = useState([]);
    const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
    
    // ---- State Quick Booking ----
    const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phoneNumber: '',
        pickupPoint: '',
        status: 1
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filterDate) {
            fetchTrips();
        }
    }, [filterDate, selectedRoute]);

    const fetchInitialData = async () => {
        try {
            const res = await routeService.getRoutes();
            const data = res.data?.data || res.data || [];
            setRoutes(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách tuyến đường');
            setRoutes([ { routeId: 1, routeName: 'Hà Nội - Nghệ An' }, { routeId: 2, routeName: 'Nghệ An - Đà Nẵng' } ]);
        }
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            let query = `?date=${filterDate}`;
            if (selectedRoute !== 'all') {
                query += `&routeId=${selectedRoute}`;
            }
            
            const res = await tripService.getAllTrips(query);
            const data = res.data?.data || res.data || [];
            if(Array.isArray(data) && data.length > 0) {
                setTrips(data);
            } else {
                generateMockTrips();
            }
        } catch (error) {
            generateMockTrips();
        } finally {
            setLoading(false);
        }
    };

    const generateMockTrips = () => {
        setTrips([
            { tripId: 101, routeId: 1, routeName: 'Hà Nội - Nghệ An (Sáng)', departureTime: '08:00', arrivalTime: '14:00', busId: 5, busPlate: '37B-123.45', busType: '34', availableSeats: 12, totalSeats: 34, status: 0 },
            { tripId: 102, routeId: 1, routeName: 'Hà Nội - Nghệ An (Chiều)', departureTime: '13:00', arrivalTime: '19:00', busId: 6, busPlate: '37B-678.90', busType: '22', availableSeats: 0, totalSeats: 22, status: 1 },
            { tripId: 103, routeId: 2, routeName: 'Hà Nội - Sầm Sơn', departureTime: '16:00', arrivalTime: '19:30', busId: 7, busPlate: '29H-555.55', busType: '40', availableSeats: 25, totalSeats: 40, status: 0 },
            { tripId: 104, routeId: 1, routeName: 'Nghệ An - Hà Nội', departureTime: '21:00', arrivalTime: '03:00', busId: 8, busPlate: '37B-999.99', busType: '34', availableSeats: 10, totalSeats: 34, status: 0 }
        ]);
    };

    const handleOpenTripDetail = async (trip) => {
        setSelectedTrip(trip);
        setIsSeatMapOpen(true);
        
        try {
            const mockTripSeats = [];
            const layout = getBusLayout(trip.busType || '34');
            const allSeats = [...layout.floor1, ...layout.floor2];
            
            allSeats.forEach((s, index) => {
                let sStatus = 0;
                if (index % 5 === 0) sStatus = 2;
                else if (index % 7 === 0) sStatus = 1;
                else if (index === 15) sStatus = 3;
                
                mockTripSeats.push({
                    seatId: 1000 + index,
                    seatNumber: s.seatNumber,
                    status: sStatus,
                    floor: s.floor || (index < layout.floor1.length ? 1 : 2),
                    row: s.row,
                    column: s.col
                });
            });
            setTripSeats(mockTripSeats);
        } catch (error) {
            toast.error('Không thể tải chi tiết sơ đồ ghế!');
        }
    };

    const handleSeatClick = (seat) => {
        if (seat.status === 2 || seat.status === 1) {
            toast.info(`Ghế ${seat.seatNumber}: ${seat.status === 2 ? 'Đã Thanh toán' : 'Đang giữ chỗ'}`);
        } else if (seat.status === 3) {
            toast.error(`Ghế ${seat.seatNumber} đang bị khóa hỏng!`);
        } else {
            setSelectedSeat(seat);
            setBookingForm({ customerName: '', phoneNumber: '', pickupPoint: '', status: 1 });
            setIsQuickBookingOpen(true);
        }
    };

    const getSeatStyles = (status) => {
        switch (status) {
            case 1: return { class: 'floor-3', bg: '#fefcbf', color: '#b7791f', border: '#faf089', label: 'Đang Giữ' };
            case 2: return { class: 'floor-4', bg: '#fed7d7', color: '#c53030', border: '#feb2b2', label: 'Đã Bán' };
            case 3: return { class: 'floor-5', bg: '#e2e8f0', color: '#718096', border: '#cbd5e0', label: 'Bị Khóa' };
            default: return { class: 'floor-1', bg: '#ebf4ff', color: '#3182ce', border: '#bee3f8', label: 'Còn Trống'};
        }
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 0: return <span className="admin-badge admin-badge-info">Sắp chạy</span>;
            case 1: return <span className="admin-badge admin-badge-warning">Đang đi</span>;
            case 2: return <span className="admin-badge admin-badge-success">Hoàn thành</span>;
            default: return null;
        }
    };

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Theo Dõi Chuyến Hàng Ngày</h1>
                    <p className="admin-header-subtitle">Quản lý vé, tình trạng lấp đầy và điều phối xe xuất bến</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                        type="date" 
                        className="admin-form-input"
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ width: 'auto', fontWeight: '600' }}
                    />
                    <select 
                        className="admin-form-select"
                        value={selectedRoute} 
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        style={{ width: 'auto', fontWeight: '600' }}
                    >
                        <option value="all">Tất cả tuyến</option>
                        {routes.map(r => (
                            <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>{r.routeName || r.RouteName}</option>
                        ))}
                    </select>
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }} className="admin-loading">
                    <div className="loader"></div>
                    <p style={{ marginTop: '16px', color: '#718096' }}>Đang tải lịch trình...</p>
                </div>
            ) : trips.length === 0 ? (
                <div className="admin-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: '#718096', fontSize: '15px' }}>Không có chuyến nào được tìm thấy cho bộ lọc này.</p>
                </div>
            ) : (
                <div className="admin-grid-layout">
                    {trips.filter(t => selectedRoute === 'all' || (t.routeId || t.RouteId)?.toString() === selectedRoute).map(trip => {
                        const filledSeats = trip.totalSeats - trip.availableSeats;
                        const fillPercent = Math.round((filledSeats / trip.totalSeats) * 100) || 0;
                        const isFull = trip.availableSeats === 0;

                        return (
                            <div 
                                key={trip.tripId} 
                                className={`admin-trip-card ${isFull ? 'full' : 'available'}`}
                                onClick={() => handleOpenTripDetail(trip)}
                            >
                                <div className="admin-trip-info-row">
                                    <h3 className="admin-trip-route">{trip.routeName}</h3>
                                    <StatusBadge status={trip.status} />
                                </div>

                                <div className="admin-trip-time">
                                    <span style={{ color: '#3182ce', fontSize: '15px', fontWeight: '700' }}>{trip.departureTime}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    <span>{trip.arrivalTime}</span>
                                </div>

                                <div className="admin-trip-bus-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span style={{ fontWeight: '700' }}>{trip.busPlate}</span>
                                    </div>
                                    <span className="admin-badge admin-badge-info" style={{ borderRadius: '6px' }}>{trip.busType} chỗ</span>
                                </div>

                                <div>
                                    <div className="admin-trip-info-row" style={{ marginBottom: '4px' }}>
                                        <span className="admin-trip-stat-label">Tình trạng lấp đầy:</span>
                                        <span className="admin-trip-stat-value" style={{ color: isFull ? '#e53e3e' : '#38a169' }}>
                                            {filledSeats} / {trip.totalSeats} ghế
                                        </span>
                                    </div>
                                    <div className="admin-progress-container">
                                        <div 
                                            className="admin-progress-bar" 
                                            style={{ 
                                                width: `${fillPercent}%`,
                                                background: isFull ? '#e53e3e' : '#3182ce'
                                            }}
                                        ></div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '11px', marginTop: '4px', fontWeight: '700', color: '#718096' }}>
                                        {fillPercent}% lấp đầy
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Detail Seat Map */}
            {isSeatMapOpen && selectedTrip && (
                <div className="admin-modal-overlay" onClick={() => setIsSeatMapOpen(false)}>
                    <div className="admin-modal-content" style={{ width: '900px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '20px', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Sơ đồ Vé - {selectedTrip.routeName}</h2>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#4a5568', fontWeight: '600' }}>
                                    <span>🕒 Giờ đi: <strong style={{ color: '#e53e3e' }}>{selectedTrip.departureTime}</strong></span>
                                    <span>🚌 Xe: <strong>{selectedTrip.busPlate}</strong></span>
                                    <span>🏷️ Loại: <strong>{selectedTrip.busType} chỗ</strong></span>
                                </div>
                            </div>
                            <button onClick={() => setIsSeatMapOpen(false)} style={{ background: '#f7fafc', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="admin-layout-legend" style={{ marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: 'none' }}>
                            {[0, 1, 2, 3].map(status => {
                                const styles = getSeatStyles(status);
                                return (
                                    <div key={status} className="legend-item">
                                        <div className="legend-dot" style={{ background: styles.bg, border: `1px solid ${styles.border}` }}></div>
                                        <span style={{ fontWeight: '700', fontSize: '12px' }}>{styles.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="admin-bus-layout-container" style={{ background: 'transparent', padding: 0 }}>
                            {/* Tầng 1 */}
                            <div className="admin-floor-section">
                                <h4 className="admin-floor-title" style={{ color: '#3182ce' }}>Tầng 1 (Dưới)</h4>
                                <div 
                                    className="admin-seat-grid"
                                    style={{ 
                                        gridTemplateColumns: `repeat(${getBusLayout(selectedTrip.busType || '34').columns}, 1fr)`,
                                        padding: '24px', gap: '12px'
                                    }}
                                >
                                    {getBusLayout(selectedTrip.busType || '34').floor1.map(seatProto => {
                                        const actualSeat = tripSeats.find(s => s.seatNumber === seatProto.seatNumber) || { status: 0 };
                                        const s = getSeatStyles(actualSeat.status);
                                        return (
                                            <div 
                                                key={seatProto.seatNumber} 
                                                className={`admin-seat-item ${s.class}`}
                                                style={{ 
                                                    gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1,
                                                    height: '54px', fontSize: '12px', cursor: 'pointer',
                                                    background: s.bg, color: s.color, border: `2px solid ${s.border}`
                                                }}
                                                onClick={() => handleSeatClick({ ...seatProto, status: actualSeat.status })}
                                            >
                                                {seatProto.seatNumber}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tầng 2 */}
                            <div className="admin-floor-section">
                                <h4 className="admin-floor-title" style={{ color: '#dd6b20' }}>Tầng 2 (Trên)</h4>
                                <div 
                                    className="admin-seat-grid"
                                    style={{ 
                                        gridTemplateColumns: `repeat(${getBusLayout(selectedTrip.busType || '34').columns}, 1fr)`,
                                        padding: '24px', gap: '12px', background: '#fffaf0'
                                    }}
                                >
                                    {getBusLayout(selectedTrip.busType || '34').floor2.map(seatProto => {
                                        const actualSeat = tripSeats.find(s => s.seatNumber === seatProto.seatNumber) || { status: 0 };
                                        const s = getSeatStyles(actualSeat.status);
                                        return (
                                            <div 
                                                key={seatProto.seatNumber} 
                                                className={`admin-seat-item ${s.class}`}
                                                style={{ 
                                                    gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1,
                                                    height: '54px', fontSize: '12px', cursor: 'pointer',
                                                    background: s.bg, color: s.color, border: `2px solid ${s.border}`
                                                }}
                                                onClick={() => handleSeatClick({ ...seatProto, status: actualSeat.status })}
                                            >
                                                {seatProto.seatNumber}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Quick Booking */}
            {isQuickBookingOpen && selectedSeat && (
                <div className="admin-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsQuickBookingOpen(false)}>
                    <div className="admin-modal-content" style={{ width: '420px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                                Bán/Giữ Vé Nhanh - Ghế <span style={{ color: '#e53e3e' }}>{selectedSeat.seatNumber}</span>
                            </h3>
                            <button onClick={() => setIsQuickBookingOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const updatedSeats = tripSeats.map(s => 
                                s.seatNumber === selectedSeat.seatNumber ? { ...s, status: parseInt(bookingForm.status) } : s
                            );
                            setTripSeats(updatedSeats);
                            toast.success(`Đã thành công ghế ${selectedSeat.seatNumber}!`);
                            setIsQuickBookingOpen(false);
                        }}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Tên hành khách *</label>
                                <input type="text" className="admin-form-input" required value={bookingForm.customerName} onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})} placeholder="VD: Nguyễn Văn A" />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Số điện thoại *</label>
                                <input type="text" className="admin-form-input" required value={bookingForm.phoneNumber} onChange={e => setBookingForm({...bookingForm, phoneNumber: e.target.value})} placeholder="VD: 0912345678" />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Điểm đón khách</label>
                                <input type="text" className="admin-form-input" value={bookingForm.pickupPoint} onChange={e => setBookingForm({...bookingForm, pickupPoint: e.target.value})} placeholder="VD: Bến xe Nước Ngầm" />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Trạng thái thanh toán *</label>
                                <select 
                                    className="admin-form-select" 
                                    value={bookingForm.status} 
                                    onChange={e => setBookingForm({...bookingForm, status: e.target.value})}
                                    style={{ background: bookingForm.status == 1 ? '#fffaf0' : '#f0fff4' }}
                                >
                                    <option value={1}>Chưa thu tiền (Giữ chỗ)</option>
                                    <option value={2}>Đã thanh toán</option>
                                </select>
                            </div>
                            <div className="admin-form-actions">
                                <button type="button" className="admin-btn-outline" onClick={() => setIsQuickBookingOpen(false)}>Hủy</button>
                                <button type="submit" className="admin-btn-primary">Xác nhận Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripMonitoring;
