import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import scheduleService from '../../services/schedule.service';
import routeService from '../../services/route.service';
import busService from '../../services/bus.service';

const ScheduleManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Auto-gen states
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [genDates, setGenDates] = useState({ fromDate: '', toDate: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal states for CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
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
            // Fetch routes & buses for dropdowns
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
            setSchedules(Array.isArray(fetched) ? fetched : []);
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
            
            // Format for C#: 2026-04-01
            await scheduleService.generateTrips({
                fromDate: genDates.fromDate,
                toDate: genDates.toDate
            });

            toast.success(`Đã sinh chuyến tự động từ ${genDates.fromDate} đến ${genDates.toDate} thành công!`);
            setIsGeneratorOpen(false);
        } catch (err) {
            toast.error('Trình tạo chuyến đang được nâng cấp ở Backend C#! (Chức năng này cần endpoint /Schedule/GenerateTrips)');
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
                routeId: schedule.routeId || schedule.RouteId || '',
                defaultBusId: schedule.defaultBusId || schedule.DefaultBusId || '',
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
            fetchSchedules(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) {
            try {
                await scheduleService.deleteSchedule(id);
                toast.success('Xóa lịch trình thành công!');
                fetchSchedules();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Có lỗi khi xóa lịch trình');
            }
        }
    };

    const getRouteName = (routeId) => {
        // Find in mock or real routes
        const r = routes.find(r => (r.routeId || r.RouteId) === routeId);
        return r ? r.routeName || r.RouteName : `Tuyến #${routeId}`;
    };

    const getBusPlate = (busId) => {
        const b = buses.find(b => (b.busId || b.BusId) === busId);
        return b ? b.plateNumber || b.PlateNumber || b.licensePlate : `Xe #${busId}`;
    };

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Điều hành Chuyến (Trips Generator)</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Quản lý Lịch trình cứng và Tự động sinh chuyến theo tháng</p>
                </div>
                
                <button 
                    onClick={() => setIsGeneratorOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px',
                        fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)', fontSize: '13px'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h-4v4h4v-4z"/></svg>
                    Auto-Generate Trips (Sinh Chuyến)
                </button>
            </header>

            <div className="content-card" style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '15px', color: '#2d3748' }}>Danh sách Lịch Cố Định (Schedules)</h2>
                    <button onClick={() => handleOpenModal()} style={{ background: '#ebf8ff', color: '#3182ce', border: '1px solid #bee3f8', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        + Thêm Lịch (Khung Giờ)
                    </button>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f7fafc', background: '#f8fafc' }}>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tuyến đường</th>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Xe Mặc định</th>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Giờ Xuất Bến</th>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Giờ Đến</th>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Vé Mặc định</th>
                                <th style={{ padding: '10px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', fontSize: '12px' }}>Đang tải...</td></tr>
                            ) : (
                                schedules.map(s => (
                                    <tr key={s.scheduleId} style={{ borderBottom: '1px solid #edf2f7', fontSize: '13px' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#2b6cb0' }}>{getRouteName(s.routeId)}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: '600' }}>
                                            <span style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>{getBusPlate(s.defaultBusId)}</span>
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#38a169', fontWeight: '700' }}>{s.departureTime}</td>
                                        <td style={{ padding: '10px 12px', color: '#e53e3e', fontWeight: '700' }}>{s.arrivalTime}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: '600' }}>{s.defaultTicketPrice?.toLocaleString()} đ</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                            <button onClick={() => handleOpenModal(s)} style={{ color: '#4a5568', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', marginRight: '5px' }}>Sửa</button>
                                            <button onClick={() => handleDelete(s.scheduleId || s.ScheduleId)} style={{ color: '#e53e3e', background: 'white', border: '1px solid #fc8181', cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {schedules.length === 0 && !loading && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', fontSize: '12px' }}>Chưa có lịch trình (Schedules) nào!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit Schedule */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2b6cb0' }}>
                                {isEditMode ? 'Cập Nhật Lịch Trình' : 'Thêm Lịch Trình Mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Tuyến đường:</label>
                                <select required value={formData.routeId} onChange={(e) => setFormData({...formData, routeId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                                    <option value="">-- Chọn tuyến đường --</option>
                                    {routes.map(r => (
                                        <option key={r.routeId || r.RouteId} value={r.routeId || r.RouteId}>
                                            {r.routeName || r.RouteName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Xe mặc định:</label>
                                <select required value={formData.defaultBusId} onChange={(e) => setFormData({...formData, defaultBusId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                                    <option value="">-- Chọn xe --</option>
                                    {buses.map(b => (
                                        <option key={b.busId || b.BusId} value={b.busId || b.BusId}>
                                            {b.plateNumber || b.PlateNumber || b.licensePlate} ({b.totalSeats || b.TotalSeats || b.capacity} chỗ - {b.busType || b.BusType})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Giờ xuất bến:</label>
                                    <input type="time" required value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Giờ đến (dự kiến):</label>
                                    <input type="time" required value={formData.arrivalTime} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Giá vé mặc định (VNĐ):</label>
                                <input type="number" required min="0" value={formData.defaultTicketPrice} onChange={(e) => setFormData({...formData, defaultTicketPrice: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="VD: 200000" />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', background: '#3182ce', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                    {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Auto-Generate Trips */}
            {isGeneratorOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '450px' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>Tự động Sinh Chuyến</h2>
                            <button onClick={() => setIsGeneratorOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '20px', background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                            💡 Hệ thống sẽ tự động sao chép các <b>Lịch Cố Định (Schedules)</b> ở dưới nền và tạo ra hàng trăm <b>Chuyến Thực Tế (Trips)</b> kèm theo Ghế rỗng tương ứng cho những ngày được chọn.
                        </div>

                        <form onSubmit={handleGenerateTrips}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Từ Ngày:</label>
                                <input type="date" required value={genDates.fromDate} onChange={(e) => setGenDates({...genDates, fromDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Đến Ngày:</label>
                                <input type="date" required value={genDates.toDate} onChange={(e) => setGenDates({...genDates, toDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsGeneratorOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'white', border: '1px solid #e2e8f0', fontWeight: '600' }}>Hủy</button>
                                <button type="submit" disabled={isGenerating} style={{ padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: '600', opacity: isGenerating ? 0.7 : 1 }}>
                                    {isGenerating ? 'Đang tạo dữ liệu...' : 'Bắt đầu Sinh chuyến'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManagement;
