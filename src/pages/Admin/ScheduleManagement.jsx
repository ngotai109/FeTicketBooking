import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination } from '../../components/Common';
import scheduleService from '../../services/schedule.service';
import routeService from '../../services/route.service';
import busService from '../../services/bus.service';

const ScheduleManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
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
        defaultBusId: '',
        departureTime: '',
        arrivalTime: '',
        defaultTicketPrice: '',
        isActive: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [routesRes, busesRes] = await Promise.all([
                routeService.getRoutes(),
                busService.getAllBuses()
            ]);
            
            const fetchedRoutes = routesRes.data?.data || routesRes.data || [];
            const fetchedBuses = busesRes.data?.data || busesRes.data || [];
            
            setRoutes(Array.isArray(fetchedRoutes) ? fetchedRoutes : []);
            setBuses(Array.isArray(fetchedBuses) ? fetchedBuses : []);

            fetchSchedules();
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu nền');
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
            // Mock data for display while backend is under construction
            setSchedules([
                { scheduleId: 1, routeId: 1, defaultBusId: 1, departureTime: '08:00', arrivalTime: '14:00', defaultTicketPrice: 200000, isActive: true },
                { scheduleId: 2, routeId: 1, defaultBusId: 2, departureTime: '16:00', arrivalTime: '22:00', defaultTicketPrice: 200000, isActive: true }
            ]);
        }
    };

    const handleGenerateTrips = async (e) => {
        e.preventDefault();
        try {
            setIsGenerating(true);
            await scheduleService.generateTrips({
                fromDate: genDates.fromDate,
                toDate: genDates.toDate
            });

            toast.success(`Đã sinh chuyến tự động từ ${genDates.fromDate} đến ${genDates.toDate} thành công!`);
            setIsGeneratorOpen(false);
        } catch (err) {
            toast.error('Trình tạo chuyến đang được nâng cấp ở Backend!');
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
                defaultBusId: (schedule.defaultBusId || schedule.DefaultBusId || '').toString(),
                departureTime: schedule.departureTime || schedule.DepartureTime || '',
                arrivalTime: schedule.arrivalTime || schedule.ArrivalTime || '',
                defaultTicketPrice: schedule.defaultTicketPrice || schedule.DefaultTicketPrice || '',
                isActive: schedule.isActive !== undefined ? schedule.isActive : true
            });
        } else {
            setIsEditMode(false);
            setSelectedScheduleId(null);
            setFormData({
                routeId: '',
                defaultBusId: '',
                departureTime: '',
                arrivalTime: '',
                defaultTicketPrice: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                routeId: parseInt(formData.routeId),
                defaultBusId: parseInt(formData.defaultBusId),
                defaultTicketPrice: parseFloat(formData.defaultTicketPrice)
            };

            if (isEditMode) {
                await scheduleService.updateSchedule(selectedScheduleId, dataToSubmit);
                toast.success('Cập nhật lịch trình thành công!');
            } else {
                await scheduleService.createSchedule(dataToSubmit);
                toast.success('Thêm lịch trình thành công!');
            }
            setIsModalOpen(false);
            fetchSchedules();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
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
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Điều hành Chuyến</h1>
                    <p className="admin-header-subtitle">Quản lý Lịch trình cố định và Tự động sinh chuyến theo tháng</p>
                </div>
                
                <button 
                    className="admin-btn-success"
                    onClick={() => setIsGeneratorOpen(true)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h-4v4h4v-4z"/></svg>
                    Sinh Chuyến Tự Động
                </button>
            </header>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                <div className="admin-toolbar" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <h2 className="u-size-15 u-m-0 u-color-slate-800">Danh sách Lịch Cố Định</h2>
                    <button 
                        className="admin-btn-add"
                        onClick={() => handleOpenModal()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Thêm Lịch trình
                    </button>
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
                                                {getBusPlate(s.defaultBusId)}
                                            </Badge>
                                        </td>
                                        <td className="u-color-green u-weight-700">{s.departureTime}</td>
                                        <td className="u-color-red u-weight-700">{s.arrivalTime}</td>
                                        <td className="u-weight-600">{s.defaultTicketPrice?.toLocaleString()} đ</td>
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
                title={isEditMode ? 'Cập Nhật Lịch Trình' : 'Thêm Lịch Trình Mới'}
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
                                onChange={(e) => setFormData({...formData, routeId: e.target.value})}
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
                                value={formData.defaultBusId} 
                                onChange={(e) => setFormData({...formData, defaultBusId: e.target.value})}
                            >
                                <option value="">-- Chọn xe --</option>
                                {buses.map(b => (
                                    <option key={b.busId || b.BusId} value={b.busId || b.BusId}>
                                        {b.plateNumber || b.PlateNumber || b.licensePlate} ({b.totalSeats || b.TotalSeats || b.capacity} chỗ)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="u-flex u-gap-16">
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Giờ xuất bến:</label>
                                <input type="time" className="admin-form-input" required value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} />
                            </div>
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Giờ đến (dự kiến):</label>
                                <input type="time" className="admin-form-input" required value={formData.arrivalTime} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Giá vé mặc định (VNĐ):</label>
                            <input type="number" className="admin-form-input" required min="0" value={formData.defaultTicketPrice} onChange={(e) => setFormData({...formData, defaultTicketPrice: e.target.value})} placeholder="VD: 200000" />
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
