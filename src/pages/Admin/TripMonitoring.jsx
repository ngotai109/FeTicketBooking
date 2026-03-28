import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tripService from '../../services/trip.service';
import routeService from '../../services/route.service';
import { getBusLayout } from '../../constants/busLayouts';
import { Badge, Card, Modal, Pagination } from '../../components/Common';
import '../../assets/styles/AdminTripMonitoring.css';

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
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8; // Grid usually looks better with 8 or 12

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filterDate) {
            fetchTrips();
        }
    }, [filterDate, selectedRoute]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterDate, selectedRoute]);

    const fetchInitialData = async () => {
        try {
            const res = await routeService.getRoutes();
            const data = res.data?.data || res.data || [];
            setRoutes(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách tuyến đường');
            setRoutes([{ routeId: 1, routeName: 'Hà Nội - Nghệ An' }, { routeId: 2, routeName: 'Nghệ An - Đà Nẵng' }]);
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
            if (Array.isArray(data) && data.length > 0) {
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
            { tripId: 103, routeId: 2, routeName: 'Hà Nội - Nghệ An', departureTime: '16:00', arrivalTime: '19:30', busId: 7, busPlate: '29H-555.55', busType: '40', availableSeats: 25, totalSeats: 40, status: 0 },
            { tripId: 104, routeId: 1, routeName: 'Nghệ An - Hà Nội', departureTime: '21:00', arrivalTime: '03:00', busId: 8, busPlate: '37B-999.99', busType: '34', availableSeats: 10, totalSeats: 34, status: 0 }
        ]);
    };

    const handleOpenTripDetail = async (trip) => {
        setSelectedTrip(trip);
        setIsSeatMapOpen(true);

        try {
            const res = await tripService.getTripSeats(trip.tripId || trip.TripId);
            const data = res.data?.data || res.data || [];
            
            // Map the API data to the format the seat map expects
            const mappedSeats = data.map(s => ({
                tripSeatId: s.tripSeatId,
                seatNumber: s.seatNumber,
                status: s.status,
                floor: s.floor,
                row: s.row,
                column: s.column
            }));
            
            setTripSeats(mappedSeats);
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

    const getSeatConfig = (status) => {
        switch (status) {
            case 1: return { type: 'warning', label: 'Đang Giữ' };
            case 2: return { type: 'danger', label: 'Đã Bán' };
            case 3: return { type: 'info', label: 'Bị Khóa' }; // Grayish
            default: return { type: 'info', label: 'Còn Trống' };
        }
    };

    const getTripStatusBadge = (status) => {
        switch (status) {
            case 0: return <Badge type="info">Sắp chạy</Badge>;
            case 1: return <Badge type="warning">Đang đi</Badge>;
            case 2: return <Badge type="success">Hoàn thành</Badge>;
            default: return null;
        }
    };

    return (
        <div className="admin-page-container">
            {/* Header handled by AdminLayout */}
            
            <div className="admin-toolbar u-m-b-20" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px' }}>
                <div className="u-flex u-align-center u-gap-12">
                    <span className="u-size-13 u-weight-600 u-color-slate-600">Ngày đi:</span>
                    <input
                        type="date"
                        className="admin-form-input"
                        style={{ width: '160px', padding: '6px 10px' }}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="u-flex u-align-center u-gap-12">
                    <span className="u-size-13 u-weight-600 u-color-slate-600">Tuyến đường:</span>
                    <select
                        className="admin-form-select"
                        style={{ width: '220px', padding: '6px 10px' }}
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                        <option value="all">Tất cả tuyến</option>
                        {routes.map(r => (
                            <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>{r.routeName || r.RouteName}</option>
                        ))}
                    </select>
                </div>
                <div className="u-m-l-auto">
                    <Badge type="info" style={{ padding: '6px 12px' }}>
                        Tổng số: {trips.length} chuyến
                    </Badge>
                </div>
            </div>

            {loading ? (
                <div className="trip-monitoring-loading-container admin-loading">
                    <div className="loader"></div>
                    <p className="trip-monitoring-loading-text">Đang tải lịch trình...</p>
                </div>
            ) : trips.length === 0 ? (
                <Card className="trip-monitoring-empty-state">
                    <p>Không có chuyến nào được tìm thấy cho bộ lọc này.</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                        {trips
                            .filter(t => selectedRoute === 'all' || (t.routeId || t.RouteId)?.toString() === selectedRoute)
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map(trip => {
                                const filledSeats = trip.totalSeats - trip.availableSeats;
                                const fillPercent = Math.round((filledSeats / trip.totalSeats) * 100) || 0;
                                const isFull = trip.availableSeats === 0;

                                return (
                                    <Card
                                        key={trip.tripId}
                                        className={`admin-trip-card ${isFull ? 'full' : 'available'}`}
                                        onClick={() => handleOpenTripDetail(trip)}
                                        interactive
                                        padding="16px"
                                    >
                                        <div className="admin-trip-info-row">
                                            <h3 className="admin-trip-route" style={{ fontSize: '13px', fontWeight: 700 }}>{trip.routeName}</h3>
                                            {getTripStatusBadge(trip.status)}
                                        </div>

                                        <div className="admin-trip-time" style={{ fontSize: '13px', gap: '6px', margin: '4px 0' }}>
                                            <span className="trip-monitoring-time-display" style={{ fontSize: '15px', fontWeight: 700 }}>{trip.departureTime}</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                            <span style={{ fontSize: '13px' }}>{trip.arrivalTime}</span>
                                        </div>

                                        <div className="admin-trip-bus-info" style={{ padding: '8px 10px', fontSize: '12px' }}>
                                            <div className="u-flex u-align-center u-gap-8">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                <span className="trip-monitoring-bus-plate">{trip.busPlate}</span>
                                            </div>
                                            <Badge type="info">{trip.busType} chỗ</Badge>
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
                                            <div className="trip-monitoring-fill-percent">
                                                {fillPercent}% lấp đầy
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={trips.filter(t => selectedRoute === 'all' || (t.routeId || t.RouteId)?.toString() === selectedRoute).length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal Detail Seat Map */}
            <Modal
                isOpen={isSeatMapOpen}
                onClose={() => setIsSeatMapOpen(false)}
                title={`Sơ đồ Vé - ${selectedTrip?.routeName}`}
                width="900px"
            >
                {selectedTrip && (
                    <>
                        <div className="trip-monitoring-modal-info">
                            <span>🕒 Giờ đi: <strong className="trip-monitoring-departure-time">{selectedTrip.departureTime}</strong></span>
                            <span>🚌 Xe: <strong>{selectedTrip.busPlate}</strong></span>
                            <span>🏷️ Loại: <strong>{selectedTrip.busType} chỗ</strong></span>
                        </div>

                        <div className="admin-layout-legend" style={{ marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: 'none' }}>
                            {[0, 1, 2, 3].map(status => {
                                const config = getSeatConfig(status);
                                return (
                                    <div key={status} className="legend-item">
                                        <div className={`legend-dot admin-badge-${config.type}`}></div>
                                        <span className="u-weight-700 u-size-12">{config.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="admin-bus-layout-container u-p-0 u-bg-transparent">
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
                                        const config = getSeatConfig(actualSeat.status);
                                        return (
                                            <div
                                                key={seatProto.seatNumber}
                                                className={`admin-seat-item admin-badge-${config.type} trip-monitoring-seat-item-custom`}
                                                style={{
                                                    gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1
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
                                        const config = getSeatConfig(actualSeat.status);
                                        return (
                                            <div
                                                key={seatProto.seatNumber}
                                                className={`admin-seat-item admin-badge-${config.type} trip-monitoring-seat-item-custom`}
                                                style={{
                                                    gridRow: seatProto.row + 1, gridColumn: seatProto.col + 1
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
                    </>
                )}
            </Modal>

            {/* Modal Quick Booking */}
            <Modal
                isOpen={isQuickBookingOpen}
                onClose={() => setIsQuickBookingOpen(false)}
                title={
                    <>
                        Bán/Giữ Vé Nhanh - Ghế <span className="trip-monitoring-quick-booking-seat">{selectedSeat?.seatNumber}</span>
                    </>
                }
                width="420px"
                zIndex={1300}
            >
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        await tripService.quickBook({
                            tripSeatId: selectedSeat.tripSeatId,
                            customerName: bookingForm.customerName,
                            phoneNumber: bookingForm.phoneNumber,
                            status: parseInt(bookingForm.status)
                        });
                        
                        // Cập nhật local state để hiển thị ngay
                        const updatedSeats = tripSeats.map(s =>
                            s.tripSeatId === selectedSeat.tripSeatId ? { ...s, status: parseInt(bookingForm.status) } : s
                        );
                        setTripSeats(updatedSeats);
                        
                        toast.success(`Đã cập nhật trạng thái ghế ${selectedSeat.seatNumber}!`);
                        setIsQuickBookingOpen(false);
                        
                        // Optional: Refresh trips list to update fill count
                        fetchTrips();
                    } catch (error) {
                        toast.error('Có lỗi xảy ra khi cập nhật ghế!');
                    }
                }}>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Tên hành khách *</label>
                        <input type="text" className="admin-form-input" required value={bookingForm.customerName} onChange={e => setBookingForm({ ...bookingForm, customerName: e.target.value })} placeholder="VD: Nguyễn Văn A" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Số điện thoại *</label>
                        <input type="text" className="admin-form-input" required value={bookingForm.phoneNumber} onChange={e => setBookingForm({ ...bookingForm, phoneNumber: e.target.value })} placeholder="VD: 0912345678" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Điểm đón khách</label>
                        <input type="text" className="admin-form-input" value={bookingForm.pickupPoint} onChange={e => setBookingForm({ ...bookingForm, pickupPoint: e.target.value })} placeholder="VD: Bến xe Nước Ngầm" />
                    </div>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Trạng thái thanh toán *</label>
                        <select
                            className={`admin-form-select ${bookingForm.status == 1 ? 'trip-monitoring-status-active' : 'trip-monitoring-status-paid'}`}
                            value={bookingForm.status}
                            onChange={e => setBookingForm({ ...bookingForm, status: e.target.value })}
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
            </Modal>
        </div>
    );
};

export default TripMonitoring;
