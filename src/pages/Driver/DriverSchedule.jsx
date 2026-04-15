import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Badge, Modal, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import driverService from '../../services/driver.service';
import './DriverSchedule.css';

const DriverSchedule = () => {
    const [viewMode, setViewMode] = useState('weekly'); // 'daily' or 'weekly'
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [loadingPassengers, setLoadingPassengers] = useState(false);
    const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);

    // Thêm state cho Modal xin xuống rớt
    const [isMidTripModalOpen, setIsMidTripModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [midTripLocation, setMidTripLocation] = useState('');
    const [isSubmittingDropOff, setIsSubmittingDropOff] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const response = await driverService.getMySchedule();
            setSchedule(handleApiResponse(response));
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể tải lịch làm việc';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPassengers = async (trip) => {
        try {
            setSelectedTrip(trip);
            setIsPassengerModalOpen(true);
            setLoadingPassengers(true);
            const response = await driverService.getTripPassengers(trip.tripId);
            setPassengers(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách hành khách');
            setIsPassengerModalOpen(false);
        } finally {
            setLoadingPassengers(false);
        }
    };

    const handleToggleBoard = async (ticketId, currentStatus) => {
        if (!ticketId) {
            toast.warning('Không có thông tin vé để xác nhận.');
            return;
        }
        try {
            const response = await driverService.toggleBoard(ticketId);
            const { isBoarded } = response.data;
            setPassengers(prev => prev.map(p => p.ticketId === ticketId ? { ...p, isBoarded } : p));
            toast.success(isBoarded ? 'Đã xác nhận khách lên xe!' : 'Đã hủy xác nhận lên xe.');
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái lên xe.');
        }
    };

    const handleToggleDropOff = async (ticketId, currentStatus) => {
        if (!ticketId) {
            toast.warning('Không có thông tin vé để xác nhận.');
            return;
        }
        try {
            const response = await driverService.toggleDropOff(ticketId);
            const { isDroppedOff } = response.data;
            setPassengers(prev => prev.map(p => p.ticketId === ticketId ? { ...p, isDroppedOff } : p));
            toast.success(isDroppedOff ? 'Đã xác nhận khách xuống xe!' : 'Đã hủy xác nhận xuống xe.');
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái xuống xe.');
        }
    };

    const handleOpenMidTripModal = (ticketId) => {
        setSelectedTicketId(ticketId);
        setMidTripLocation('');
        setIsMidTripModalOpen(true);
    };

    const handleSubmitMidTripDropOff = async () => {
        if (!midTripLocation.trim()) {
            toast.warning('Vui lòng nhập điểm xuống xe thực tế.');
            return;
        }

        try {
            setIsSubmittingDropOff(true);
            const response = await driverService.requestMidTripDropOff(selectedTicketId, {
                actualDropOffLocation: midTripLocation
            });
            toast.success(response.data?.message || 'Đã gửi yêu cầu xác nhận xuống xe giữa dọc đường.');
            
            // Cập nhật UI
            setPassengers(prev => prev.map(p => p.ticketId === selectedTicketId ? { ...p, status: 'WaittingDropOffConfirm' } : p));
            setIsMidTripModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setIsSubmittingDropOff(false);
        }
    };


    const getTodayTrips = () => schedule.filter(t => new Date(t.departureTime).toDateString() === new Date().toDateString()).length;
    const getWeekTrips = () => {
        const start = getStartOfWeek(currentWeek);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        return schedule.filter(t => {
            const date = new Date(t.departureTime);
            return date >= start && date < end;
        }).length;
    };
    const getNextTrip = () => {
        const now = new Date();
        const futureTrips = schedule.filter(t => new Date(t.departureTime) > now);
        return futureTrips.length > 0 ? futureTrips.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))[0] : null;
    };

    const getUpcomingCount = () => {
        const now = new Date();
        return schedule.filter(t => new Date(t.departureTime) > now).length;
    };

    function getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    const weekDays = [...Array(7)].map((_, i) => {
        const d = getStartOfWeek(currentWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const formatWeekRange = () => {
        const start = weekDays[0];
        const end = weekDays[6];
        return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentWeek(newDate);
    };

    return (
        <div className="driver-schedule-container">
            <div className="u-flex u-justify-between u-align-center u-m-b-24">
                <div className="u-flex u-align-center u-gap-12">
                    <div className="u-rounded-full" style={{ width: '10px', height: '10px', background: 'var(--admin-accent)' }}></div>
                    <span className="u-size-14 u-weight-700 u-color-slate-500" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Thống kê ngày hôm nay</span>
                </div>
                <button 
                    className="driver-toggle-btn" 
                    onClick={fetchSchedule}
                    title="Tải lại dữ liệu"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="driver-stats-grid u-m-b-32">
                <div className="driver-stat-card" style={{ '--stat-color': '#10b981' }}>
                    <div className="driver-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="driver-stat-content">
                        <div className="u-flex u-align-center u-gap-12">
                            <span className="u-size-24 u-weight-700">{getTodayTrips()}</span>
                            <span className="u-size-13 u-weight-600 u-color-slate-500">Chuyến hôm nay</span>
                        </div>
                    </div>
                </div>

                <div className="driver-stat-card" style={{ '--stat-color': '#3182ce' }}>
                    <div className="driver-stat-icon" style={{ background: '#ebf8ff', color: '#3182ce' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div className="driver-stat-content">
                        <div className="u-flex u-align-center u-gap-12">
                            <span className="u-size-24 u-weight-700">{getWeekTrips()}</span>
                            <span className="u-size-13 u-weight-600 u-color-slate-500">Chuyến tuần này</span>
                        </div>
                    </div>
                </div>

                <div className="driver-stat-card" style={{ '--stat-color': '#f59e0b' }}>
                    <div className="driver-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div className="driver-stat-content">
                        <div className="u-flex u-align-center u-gap-12">
                            <span className="u-size-24 u-weight-700">{getUpcomingCount()}</span>
                            <span className="u-size-13 u-weight-600 u-color-slate-500">Sắp diễn ra</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="schedule-main-card admin-card u-p-0 u-m-b-32">
                <div className="schedule-header u-p-16 u-p-24-md u-flex u-justify-between u-align-center">
                    <div className="schedule-title-area u-flex u-align-center u-gap-24">
                        <h2 className="u-size-18 u-weight-700 u-m-0">Lịch làm việc tuần</h2>
                        <div className="view-mode-toggles u-flex u-gap-8">
                            <button 
                                className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                                onClick={() => setViewMode('weekly')}
                                title="Xem theo tuần"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button 
                                className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
                                onClick={() => setViewMode('daily')}
                                title="Xem danh sách"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                    <div className="schedule-actions-area u-flex u-align-center u-gap-16">
                        <div className="week-nav u-flex u-align-center u-gap-12">
                            <button className="nav-btn" onClick={() => navigateWeek(-1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span className="u-size-13 u-weight-700 u-color-slate-600 u-text-nowrap">{formatWeekRange()}</span>
                            <button className="nav-btn" onClick={() => navigateWeek(1)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="schedule-body u-p-24 u-p-t-0">
                    {loading ? (
                        <LoadingSpinner message="Đang đồng bộ dữ liệu..." />
                    ) : viewMode === 'weekly' ? (
                        <div className="weekly-grid">
                            {weekDays.map((day, index) => {
                                const dayTrips = schedule.filter(t => new Date(t.departureTime).toDateString() === day.toDateString());
                                const isToday = day.toDateString() === new Date().toDateString();
                                const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
                                const dayIdx = index === 6 ? 0 : index + 1; // Map to 0-6 where 0 is Sunday
                                
                                return (
                                    <div key={index} className={`day-column ${isToday ? 'is-today' : ''}`}>
                                        <div className="day-header">
                                            <div className="day-name">{dayNames[index]}</div>
                                            <div className="day-date">{day.getDate().toString().padStart(2, '0')}/{(day.getMonth() + 1).toString().padStart(2, '0')}</div>
                                        </div>
                                        <div className="day-trips">
                                            {dayTrips.map((trip) => (
                                                <div 
                                                    key={trip.tripId} 
                                                    className="compact-trip-card" 
                                                    onClick={() => handleViewPassengers(trip)}
                                                >
                                                     <div className="trip-time">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                        {trip.departureTime ? new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                    </div>
                                                    <div className="trip-route">{trip.routeName}</div>
                                                    <div className="trip-meta">
                                                        <div className="meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>{trip.busPlateNumber}</div>
                                                        <div className="meta-item"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>{trip.passengerCount} ghế</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="u-grid u-grid-1 u-gap-20">
                            {schedule.map((trip) => (
                                <div key={trip.tripId} className="admin-trip-card" style={{ borderTopColor: '#3b82f6', cursor: 'default' }}>
                                    <div className="admin-trip-info-row">
                                        <div className="admin-trip-route">{trip.routeName}</div>
                                        <Badge type={trip.status === 'Scheduled' ? 'info' : (trip.status === 'Departed' ? 'warning' : 'success')}>
                                            {trip.status === 'Scheduled' ? 'Sắp xuất bến' : (trip.status === 'Departed' ? 'Đang hành trình' : 'Hoàn thành')}
                                        </Badge>
                                    </div>
                                    
                                    <div className="u-grid u-grid-3 u-gap-20">
                                        <div className="admin-trip-time">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            {new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="admin-trip-stat-label">
                                            BIỂN SỐ: <span className="admin-trip-stat-value u-color-slate-800">{trip.busPlateNumber}</span>
                                        </div>
                                        <div className="admin-trip-stat-label">
                                            KHÁCH: <span className="admin-trip-stat-value u-color-slate-800">{trip.passengerCount} người</span>
                                        </div>
                                    </div>

                                    <div className="admin-trip-bus-info u-m-t-8">
                                        <div className="u-flex u-align-center u-gap-12">
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Dự kiến tới: {trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                            <span style={{ color: '#cbd5e0' }}>|</span>
                                            <span style={{ fontSize: '11px', color: '#a0aec0' }}>#{trip.tripId}</span>
                                        </div>
                                        <button 
                                            className="admin-btn-icon" 
                                            onClick={() => handleViewPassengers(trip)}
                                            title="Xem danh sách hành khách"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {schedule.length === 0 && <p className="u-text-center u-p-40 u-color-slate-400">Không có dữ liệu hiển thị</p>}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isPassengerModalOpen}
                onClose={() => setIsPassengerModalOpen(false)}
                title={
                    <div className="u-flex-column">
                        <span className="u-size-18 u-weight-700">Danh sách hành khách</span>
                        <span className="u-size-13 u-weight-500 u-color-slate-200">#{selectedTrip?.tripId} - {selectedTrip?.routeName}</span>
                    </div>
                }
                width="95%"
                maxWidth="1000px"
                padding="0"
            >
                {loadingPassengers ? (
                        <LoadingSpinner message="Đang tải dữ liệu hành khách..." />
                ) : (
                    <div className="admin-table-wrapper" style={{ margin: 0, borderRadius: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Ghế</th>
                                    <th>Hành khách</th>
                                    <th>Điểm đón</th>
                                    <th>Lên xe</th>
                                    <th>Xuống xe</th>
                                    <th style={{ paddingRight: '24px' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengers.map((p, idx) => (
                                    <tr key={idx} className={p.isDroppedOff ? 'row-dropped-off' : (p.isBoarded ? 'row-boarded' : '')}>
                                        <td data-label="Ghế" style={{ paddingLeft: '24px' }}><b className="u-color-blue-600">{p.seatNumber}</b></td>
                                        <td data-label="Hành khách">
                                            <div className="u-weight-600">{p.customerName}</div>
                                            <div className="u-size-12 u-color-slate-500">{p.phoneNumber}</div>
                                        </td>
                                        <td data-label="Điểm đón">{p.pickUpPoint || 'Bến xe'}</td>
                                        <td data-label="Lên xe">
                                            <div className={`driver-check-box ${p.isBoarded ? 'active' : ''}`} onClick={() => handleToggleBoard(p.ticketId, p.isBoarded)}>
                                                {p.isBoarded && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                        </td>
                                        <td data-label="Xuống xe">
                                            <div className="u-flex u-align-center u-gap-12">
                                                <div 
                                                    className={`driver-check-box ${p.isDroppedOff ? 'active' : ''} ${!p.isBoarded ? 'disabled' : ''}`} 
                                                    onClick={() => p.isBoarded && handleToggleDropOff(p.ticketId, p.isDroppedOff)}
                                                    title="Khách xuống bến cuối"
                                                >
                                                    {p.isDroppedOff && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                                
                                                {/* Add button for mid-trip drop-off request */}
                                                {p.isBoarded && !p.isDroppedOff && p.status !== 'WaittingDropOffConfirm' && (
                                                    <button 
                                                        className="admin-btn-outline" 
                                                        style={{ color: '#e53e3e', borderColor: '#fc8181', fontSize: '11px', padding: '4px 8px', borderRadius: '4px' }}
                                                        onClick={() => handleOpenMidTripModal(p.ticketId)}
                                                    >
                                                        Xuống giữa đường
                                                    </button>
                                                )}
                                                 {p.status === 'WaittingDropOffConfirm' && (
                                                     <span className="u-size-11" style={{ color: '#dd6b20', backgroundColor: '#feebc8', padding: '2px 6px', borderRadius: '4px' }}>
                                                         Đang xin duyệt...
                                                     </span>
                                                 )}
                                            </div>
                                        </td>
                                        <td data-label="Trạng thái" style={{ paddingRight: '24px' }}>
                                            <Badge type={p.isDroppedOff ? 'success' : (p.isBoarded ? 'warning' : 'info')}>
                                                {p.isDroppedOff ? 'Hoàn thành' : (p.isBoarded ? 'Đang trên xe' : 'Chờ đón')}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {passengers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="u-text-center u-p-40 u-color-slate-400">Chưa có hành khách nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isMidTripModalOpen}
                onClose={() => setIsMidTripModalOpen(false)}
                title="Xác nhận xuống xe dọc đường"
                width="95%"
                maxWidth="500px"
            >
                <div className="u-flex-column u-gap-16">
                    <p className="u-size-14 u-color-slate-600">
                        Khách hàng yêu cầu xuống xe trước khi đến bến cuối. Vui lòng nhập địa điểm xuống xe thực tế để gửi cho Admin và khách hàng xác nhận.
                    </p>
                    <div className="admin-form-group">
                        <label className="admin-form-label">Điểm xuống xe thực tế *</label>
                        <input
                            type="text"
                            className="admin-form-input"
                            placeholder="VD: Trạm thu phí XYZ, Ngã 3 ABC..."
                            value={midTripLocation}
                            onChange={(e) => setMidTripLocation(e.target.value)}
                        />
                    </div>
                    
                    <div className="admin-form-actions u-m-t-24">
                        <button 
                            className="admin-btn-outline" 
                            onClick={() => setIsMidTripModalOpen(false)}
                            disabled={isSubmittingDropOff}
                        >
                            Hủy
                        </button>
                        <button 
                            className="admin-btn-primary" 
                            onClick={handleSubmitMidTripDropOff}
                            disabled={isSubmittingDropOff || !midTripLocation.trim()}
                        >
                            {isSubmittingDropOff ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default DriverSchedule;
