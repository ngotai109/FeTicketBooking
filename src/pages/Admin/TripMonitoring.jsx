import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import tripService from '../../services/trip.service';
import routeService from '../../services/route.service';
import scheduleService from '../../services/schedule.service';
import busService from '../../services/bus.service';
import driverService from '../../services/driver.service';
import { getBusLayout } from '../../constants/busLayouts';
import { Badge, Card, Modal, Pagination, ConfirmationModal, Loading } from '../../components/Common';
import '../../assets/styles/AdminTripMonitoring.css';

const TripMonitoring = () => {
    // ---- State Filter ----
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedRoute, setSelectedRoute] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // ---- State Data ----
    const [trips, setTrips] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
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

    // ---- State Extra Trip (New Form) ----
    const [isAddTripOpen, setIsAddTripOpen] = useState(false);
    const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
    const [selectedTripForDriver, setSelectedTripForDriver] = useState(null);
    const [assigningDriverId, setAssigningDriverId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [extraTripForm, setExtraTripForm] = useState({
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
        ticketPrice: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tripToDelete, setTripToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

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
    }, [filterDate, selectedRoute, selectedStatus]);

    const getCalculatedStatus = (trip) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        let status = trip.status;

        if (filterDate === todayStr) {
            const [depH, depM] = trip.departureTime.split(':');
            const [arrH, arrM] = trip.arrivalTime.split(':');
            
            const depDate = new Date();
            depDate.setHours(parseInt(depH), parseInt(depM), 0, 0);
            
            const arrDate = new Date();
            arrDate.setHours(parseInt(arrH), parseInt(arrM), 0, 0);
            
            if (arrDate < depDate) arrDate.setDate(arrDate.getDate() + 1);

            if (now < depDate) status = 0; 
            else if (now >= depDate && now < arrDate) status = 1; 
            else status = 2; 
        } else if (filterDate < todayStr) {
            status = 2;
        } else {
            status = 0;
        }
        return status;
    };

    const fetchInitialData = async () => {
        try {
            const [routesRes, busesRes, driversRes] = await Promise.all([
                routeService.getRoutes(),
                busService.getAllBuses(),
                driverService.getAllDrivers()
            ]);
            setRoutes(routesRes.data?.data || routesRes.data || []);
            setBuses(busesRes.data?.data || busesRes.data || []);
            setDrivers(driversRes.data?.data || driversRes.data || []);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu khởi tạo');
        }
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const dateStr = filterDate ? filterDate.split('T')[0] : '';
            const res = await tripService.getAllTrips(`?date=${dateStr}${selectedRoute !== 'all' ? `&routeId=${selectedRoute}` : ''}`);
            const data = res.data?.data || res.data || [];
            setTrips(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu chuyến đi');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignDriver = (trip) => {
        setSelectedTripForDriver(trip);
        setAssigningDriverId(trip.driverId || '');
        setIsAssignDriverModalOpen(true);
    };

    const handleAssignDriver = async () => {
        if (!assigningDriverId) return toast.warning('Vui lòng chọn tài xế');
        setIsAssigning(true);
        try {
            await tripService.assignDriver(selectedTripForDriver.tripId, assigningDriverId);
            toast.success('Gán tài xế thành công!');
            setIsAssignDriverModalOpen(false);
            fetchTrips();
        } catch (error) {
            console.error("Assign Driver Error:", error);
            const msg = error.response?.data?.message || 'Không thể gán tài xế';
            toast.error(msg);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleAddExtraTrip = async (e) => {
        e.preventDefault();
        const { routeId, busId, departureTime, arrivalTime, ticketPrice } = extraTripForm;
        
        if (!routeId || !busId || !departureTime || !arrivalTime || !ticketPrice) {
            return toast.warning('Vui lòng điền đầy đủ thông tin');
        }

        setIsProcessing(true);
        try {
            const scheduleRes = await scheduleService.createSchedule({
                routeId: parseInt(routeId),
                busId: parseInt(busId),
                departureTime,
                arrivalTime,
                ticketPrice: parseFloat(ticketPrice)
            });

            const newScheduleId = scheduleRes.data?.data?.scheduleId || scheduleRes.data?.scheduleId;

            if (!newScheduleId) throw new Error('Không thể tạo lịch trình khung');

            await tripService.createTrip({
                scheduleId: newScheduleId,
                departureDate: filterDate
            });

            toast.success('Đã thêm chuyến tăng cường thành công!');
            setIsAddTripOpen(false);
            setExtraTripForm({ routeId: '', busId: '', departureTime: '', arrivalTime: '', ticketPrice: '' });
            fetchTrips();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi khi thêm chuyến');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteTrip = async () => {
        if (!tripToDelete) return;
        setIsDeleting(true);
        try {
            await tripService.deleteTrip(tripToDelete.tripId);
            toast.success('Đã xóa chuyến đi thành công!');
            setIsDeleteModalOpen(false);
            fetchTrips();
        } catch (err) {
            toast.error('Không thể xóa chuyến đi vì đã có khách đặt hoặc lỗi hệ thống.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenTripDetail = async (trip) => {
        setSelectedTrip(trip);
        setIsSeatMapOpen(true);
        try {
            const res = await tripService.getTripSeats(trip.tripId || trip.TripId);
            const data = res.data?.data || res.data || [];
            setTripSeats(data.map(s => ({
                tripSeatId: s.tripSeatId,
                seatNumber: s.seatNumber,
                status: s.status,
                floor: s.floor,
                row: s.row,
                column: s.column
            })));
        } catch (error) {
            toast.error('Không thể tải chi tiết sơ đồ ghế!');
        }
    };

    const handleSeatClick = (seat) => {
        if (seat.status === 2 || seat.status === 1) {
            const label = seat.status === 2 ? 'Đã Thanh toán' : 'Đang giữ chỗ';
            toast.info(`Ghế ${seat.seatNumber}: ${label}`);
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
            case 3: return { type: 'info', label: 'Bị Khóa' };
            default: return { type: 'info', label: 'Còn Trống' };
        }
    };

    const getTripStatusBadge = (status) => {
        switch (status) {
            case 0: return <Badge type="info">Sắp khởi hành</Badge>;
            case 1: return <Badge type="warning">Đang di chuyển</Badge>;
            case 2: return <Badge type="success">Đã hoàn thành</Badge>;
            default: return null;
        }
    };

    const filteredTrips = trips
        .filter(t => selectedRoute === 'all' || (t.routeId || t.RouteId)?.toString() === selectedRoute)
        .filter(t => {
            if (selectedStatus === 'all') return true;
            return getCalculatedStatus(t).toString() === selectedStatus;
        });

    return (
        <div className="admin-page-container">
            <div className="admin-toolbar u-m-b-20">
                <div className="u-flex u-align-center u-gap-12">
                    <span className="u-size-13 u-weight-700 u-color-slate-500">Ngày đi:</span>
                    <input
                        type="date"
                        className="admin-form-input"
                        style={{ width: '150px' }}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="u-flex u-align-center u-gap-12">
                    <span className="u-size-13 u-weight-700 u-color-slate-500">Tuyến:</span>
                    <select
                        className="admin-form-select"
                        style={{ width: '200px' }}
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                        <option value="all">Tất cả tuyến</option>
                        {routes.map(r => (
                            <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>{r.routeName || r.RouteName}</option>
                        ))}
                    </select>
                </div>

                <div className="u-flex u-align-center u-gap-12">
                    <span className="u-size-13 u-weight-700 u-color-slate-500">Trạng thái:</span>
                    <select
                        className="admin-form-select"
                        style={{ width: '180px' }}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="0">Sắp khởi hành</option>
                        <option value="1">Đang di chuyển</option>
                        <option value="2">Đã hoàn thành</option>
                    </select>
                </div>
                
                <div className="u-m-l-auto u-flex u-gap-12">
                    <button 
                        className="admin-btn-add" 
                        style={{ height: '36px', fontSize: '12px', fontWeight: '700' }}
                        onClick={() => setIsAddTripOpen(true)}
                    >
                        + TĂNG CƯỜNG XE
                    </button>
                    <Badge type="info" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                        {filteredTrips.length} chuyến
                    </Badge>
                </div>
            </div>

            {loading ? (
                <Loading minHeight="300px" />
            ) : filteredTrips.length === 0 ? (
                <Card padding="60px" className="u-text-center u-color-slate-400">
                    <p>Không tìm thấy chuyến nào phù hợp với bộ lọc.</p>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {filteredTrips
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map(trip => {
                                const filledSeats = trip.totalSeats - trip.availableSeats;
                                const fillPercent = Math.round((filledSeats / trip.totalSeats) * 100) || 0;
                                const isFull = trip.availableSeats === 0;

                                const displayStatus = getCalculatedStatus(trip);

                                return (
                                    <div key={trip.tripId} style={{ position: 'relative' }}>
                                        <Card
                                            className={`admin-trip-card status-${displayStatus} ${isFull ? 'full' : 'available'}`}
                                            onClick={() => handleOpenTripDetail(trip)}
                                            padding="0"
                                        >
                                            <div className="admin-trip-card-header">
                                                <div className="admin-trip-info-row">
                                                    <h3 className="admin-trip-route">{trip.routeName}</h3>
                                                    {getTripStatusBadge(displayStatus)}
                                                </div>
                                            </div>

                                            <div className="admin-trip-time-section">
                                                <div className="time-box">
                                                    <span className="time-label">Xuất bến</span>
                                                    <span className="time-val">{trip.departureTime}</span>
                                                </div>
                                                <div className="time-divider"></div>
                                                <div className="time-box">
                                                    <span className="time-label">Dự kiến</span>
                                                    <span className="time-val" style={{ color: '#94a3b8' }}>{trip.arrivalTime}</span>
                                                </div>
                                            </div>

                                            <div className="admin-trip-bus-details">
                                                <div className="bus-info-dashed-box">
                                                    <div className="bus-detail-item">
                                                        <span>Biển số: {trip.busPlate}</span>
                                                    </div>
                                                    <div className="bus-detail-item">
                                                        <span style={{ fontSize: '11px' }}>Loại xe: {trip.busType}</span>
                                                    </div>
                                                </div>
                                                 <div className="u-m-t-8 u-flex-column u-gap-4">
                                                    <div className="u-flex u-justify-between u-align-center">
                                                        <span className="u-size-11 u-weight-600 u-color-slate-500">Tài xế:</span>
                                                        <button 
                                                            className="admin-btn-icon" 
                                                            style={{ padding: '2px', color: '#3182ce' }}
                                                            onClick={(e) => { e.stopPropagation(); handleOpenAssignDriver(trip); }}
                                                            title="Gán tài xế"
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                                                        </button>
                                                    </div>
                                                    <span className="u-size-12 u-weight-700 u-color-blue-700">
                                                        {drivers.find(d => d.driverId === trip.driverId)?.fullName || 'Chưa gán tài xế'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="admin-trip-progress-section">
                                                <div className="progress-header">
                                                    <span className="progress-label">Lấp đầy</span>
                                                    <span className="progress-count">
                                                        {filledSeats}/{trip.totalSeats} ghế
                                                    </span>
                                                </div>
                                                <div className="admin-progress-outer">
                                                    <div
                                                        className="admin-progress-inner"
                                                        style={{
                                                            width: `${fillPercent}%`,
                                                            background: isFull ? '#f43f5e' : '#3b82f6'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                        {displayStatus === 0 && (
                                            <button 
                                                className="trip-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTripToDelete(trip);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTrips.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal Add Extra Trip */}
            <Modal
                isOpen={isAddTripOpen}
                onClose={() => setIsAddTripOpen(false)}
                title="Thêm Chuyến Tăng Cường Mới"
                width="520px"
            >
                <form onSubmit={handleAddExtraTrip} className="admin-form">
                    <div className="admin-form-group u-m-b-16">
                        <label className="admin-form-label">Tuyến đường:</label>
                        <select 
                            className="admin-form-select"
                            value={extraTripForm.routeId}
                            onChange={(e) => setExtraTripForm({...extraTripForm, routeId: e.target.value})}
                        >
                            <option value="">-- Chọn tuyến đường --</option>
                            {routes.map(r => (
                                <option key={r.routeId} value={r.routeId}>{r.routeName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group u-m-b-16">
                        <label className="admin-form-label">Xe tăng cường:</label>
                        <select 
                            className="admin-form-select"
                            value={extraTripForm.busId}
                            onChange={(e) => setExtraTripForm({...extraTripForm, busId: e.target.value})}
                        >
                            <option value="">-- Chọn xe --</option>
                            {buses.map(b => (
                                <option key={b.busId} value={b.busId}>{b.busPlate} ({b.busTypeName})</option>
                            ))}
                        </select>
                    </div>

                    <div className="u-grid u-grid-2 u-gap-16 u-m-b-16">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Giờ xuất bến:</label>
                            <input 
                                type="time" 
                                className="admin-form-input"
                                value={extraTripForm.departureTime}
                                onChange={(e) => setExtraTripForm({...extraTripForm, departureTime: e.target.value})}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Giờ đến (dự kiến):</label>
                            <input 
                                type="time" 
                                className="admin-form-input"
                                value={extraTripForm.arrivalTime}
                                onChange={(e) => setExtraTripForm({...extraTripForm, arrivalTime: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="admin-form-group u-m-b-24">
                        <label className="admin-form-label">Giá vé tăng cường (VNĐ):</label>
                        <input 
                            type="number" 
                            className="admin-form-input"
                            placeholder="VD: 200000"
                            value={extraTripForm.ticketPrice}
                            onChange={(e) => setExtraTripForm({...extraTripForm, ticketPrice: e.target.value})}
                        />
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={() => setIsAddTripOpen(false)}>Hủy</button>
                        <button type="submit" className="admin-btn-primary" disabled={isProcessing}>
                            {isProcessing ? 'Đang thực hiện...' : 'Thêm Mới'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTrip}
                title="Xóa Chuyến Xe"
                message={`Bạn có chắc chắn muốn xóa chuyến xe #${tripToDelete?.tripId} không? Lưu ý: Mọi ghế đã đặt sẽ bị hủy.`}
                confirmText="Xác nhận xóa"
                isLoading={isDeleting}
            />

            {/* Modal Gán tài xế */}
            <Modal
                isOpen={isAssignDriverModalOpen}
                onClose={() => setIsAssignDriverModalOpen(false)}
                title="Gán Tài Xế Cho Chuyến"
                width="400px"
            >
                <div className="admin-form">
                    <div className="u-m-b-16 u-p-16 u-rounded-12 u-bg-slate-50" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="u-size-12 u-color-slate-500 u-m-b-4">CHUYẾN ĐANG CHỌN:</div>
                        <div className="u-weight-700 u-color-slate-800">{selectedTripForDriver?.routeName}</div>
                        <div className="u-size-12 u-color-blue-600 u-weight-600">
                            {selectedTripForDriver?.departureTime} - {selectedTripForDriver?.departureDate}
                        </div>
                    </div>

                    <div className="admin-form-group u-m-b-24">
                        <label className="admin-form-label">Chọn tài xế:</label>
                        <select 
                            className="admin-form-select"
                            value={assigningDriverId}
                            onChange={(e) => setAssigningDriverId(e.target.value)}
                        >
                            <option value="">-- Chọn tài xế --</option>
                            {drivers.map(d => (
                                <option key={d.driverId} value={d.driverId}>{d.fullName}</option>
                            ))}
                        </select>
                        <span className="u-size-11 u-color-slate-400 u-m-t-8 u-block italic">
                            * Hệ thống sẽ tự động kiểm tra xem tài xế có lịch trùng hay không.
                        </span>
                    </div>

                    <div className="admin-form-actions">
                        <button className="admin-btn-outline" onClick={() => setIsAssignDriverModalOpen(false)} disabled={isAssigning}>Hủy</button>
                        <button 
                            className="admin-btn-primary" 
                            onClick={handleAssignDriver}
                            disabled={isAssigning}
                        >
                            {isAssigning ? 'Đang gán...' : 'Gán tài xế'}
                        </button>
                    </div>
                </div>
            </Modal>

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
                            <div className="modal-info-item">
                                <span className="modal-info-label">🕰️ Giờ xuất phát</span>
                                <span className="modal-info-value">{selectedTrip.departureTime}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">🚌 Biển số xe</span>
                                <span className="modal-info-value">{selectedTrip.busPlate}</span>
                            </div>
                            <div className="modal-info-item">
                                <span className="modal-info-label">🏷️ Loại xe & Chỗ</span>
                                <span className="modal-info-value">{selectedTrip.busType}</span>
                            </div>
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
