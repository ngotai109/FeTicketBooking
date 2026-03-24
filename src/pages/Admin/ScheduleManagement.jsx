import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect } from '../../components/Common';
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

            <div className="admin-card">
                <div className="admin-toolbar">
                    <h2 style={{ fontSize: '16px', margin: 0, color: '#2d3748' }}>Danh sách Lịch Cố Định</h2>
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
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</td></tr>
                            ) : schedules.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Chưa có lịch trình (Schedules) nào!</td></tr>
                            ) : (
                                schedules.map(s => (
                                    <tr key={s.scheduleId}>
                                        <td style={{ fontWeight: '600', color: '#3182ce' }}>{getRouteName(s.routeId)}</td>
                                        <td>
                                            <span style={{ background: '#edf2f7', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                                                {getBusPlate(s.defaultBusId)}
                                            </span>
                                        </td>
                                        <td style={{ color: '#38a169', fontWeight: '700' }}>{s.departureTime}</td>
                                        <td style={{ color: '#e53e3e', fontWeight: '700' }}>{s.arrivalTime}</td>
                                        <td style={{ fontWeight: '600' }}>{s.defaultTicketPrice?.toLocaleString()} đ</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal(s)} className="admin-btn-outline">Sửa</button>
                                                <button onClick={() => handleDeleteClick(s)} className="admin-btn-outline" style={{ color: '#e53e3e', borderColor: '#feb2b2' }}>Xóa</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit Schedule */}
            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal-content" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                                {isEditMode ? 'Cập Nhật Lịch Trình' : 'Thêm Lịch Trình Mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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

                                <div style={{ display: 'flex', gap: '16px' }}>
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
                    </div>
                </div>
            )}

            {/* Modal Auto-Generate Trips */}
            {isGeneratorOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsGeneratorOpen(false)}>
                    <div className="admin-modal-content" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', margin: 0 }}>Tự động Sinh Chuyến</h2>
                            <button onClick={() => setIsGeneratorOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#065f46', marginBottom: '24px', background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '1px solid #a7f3d0', lineHeight: 1.5 }}>
                            💡 Hệ thống sẽ tự động sao chép các <b>Lịch Cố Định</b> và tạo ra hàng loạt <b>Chuyến Thực Tế</b> kèm theo sơ đồ ghế cho những ngày được chọn.
                        </div>

                        <form onSubmit={handleGenerateTrips}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Từ Ngày:</label>
                                <input type="date" className="admin-form-input" required value={genDates.fromDate} onChange={(e) => setGenDates({...genDates, fromDate: e.target.value})} />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Đến Ngày:</label>
                                <input type="date" className="admin-form-input" required value={genDates.toDate} onChange={(e) => setGenDates({...genDates, toDate: e.target.value})} />
                            </div>

                            <div className="admin-form-actions">
                                <button type="button" className="admin-btn-outline" onClick={() => setIsGeneratorOpen(false)}>Hủy</button>
                                <button type="submit" className="admin-btn-success" disabled={isGenerating}>
                                    {isGenerating ? 'Đang xử lý...' : 'Bắt đầu Sinh chuyến'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

