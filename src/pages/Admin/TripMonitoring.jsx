import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tripService from '../../services/trip.service';
import routeService from '../../services/route.service';
import { getBusLayout } from '../../constants/busLayouts';

const TripMonitoring = () => {
    // ---- State Lọc theo Ngày / Tuyến ----
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Mặc định là Hôm nay
    const [selectedRoute, setSelectedRoute] = useState('all');
    
    // ---- State Dữ liệu ----
    const [trips, setTrips] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // ---- State Xem Chi tiết Chuyến & Ghế ----
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripSeats, setTripSeats] = useState([]); // Chứa danh sách ghế thật của chuyến (với Status)
    const [isSeatMapOpen, setIsSeatMapOpen] = useState(false);
    
    // ---- State Quick Booking / Form Bán Vé Nhanh ----
    const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        customerName: '',
        phoneNumber: '',
        pickupPoint: '',
        status: 1 // Mặc định là Giữ chỗ (1), 2 là Đã TT
    });
    useEffect(() => {
        fetchRoutes();
    }, []);

    useEffect(() => {
        if (filterDate) {
            fetchTrips();
        }
    }, [filterDate, selectedRoute]);

    const fetchRoutes = async () => {
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
            // Lọc chuyến theo Ngày và Tuyến
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
            console.error(error);
            generateMockTrips();
        } finally {
            setLoading(false);
        }
    };

    const generateMockTrips = () => {
        // Dữ liệu mô phỏng cho UI (Vì 백엔드 chưa xong Trips cho ngày hiện tại)
        setTrips([
            { tripId: 101, routeId: 1, routeName: 'Hà Nội - Nghệ An', departureTime: '08:00', arrivalTime: '14:00', busId: 5, busPlate: '37B-123.45', busType: '34', availableSeats: 12, totalSeats: 34, status: 0 },
            { tripId: 102, routeId: 1, routeName: 'Hà Nội - Nghệ An', departureTime: '13:00', arrivalTime: '19:00', busId: 6, busPlate: '37B-678.90', busType: '22', availableSeats: 0, totalSeats: 22, status: 1 },
            { tripId: 103, routeId: 2, routeName: 'Hà Nội - Sầm Sơn', departureTime: '16:00', arrivalTime: '19:30', busId: 7, busPlate: '29H-555.55', busType: '40', availableSeats: 25, totalSeats: 40, status: 0 },
            { tripId: 104, routeId: 1, routeName: 'Nghệ An - Hà Nội', departureTime: '21:00', arrivalTime: '03:00', busId: 8, busPlate: '37B-999.99', busType: '34', availableSeats: 10, totalSeats: 34, status: 0 }
        ]);
    };

    const handleOpenTripDetail = async (trip) => {
        setSelectedTrip(trip);
        setIsSeatMapOpen(true);
        
        try {
            // Fetch danh sách ghế thực tế của chuyến này (TripSeats)
            // const res = await tripService.getTripSeats(trip.tripId);
            // setTripSeats(res.data?.data || []);
            
            // Tạm thời Fake data trạng thái ghế để bạn hình dung giao diện:
            // SeatStatus: 0 = Trống, 1 = Giữ chỗ, 2 = Đã TT, 3 = Hỏng/Khóa
            const mockTripSeats = [];
            const layout = getBusLayout(trip.busType || '34');
            const allSeats = [...layout.floor1, ...layout.floor2];
            
            allSeats.forEach((s, index) => {
                let sStatus = 0; // Trống
                if (index % 5 === 0) sStatus = 2; // Đã bán
                else if (index % 7 === 0) sStatus = 1; // Giữ chỗ
                else if (index === 15) sStatus = 3; // Khóa ghế 15
                
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
        // Tương tác khi Admin bấm vào ghế trên sơ đồ
        if (seat.status === 2 || seat.status === 1) {
            // Hiển thị thông tin khách nếu đã đặt (Tạm mô phỏng)
            toast.info(`Ghế ${seat.seatNumber}: Khách Đã Đặt (Tạm ẩn) - Trạng thái: ${seat.status === 2 ? 'Đã Thanh toán' : 'Đang giữ'}`);
        } else if (seat.status === 3) {
            toast.error(`Ghế ${seat.seatNumber} đang bị khóa hỏng!`);
        } else {
            // Mở form Bán vé nhanh đè lên sơ đồ
            setSelectedSeat(seat);
            setBookingForm({ customerName: '', phoneNumber: '', pickupPoint: '', status: 1 });
            setIsQuickBookingOpen(true);
        }
    };

    // Hàm lấy màu sắc và icon cho ghế dựa vào Status
    const getSeatStyles = (status) => {
        switch (status) {
            case 1: return { bg: '#fefcbf', color: '#b7791f', border: '#faf089', label: 'Đang Giữ' };  // Holding
            case 2: return { bg: '#fed7d7', color: '#c53030', border: '#feb2b2', label: 'Đã Bán' };    // Paid/Booked
            case 3: return { bg: '#e2e8f0', color: '#718096', border: '#cbd5e0', label: 'Bị Khóa' };   // Locked
            default: return { bg: '#ebf4ff', color: '#3182ce', border: '#bee3f8', label: 'Còn Trống'}; // Available (0)
        }
    };

    return (
        <div className="trip-monitoring" style={{ padding: '0 10px' }}>
            <header className="dashboard-header" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c', marginBottom: '4px' }}>Theo Dõi Chuyến Hàng Ngày</h1>
                    <p style={{ fontSize: '13px', color: '#718096' }}>Quản lý vé, tình trạng lấp đầy và điều phối xe xuất bến</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Bộ lọc Ngày & Tuyến */}
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontWeight: '600', color: '#2d3748' }}
                    />
                    <select 
                        value={selectedRoute} 
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e0', outline: 'none', fontWeight: '600', color: '#2d3748' }}
                    >
                        <option value="all">Tất cả các tuyến</option>
                        {routes.map(r => (
                            <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>{r.routeName || r.RouteName}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Danh sách Chuyến theo Bảng Kanban/Card */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#718096' }}>Đang tải lịch trình...</div>
            ) : trips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#718096', background: 'white', borderRadius: '12px' }}>Không có chuyến nào trong ngày này.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {trips.filter(t => selectedRoute === 'all' || (t.routeId || t.RouteId)?.toString() === selectedRoute).map(trip => {
                        const filledSeats = trip.totalSeats - trip.availableSeats;
                        const fillPercent = Math.round((filledSeats / trip.totalSeats) * 100) || 0;
                        const isFull = trip.availableSeats === 0;

                        return (
                            <div key={trip.tripId} style={{ 
                                background: 'white', borderRadius: '16px', padding: '20px', 
                                boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.08)',
                                borderTop: `4px solid ${isFull ? '#e53e3e' : '#3182ce'}`,
                                transition: 'transform 0.2s', cursor: 'pointer'
                            }} 
                            onClick={() => handleOpenTripDetail(trip)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#2d3748', marginBottom: '6px' }}>{trip.routeName}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', fontSize: '13px' }}>
                                            <span style={{ fontWeight: '700', color: '#3182ce' }}>{trip.departureTime}</span>
                                            <span>→</span>
                                            <span>{trip.arrivalTime}</span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                        background: isFull ? '#fff5f5' : '#ebf4ff', color: isFull ? '#c53030' : '#2b6cb0' 
                                    }}>
                                        {trip.status === 0 ? 'Sắp chạy' : (trip.status === 1 ? 'Đang đi' : 'Hoàn thành')}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '15px', padding: '10px', background: '#f7fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>{trip.busPlate}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '600' }}>Loại: {trip.busType}</span>
                                </div>

                                {/* Thanh Tiến Trình Lấp Đầy */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                        <span style={{ color: '#718096', fontWeight: '600' }}>Tình trạng lấp đầy:</span>
                                        <span style={{ color: isFull ? '#e53e3e' : '#38a169', fontWeight: '700' }}>{filledSeats} / {trip.totalSeats} ghế ({fillPercent}%)</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: isFull ? '#e53e3e' : '#3182ce', width: `${fillPercent}%`, borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Chi Tiết Ghế của Chuyến (Trip Seat Map) */}
            {isSeatMapOpen && selectedTrip && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', width: '900px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '15px', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>Sơ đồ Vé - {selectedTrip.routeName}</h2>
                                <p style={{ fontSize: '13px', color: '#4a5568', marginTop: '4px', fontWeight: '600' }}>Giờ đi: <span style={{ color: '#e53e3e' }}>{selectedTrip.departureTime}</span> | Xe: {selectedTrip.busPlate} ({getBusLayout(selectedTrip.busType || '34').name})</p>
                            </div>
                            <button onClick={() => setIsSeatMapOpen(false)} style={{ background: '#f7fafc', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Chú thích màu sắc ghế */}
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '25px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                            {[0, 1, 2, 3].map(status => {
                                const styles = getSeatStyles(status);
                                return (
                                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: styles.bg, border: `1px solid ${styles.border}` }}></div>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#4a5568' }}>{styles.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Vùng Vẽ Tầng 1 và 2 */}
                        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                            {/* Tầng 1 */}
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '15px', marginBottom: '15px', fontWeight: '700', color: '#2b6cb0' }}>Tầng 1 (Dưới)</h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: `repeat(${getBusLayout(selectedTrip.busType || '34').columns}, 50px)`,
                                    gap: '12px', padding: '20px', background: '#f7fafc', borderRadius: '16px', border: '1px solid #edf2f7'
                                }}>
                                    {getBusLayout(selectedTrip.busType || '34').floor1.map(seatProto => {
                                        const actualSeat = tripSeats.find(s => s.seatNumber === seatProto.seatNumber) || { status: 0 };
                                        const s = getSeatStyles(actualSeat.status);
                                        return (
                                            <div key={seatProto.seatNumber} onClick={() => handleSeatClick({ ...seatProto, status: actualSeat.status })}
                                                style={{
                                                gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1,
                                                height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: s.bg, color: s.color, borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                                border: `2px solid ${s.border}`, cursor: 'pointer', transition: 'transform 0.1s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                {seatProto.seatNumber}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tầng 2 */}
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '15px', marginBottom: '15px', fontWeight: '700', color: '#dd6b20' }}>Tầng 2 (Trên)</h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: `repeat(${getBusLayout(selectedTrip.busType || '34').columns}, 50px)`,
                                    gap: '12px', padding: '20px', background: '#fffaf0', borderRadius: '16px', border: '1px solid #feebc8'
                                }}>
                                    {getBusLayout(selectedTrip.busType || '34').floor2.map(seatProto => {
                                        const actualSeat = tripSeats.find(s => s.seatNumber === seatProto.seatNumber) || { status: 0 };
                                        const s = getSeatStyles(actualSeat.status);
                                        return (
                                            <div key={seatProto.seatNumber} onClick={() => handleSeatClick({ ...seatProto, status: actualSeat.status })}
                                                style={{
                                                gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1,
                                                height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: s.bg, color: s.color, borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                                border: `2px solid ${s.border}`, cursor: 'pointer', transition: 'transform 0.1s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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

            {/* Modal Quick Booking (Nằm đè lên Seat Map) */}
            {isQuickBookingOpen && selectedSeat && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2d3748' }}>
                                Bán/Giữ Vé Nhanh - Ghế <span style={{ color: '#e53e3e' }}>{selectedSeat.seatNumber}</span>
                            </h3>
                            <button onClick={() => setIsQuickBookingOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#a0aec0' }}>✕</button>
                        </div>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Lưu Fake Data vào UI
                            const updatedSeats = tripSeats.map(s => 
                                s.seatNumber === selectedSeat.seatNumber ? { ...s, status: parseInt(bookingForm.status) } : s
                            );
                            setTripSeats(updatedSeats);
                            toast.success(`Đã ${bookingForm.status == 1 ? 'giữ chỗ' : 'thu tiền'} thành công ghế ${selectedSeat.seatNumber}!`);
                            setIsQuickBookingOpen(false);
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Tên hành khách *</label>
                                <input type="text" required value={bookingForm.customerName} onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} placeholder="VD: Nguyễn Văn A" />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Số điện thoại *</label>
                                <input type="text" required value={bookingForm.phoneNumber} onChange={e => setBookingForm({...bookingForm, phoneNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} placeholder="VD: 0912345678" />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Điểm đón khách</label>
                                <input type="text" value={bookingForm.pickupPoint} onChange={e => setBookingForm({...bookingForm, pickupPoint: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} placeholder="VD: Bến xe Nước Ngầm" />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Thu tiền (Trạng thái) *</label>
                                <select value={bookingForm.status} onChange={e => setBookingForm({...bookingForm, status: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', background: bookingForm.status == 1 ? '#fefcbf' : '#fed7d7' }}>
                                    <option value={1}>Chưa thu tiền (Giữ chỗ online)</option>
                                    <option value={2}>Đã thu tiền (Chuyển khoản/TM)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsQuickBookingOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600' }}>Hủy</button>
                                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#3182ce', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Xác nhận Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripMonitoring;
