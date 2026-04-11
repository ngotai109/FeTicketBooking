import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination } from '../../components/Common';
import scheduleService from '../../services/schedule.service';
import routeService from '../../services/route.service';
import busService from '../../services/bus.service';
import tripService from '../../services/trip.service';
import driverService from '../../services/driver.service';

const ScheduleManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Generator states
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [genDates, setGenDates] = useState({ fromDate: '', toDate: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal states for CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    const [formData, setFormData] = useState({
        routeId: '',
        busId: '',
        driverId: '',
        departureTime: '',
        arrivalTime: '',
        ticketPrice: '',
        isActive: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [routesRes, busesRes, driversRes] = await Promise.all([
                routeService.getRoutes(),
                busService.getAllBuses(),
                driverService.getAllDrivers()
            ]);
            
            const fetchedRoutes = routesRes.data?.data || routesRes.data || [];
            const fetchedBuses = busesRes.data?.data || busesRes.data || [];
            const fetchedDrivers = driversRes.data?.data || driversRes.data || [];
            
            setRoutes(Array.isArray(fetchedRoutes) ? fetchedRoutes : []);
            setBuses(Array.isArray(fetchedBuses) ? fetchedBuses : []);
            setDrivers(Array.isArray(fetchedDrivers) ? fetchedDrivers : []);

            fetchSchedules();
        } catch (error) {
            toast.error('Không thể tải dữ liệu Tuyến đường và Xe từ máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const res = await scheduleService.getAllSchedules();
            const fetched = res.data?.data || res.data || [];
            if (Array.isArray(fetched) && fetched.length > 0) {
                setSchedules(fetched);
            } else {
                throw new Error('No data');
            }
        } catch (error) {
            console.error('Lỗi tải danh sách lịch trình:', error.response?.data || error.message);
            setSchedules([]);
        }
    };

    const handleGenerateTrips = async (e) => {
        e.preventDefault();
        try {
            setIsGenerating(true);
            await tripService.generateTrips({
                startDate: genDates.fromDate,
                endDate: genDates.toDate
            });

            toast.success(`Đã sinh chuyến thực tế từ ${genDates.fromDate} đến ${genDates.toDate} thành công!`);
            setIsGeneratorOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi sinh chuyến tự động!');
            setIsGeneratorOpen(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenModal = (schedule = null) => {
        if (schedule) {
            setIsEditMode(true);
            setSelectedScheduleId(schedule.scheduleId || schedule.ScheduleId);
            setFormData({
                routeId: (schedule.routeId || schedule.RouteId || '').toString(),
                busId: (schedule.busId || schedule.BusId || '').toString(),
                driverId: (schedule.driverId || schedule.DriverId || '').toString(),
                departureTime: schedule.departureTime || schedule.DepartureTime || '',
                arrivalTime: schedule.arrivalTime || schedule.ArrivalTime || '',
                ticketPrice: schedule.ticketPrice || schedule.TicketPrice || '',
                isActive: schedule.isActive !== undefined ? schedule.isActive : true
            });
        } else {
            setIsEditMode(false);
            setSelectedScheduleId(null);
            setFormData({
                routeId: '',
                busId: '',
                driverId: '',
                departureTime: '',
                arrivalTime: '',
                ticketPrice: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleAutoCalcPrice = (newRouteId, newBusId) => {
        let finalPrice = 0;
        let routeFound = false;
        
        if (newRouteId) {
            const route = routes.find(r => (r.routeId || r.RouteId)?.toString() === newRouteId);
            if (route) {
                finalPrice += (route.basePrice || route.BasePrice || 0);
                routeFound = true;
            }
        }
        
        if (newBusId && routeFound) {
            const bus = buses.find(b => (b.busId || b.BusId)?.toString() === newBusId);
            if (bus) {
                const limit = bus.totalSeats || bus.TotalSeats || bus.capacity || 0;
                
                // Logic tính giá theo loại xe:
                // - Xe <= 22 chỗ (Phòng VIP/Solati): + 50,000đ
                // - Xe 34 chỗ (Giường nằm cao cấp): + 30,000đ
                // - Xe 40 chỗ trở lên (Giường nằm thường): Giữ nguyên giá tuyến
                if (limit <= 22) { 
                    finalPrice += 50000;
                } else if (limit > 22 && limit <= 34) { 
                    finalPrice += 30000;
                } else if (limit > 34) {
                    finalPrice += 0;
                }
            }
        }
        
        return routeFound ? finalPrice : '';
    };

    const handleFormChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        
        if (field === 'routeId' || field === 'busId') {
            const calculatedPrice = handleAutoCalcPrice(newData.routeId, newData.busId);
            if (calculatedPrice !== '') {
                newData.ticketPrice = calculatedPrice;
            }
        }
        
        setFormData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                routeId: parseInt(formData.routeId),
                busId: parseInt(formData.busId),
                driverId: formData.driverId ? parseInt(formData.driverId) : null,
                ticketPrice: parseFloat(formData.ticketPrice)
            };

            if (isEditMode) {
                await scheduleService.updateSchedule(selectedScheduleId, dataToSubmit);
                toast.success('Cập nhật chuyến thành công!');
            } else {
                await scheduleService.createSchedule(dataToSubmit);
                toast.success('Thêm chuyến mới thành công!');
            }
            setIsModalOpen(false);
            fetchSchedules();
        } catch (error) {
            console.error("Schedule Submit Error:", error.response?.data || error);
            const detail = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'Lỗi không xác định');
            toast.error(`Thất bại: ${detail}`);
        }
    };

    const handleDeleteClick = (schedule) => {
        setScheduleToDelete(schedule);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!scheduleToDelete) return;
        try {
            setIsDeleting(true);
            const id = scheduleToDelete.scheduleId || scheduleToDelete.ScheduleId;
            await scheduleService.deleteSchedule(id);
            toast.success('Xóa lịch trình thành công!');
            fetchSchedules();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi khi xóa lịch trình');
        } finally {
            setIsDeleting(false);
        }
    };

    const getRouteName = (routeId) => {
        const r = routes.find(r => (r.routeId || r.RouteId) === routeId);
        return r ? r.routeName || r.RouteName : `Tuyến #${routeId}`;
    };

    const getBusPlate = (busId) => {
        const b = buses.find(b => (b.busId || b.BusId) === busId);
        return b ? b.plateNumber || b.PlateNumber || b.licensePlate : `Xe #${busId}`;
    };

    return (
        <div className="admin-page-container">
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Lịch Cố Định</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{schedules.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tuyến Đang Chạy</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{routes.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Xe Sẵn Sàng</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{buses.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Hiệu Suất</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10l4.5 4.5"></path><circle cx="12" cy="12" r="10"></circle></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">95%</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                <div className="admin-toolbar">
                    <div className="search-box" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm lịch trình..."
                            className="admin-search-input"
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>
                    <div className="u-flex u-gap-12 u-m-l-auto">
                        <button 
                            className="admin-btn-add"
                            style={{ background: '#1a3a8f' }}
                            onClick={() => handleOpenModal()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Thêm Chuyến Mới
                        </button>
                        <button 
                            className="admin-btn-success"
                            onClick={() => setIsGeneratorOpen(true)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h-4v4h4v-4z"/></svg>
                            Sinh Chuyến Tự Động
                        </button>
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tuyến đường</th>
                                <th>Xe Mặc định</th>
                                <th>Giờ Xuất Bến</th>
                                <th>Giờ Đến</th>
                                <th>Vé Mặc định</th>
                                <th className="u-text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="u-text-center u-p-40">Đang tải...</td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan="6" className="u-text-center u-p-40">Chưa có lịch trình (Schedules) nào!</td></tr>
                            ) : (
                                schedules.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(s => (
                                    <tr key={s.scheduleId}>
                                        <td className="u-weight-600 u-color-blue">{getRouteName(s.routeId)}</td>
                                        <td>
                                            <Badge type="info" className="u-size-12 u-weight-600 u-bg-transparent" style={{ border: '1px solid #e2e8f0', color: '#4a5568' }}>
                                                {getBusPlate(s.busId)}
                                            </Badge>
                                        </td>
                                        <td className="u-color-green u-weight-700">{s.departureTime}</td>
                                        <td className="u-color-red u-weight-700">{s.arrivalTime}</td>
                                        <td className="u-weight-600">{s.ticketPrice?.toLocaleString()} đ</td>
                                        <td className="u-text-center">
                                            <div className="u-flex u-gap-12 u-justify-center">
                                                <button 
                                                    onClick={() => handleOpenModal(s)} 
                                                    className="admin-btn-icon"
                                                    title="Chỉnh sửa"
                                                    style={{ color: '#2b6cb0' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(s)} 
                                                    className="admin-btn-icon"
                                                    title="Xóa"
                                                    style={{ color: '#e53e3e' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={schedules.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditMode ? 'Cập Nhật Lịch Trình' : 'Thêm Chuyến Mới'}
                width="500px"
            >
                <form onSubmit={handleSubmit}>
                    <div className="u-flex-column u-gap-16">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tuyến đường:</label>
                            <select 
                                className="admin-form-select"
                                required 
                                value={formData.routeId} 
                                onChange={(e) => handleFormChange('routeId', e.target.value)}
                            >
                                <option value="">-- Chọn tuyến đường --</option>
                                {routes.map(r => (
                                    <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>
                                        {r.routeName || r.RouteName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Xe mặc định:</label>
                            <select 
                                className="admin-form-select"
                                required 
                                value={formData.busId} 
                                onChange={(e) => handleFormChange('busId', e.target.value)}
                            >
                                <option value="">-- Chọn xe --</option>
                                {buses.map(b => (
                                    <option key={b.busId || b.BusId} value={b.busId || b.BusId}>
                                        {b.plateNumber || b.PlateNumber || b.licensePlate} ({b.defaultSeats || b.DefaultSeats || b.totalSeats || b.TotalSeats || 40} chỗ)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tài xế mặc định:</label>
                            <select 
                                className="admin-form-select"
                                value={formData.driverId} 
                                onChange={(e) => handleFormChange('driverId', e.target.value)}
                            >
                                <option value="">-- Để trống nếu chưa gán --</option>
                                {drivers.map(d => (
                                    <option key={d.driverId} value={d.driverId}>
                                        {d.fullName} ({d.phoneNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="u-flex u-gap-16">
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Giờ xuất bến:</label>
                                <input type="time" className="admin-form-input" required value={formData.departureTime} onChange={(e) => handleFormChange('departureTime', e.target.value)} />
                            </div>
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Giờ đến (dự kiến):</label>
                                <input type="time" className="admin-form-input" required value={formData.arrivalTime} onChange={(e) => handleFormChange('arrivalTime', e.target.value)} />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Giá vé mặc định (VNĐ):</label>
                            <input type="number" className="admin-form-input" required min="0" value={formData.ticketPrice} onChange={(e) => handleFormChange('ticketPrice', e.target.value)} placeholder="VD: 200000" />
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                        <button type="submit" className="admin-btn-primary">
                            {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isGeneratorOpen}
                onClose={() => setIsGeneratorOpen(false)}
                title="Tự động Sinh Chuyến"
                width="450px"
            >
                <div className="u-size-13 u-color-emerald-deep u-p-16 u-bg-emerald-faint u-weight-600" style={{ marginBottom: '24px', borderRadius: '12px', lineHeight: 1.5 }}>
                    💡 Hệ thống sẽ tự động sao chép các <b>Lịch Cố Định</b> và tạo ra hàng loạt <b>Chuyến Thực Tế</b> kèm theo sơ đồ ghế cho những ngày được chọn.
                </div>

                <form onSubmit={handleGenerateTrips}>
                    <div className="u-flex-column u-gap-16">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Từ Ngày:</label>
                            <input type="date" className="admin-form-input" required value={genDates.fromDate} onChange={(e) => setGenDates({...genDates, fromDate: e.target.value})} />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Đến Ngày:</label>
                            <input type="date" className="admin-form-input" required value={genDates.toDate} onChange={(e) => setGenDates({...genDates, toDate: e.target.value})} />
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={() => setIsGeneratorOpen(false)}>Hủy</button>
                        <button type="submit" className="admin-btn-success" disabled={isGenerating}>
                            {isGenerating ? 'Đang xử lý...' : 'Bắt đầu Sinh chuyến'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Xóa lịch trình"
                message={`Bạn có chắc chắn muốn xóa lịch trình của tuyến "${getRouteName(scheduleToDelete?.routeId)}" lúc ${scheduleToDelete?.departureTime}?`}
                isDangerous={true}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ScheduleManagement;
