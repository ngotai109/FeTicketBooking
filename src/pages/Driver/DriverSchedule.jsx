import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Badge, Modal, Loading } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import driverService from '../../services/driver.service';
import api from '../../services/api';

const DriverSchedule = () => {
    const [viewMode, setViewMode] = useState('weekly'); // 'daily' or 'weekly'
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [loadingPassengers, setLoadingPassengers] = useState(false);
    const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleViewPassengers = async (trip) => {
        try {
            setSelectedTrip(trip);
            setIsPassengerModalOpen(true);
            setLoadingPassengers(true);
            const response = await api.get(`/Driver/my-trips/${trip.tripId}/passengers`, { skipLoading: true });
            setPassengers(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách hành khách');
            setIsPassengerModalOpen(false);
        } finally {
            setLoadingPassengers(false);
        }
    };

    const fetchSchedule = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Driver/my-schedule', { skipLoading: true });
            setSchedule(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải lịch làm việc');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBoard = async (ticketId) => {
        try {
            await api.patch(`/Driver/tickets/${ticketId}/toggle-board`);
            // Cập nhật lại danh sách tại chỗ để không load lại toàn bộ modal
            setPassengers(prev => prev.map(p =>
                p.ticketId === ticketId ? { ...p, isBoarded: !p.isBoarded } : p
            ));
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái lên xe');
        }
    };

    const handleToggleDropOff = async (ticketId) => {
        try {
            await api.patch(`/Driver/tickets/${ticketId}/toggle-dropoff`);
            setPassengers(prev => prev.map(p =>
                p.ticketId === ticketId ? { ...p, isDroppedOff: !p.isDroppedOff } : p
            ));
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái xuống xe');
        }
    };

    const [isMidTripModalOpen, setIsMidTripModalOpen] = useState(false);
    const [midTripTicket, setMidTripTicket] = useState(null);
    const [actualLocation, setActualLocation] = useState('');
    const [reason, setReason] = useState('');

    const handleOpenMidTrip = (passenger) => {
        setMidTripTicket(passenger);
        setIsMidTripModalOpen(true);
    };

    const handleRequestMidTrip = async () => {
        if (!actualLocation.trim()) {
            toast.warning('Vui lòng nhập điểm xuống xe thực tế');
            return;
        }
        if (!reason.trim()) {
            toast.warning('Vui lòng nhập lý do xuống dọc đường');
            return;
        }

        try {
            await api.post(`/Driver/tickets/${midTripTicket.ticketId}/request-mid-trip-dropoff`, {
                actualDropOffLocation: actualLocation,
                reason: reason
            });
            toast.success('Đã gửi yêu cầu xuống xe dọc đường cho Admin');
            setIsMidTripModalOpen(false);
            setActualLocation('');
            setReason('');
            // Refresh danh sách để cập nhật trạng thái
            const response = await api.get(`/Driver/my-trips/${selectedTrip.tripId}/passengers`, { skipLoading: true });
            setPassengers(handleApiResponse(response));
        } catch (error) {
            toast.error('Lỗi khi gửi yêu cầu');
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
        return schedule.find(t => new Date(t.departureTime) > now);
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
            <div className="driver-stats-grid u-m-b-32" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="driver-stat-card" style={{ '--stat-color': '#10b981' }}>
                    <div className="driver-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="driver-stat-content">
                        <div className="u-flex u-align-center u-gap-12">
                            <span className="u-size-28 u-weight-800">{getTodayTrips()}</span>
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
                            <span className="u-size-28 u-weight-800">{getWeekTrips()}</span>
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
                            <span className="u-size-28 u-weight-800">1</span>
                            <span className="u-size-13 u-weight-600 u-color-slate-500">Sắp diễn ra</span>
                        </div>
                    </div>
                </div>

                <div className="driver-stat-card" style={{ '--stat-color': '#10b981' }}>
                    <div className="driver-stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                        <span className="u-size-20 u-weight-800">✨</span>
                    </div>
                    <div className="driver-stat-content">
                        <div className="u-flex u-align-center u-gap-12">
                            <span className="u-size-28 u-weight-800">0</span>
                            <span className="u-size-13 u-weight-600 u-color-slate-500">Nghỉ / bù</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="schedule-main-card admin-card u-p-0 u-m-b-32">
                <div className="schedule-header u-p-24 u-flex u-justify-between u-align-center">
                    <div className="u-flex u-align-center u-gap-24">
                        <h2 className="u-size-18 u-weight-700 u-m-0">Lịch làm việc tuần</h2>
                        <div className="week-nav u-flex u-align-center u-gap-16">
                            <button className="nav-btn" onClick={() => navigateWeek(-1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span className="u-size-14 u-weight-700 u-color-slate-600">{formatWeekRange()}</span>
                            <button className="nav-btn" onClick={() => navigateWeek(1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    <div className="u-flex u-gap-12">
                        <button
                            className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                            onClick={() => setViewMode('weekly')}
                        >
                            Chế độ tuần
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
                            onClick={() => setViewMode('daily')}
                        >
                            Danh sách
                        </button>
                    </div>
                </div>

                <div className="schedule-body u-p-24 u-p-t-0">
                    <div style={{ position: 'relative', minHeight: '350px' }}>
                        {loading ? (
                            <div className="u-p-40 u-text-center">
                                <div className="basic-spinner u-m-x-auto"></div>
                            </div>
                        ) : viewMode === 'weekly' ? (
                            <div className="weekly-grid">
                                {weekDays.map((day, index) => {
                                    const dayTrips = schedule.filter(t => new Date(t.departureTime).toDateString() === day.toDateString());
                                    const isToday = day.toDateString() === new Date().toDateString();
                                    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
                                    const dayIdx = index === 6 ? 0 : index + 1; // Map to 0-6 where 0 is Sunday

                                    return (
                                        <div key={index} className={`day-column ${isToday ? 'is-today' : ''} ${dayTrips.length > 0 ? 'has-trips' : ''}`}>
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
                                                            {new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                                    <div key={trip.tripId} className="admin-trip-card" style={{ borderTopColor: trip.status === 'Scheduled' ? '#1a3a8f' : '#38a169', cursor: 'default' }}>
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
                                                <span style={{ fontSize: '12px', fontWeight: 600 }}>Dự kiến tới: {new Date(trip.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
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
                width="1000px"
                padding="0"
            >
                <div style={{ position: 'relative', minHeight: '300px' }}>
                    {loadingPassengers ? (
                        <Loading />
                    ) : (
                        <div className="admin-table-wrapper" style={{ margin: 0, borderRadius: 0 }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '24px' }}>Ghế</th>
                                        <th>Hành khách</th>
                                        <th>Điểm đón</th>
                                        <th className="u-text-center">Lên xe</th>
                                        <th className="u-text-center">Xuống xe</th>
                                        <th style={{ paddingRight: '24px' }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {passengers.map((p, idx) => (
                                        <tr key={idx}>
                                            <td style={{ paddingLeft: '24px' }}><b className="u-color-blue-600">{p.seatNumber}</b></td>
                                            <td>
                                                <div className="u-weight-600">{p.customerName}</div>
                                                <div className="u-size-12 u-color-slate-500">{p.phoneNumber}</div>
                                            </td>
                                            <td>{p.pickUpPoint || 'Bến xe'}</td>
                                            <td className="u-text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.isBoarded}
                                                    disabled={p.status === 'WaittingDropOffConfirm' || p.status === 'MidTripEmailSent'}
                                                    onChange={() => handleToggleBoard(p.ticketId)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-align-center u-justify-center u-gap-12">
                                                    <input
                                                        type="checkbox"
                                                        disabled={!p.isBoarded || p.status === 'WaittingDropOffConfirm' || p.status === 'MidTripEmailSent'}
                                                        checked={p.isDroppedOff}
                                                        onChange={() => handleToggleDropOff(p.ticketId)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                    {p.isBoarded && !p.isDroppedOff && p.status !== 'WaittingDropOffConfirm' && p.status !== 'MidTripEmailSent' && (
                                                        <button
                                                            className="u-size-11 u-weight-600 u-color-blue-600"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                            onClick={() => handleOpenMidTrip(p)}
                                                        >
                                                            Xuống dọc đường
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ paddingRight: '24px' }}>
                                                {p.isDroppedOff ? (
                                                    <Badge type="success">HOÀN THÀNH</Badge>
                                                ) : p.status === 'WaittingDropOffConfirm' ? (
                                                    <Badge type="info">ĐANG CHỜ DUYỆT</Badge>
                                                ) : p.status === 'MidTripEmailSent' ? (
                                                    <Badge type="info">ĐÃ GỬI MAIL - CHỜ KHÁCH</Badge>
                                                ) : p.isBoarded ? (
                                                    <Badge type="warning">ĐANG TRÊN XE</Badge>
                                                ) : (
                                                    <Badge type="secondary">CHỜ KHÁCH</Badge>
                                                )}
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
                </div>
            </Modal>

            {/* Modal Nhập điểm xuống dọc đường */}
            <Modal
                isOpen={isMidTripModalOpen}
                onClose={() => setIsMidTripModalOpen(false)}
                title="Yêu cầu xuống xe dọc đường"
                width="450px"
            >
                <div className="u-p-12">
                    <p className="u-size-14 u-m-b-16">Hành khách: <b>{midTripTicket?.customerName}</b> - Ghế: <b>{midTripTicket?.seatNumber}</b></p>
                    <div className="form-group u-m-b-24">
                        <label className="u-size-13 u-weight-600 u-m-b-8">Điểm xuống xe thực tế:</label>
                        <input
                            type="text"
                            className="admin-input"
                            placeholder="Ví dụ: Cổng chào TP Vinh, Ngã ba..."
                            value={actualLocation}
                            onChange={(e) => setActualLocation(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group u-m-b-24">
                        <label className="u-size-13 u-weight-600 u-m-b-8">Lý do xuống xe:</label>
                        <textarea
                            className="admin-input"
                            placeholder="Nhập lý do (ví dụ: việc bận đột xuất, say xe...)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            style={{ resize: 'none', width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div className="u-flex u-justify-end u-gap-12 u-p-t-8">
                        <button className="admin-btn-outline" style={{ height: '40px', padding: '0 24px' }} onClick={() => setIsMidTripModalOpen(false)}>Hủy</button>
                        <button className="admin-btn-primary" style={{ height: '40px' }} onClick={handleRequestMidTrip}>Gửi Admin phê duyệt</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DriverSchedule;
