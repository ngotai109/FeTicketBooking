import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Card, Modal, Badge } from '../../components/Common';
import Loading from '../../components/Common/Loading';
import '../../assets/styles/admin-common.css';

const DriverLeaveRequest = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [driverInfo, setDriverInfo] = useState(null); 
    // Filter/Trip States
    const [myAllTrips, setMyAllTrips] = useState([]);
    const [tripsForDate, setTripsForDate] = useState([]);

    const [formData, setFormData] = useState({
        requestType: 'FullDay', // 'FullDay' or 'ByTrip'
        leaveDate: '',
        selectedTripId: '',
        reason: '',
        notes: ''
    });

    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        filterData(activeTab);
    }, [leaveRequests, activeTab]);

    // Fetch trips for selected date when date or request type changes
    useEffect(() => {
        if (formData.requestType === 'ByTrip' && formData.leaveDate && myAllTrips.length > 0) {
            const filtered = myAllTrips.filter(t => {
                const tripDate = new Date(t.departureTime).toISOString().split('T')[0];
                return tripDate === formData.leaveDate;
            });
            setTripsForDate(filtered);
            if (filtered.length === 0) {
                setFormData(prev => ({ ...prev, selectedTripId: '' }));
            }
        } else {
            setTripsForDate([]);
        }
    }, [formData.leaveDate, formData.requestType, myAllTrips]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const resDrivers = await api.get('Driver', { skipLoading: true });
            const allDrivers = resDrivers.data?.data || resDrivers.data || [];
            const userEmail = localStorage.getItem('userEmail');
            const myInfo = allDrivers.find(d => d.email === userEmail);
            
            if (myInfo) {
                setDriverInfo(myInfo);
                const [resReqs, resSchedule] = await Promise.all([
                    api.get('Driver/leave-requests', { skipLoading: true }),
                    api.get('Driver/my-schedule', { skipLoading: true })
                ]);

                const myRequests = resReqs.data || [];
                
                const sorted = myRequests.sort((a, b) => new Date(b.createdAt || b.leaveRequestId) - new Date(a.createdAt || a.leaveRequestId));
                setLeaveRequests(sorted);
                setMyAllTrips(resSchedule.data || []);
                
                setStats({
                    pending: myRequests.filter(r => r.status === 'Pending').length,
                    approved: myRequests.filter(r => r.status === 'Approved').length,
                    rejected: myRequests.filter(r => r.status === 'Rejected').length
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterData = (tab) => {
        if (tab === 'Tất cả') {
            setFilteredRequests(leaveRequests);
        } else {
            const statusMap = {
                'Chờ duyệt': 'Pending',
                'Đã duyệt': 'Approved',
                'Từ chối': 'Rejected'
            };
            setFilteredRequests(leaveRequests.filter(req => req.status === statusMap[tab]));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.requestType === 'ByTrip' && !formData.selectedTripId) {
            toast.warning("Vui lòng chọn chuyến xe muốn nghỉ");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                leaveDate: formData.leaveDate,
                type: formData.requestType === 'ByTrip' ? 1 : 0, // 0: FullDay, 1: ByTrip (Assuming enums match)
                reason: formData.reason,
                tripId: formData.selectedTripId || null
            };

            await api.post('Driver/leave-requests', payload);
            toast.success('Gửi yêu cầu thành công!');
            setShowModal(false);
            setFormData({ requestType: 'FullDay', leaveDate: '', selectedTripId: '', reason: '', notes: '' });
            fetchInitialData();
        } catch (error) {
            toast.error('Lỗi khi gửi yêu cầu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-page-container">
            {/* Stats Section - Standard Admin Header View */}
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang Chờ Duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.pending}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đã Chấp Thuận</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.approved}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Yêu Cầu Từ Chối</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.rejected}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Lịch Nghỉ</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{leaveRequests.length}</div>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    {/* Toolbar inside card */}
                    <div className="admin-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7' }}>
                        <div className="u-flex u-gap-8 u-bg-slate-50 u-p-2 u-rounded-10">
                            {['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'].map(tab => (
                                <button 
                                    key={tab}
                                    className={`u-p-x-20 u-p-y-8 u-rounded-8 u-weight-700 u-size-13 u-cursor-pointer ${activeTab === tab ? 'u-bg-white u-color-blue u-shadow-sm' : 'u-color-slate-500'}`}
                                    style={{ 
                                        border: activeTab === tab ? '1px solid #e2e8f0' : 'none',
                                        backgroundColor: activeTab === tab ? '#1a3a8f' : 'transparent',
                                        color: activeTab === tab ? '#ffffff' : '#4a5568',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="u-flex u-m-l-auto">
                            <button 
                                className="admin-btn-add"
                                style={{ background: '#1a3a8f', padding: '10px 20px' }}
                                onClick={() => setShowModal(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Tạo Yêu Cầu Mới
                            </button>
                        </div>
                    </div>

                    <div className="table-container u-p-12" style={{ overflowX: 'auto', minHeight: '200px', position: 'relative' }}>
                        {isLoading ? (
                            <Loading />
                        ) : filteredRequests.length === 0 ? (
                             <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Ngày Gửi</th>
                                        <th>Ngày Mong Muốn</th>
                                        <th>Lý Do Xin Nghỉ</th>
                                        <th>Phản Hội Từ Admin</th>
                                        <th className="u-text-center">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colSpan="5" className="u-text-center u-p-40 u-color-slate-500">Chưa có yêu cầu nào trong danh sách</td></tr>
                                </tbody>
                            </table>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Ngày Gửi</th>
                                        <th>Ngày Mong Muốn</th>
                                        <th>Lý Do Xin Nghỉ</th>
                                        <th>Phản Hội Từ Admin</th>
                                        <th className="u-text-center">Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(req => (
                                        <tr key={req.leaveRequestId}>
                                            <td className="u-color-slate-500">{new Date(req.createdAt || req.leaveRequestId).toLocaleDateString('vi-VN')}</td>
                                            <td className="u-weight-700 u-color-blue">
                                                {new Date(req.leaveDate).toLocaleDateString('vi-VN')}
                                                {req.tripInfo && <div className="u-size-11 u-color-slate-400">{req.tripInfo}</div>}
                                            </td>
                                            <td className="u-weight-500">{req.reason}</td>
                                            <td className="u-color-slate-500 u-size-12 italic">{req.adminNote || '-'}</td>
                                            <td className="u-text-center">
                                                <Badge type={req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'}>
                                                    {req.status === 'Pending' ? 'Chờ duyệt' : req.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Tạo Yêu Cầu Đổi Lịch"
                width="500px"
            >
                <form onSubmit={handleSubmit}>
                    <div className="u-flex-column u-gap-20">
                        {/* 1. Request Type */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Loại yêu cầu:</label>
                            <select 
                                className="admin-form-select"
                                name="requestType"
                                value={formData.requestType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="FullDay">Nghỉ cả ngày</option>
                                <option value="ByTrip">Nghỉ theo chuyến</option>
                            </select>
                        </div>

                        {/* 2. Selection Date */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Ngày muốn nghỉ / Đổi lịch:</label>
                            <input 
                                type="date" 
                                className="admin-form-input"
                                name="leaveDate"
                                value={formData.leaveDate}
                                onChange={handleInputChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* 3. Conditional Trip List */}
                        {formData.requestType === 'ByTrip' && formData.leaveDate && (
                            <div className="admin-form-group">
                                <label className="admin-form-label">Chọn chuyến xe ({formData.leaveDate}):</label>
                                {tripsForDate.length > 0 ? (
                                    <select 
                                        className="admin-form-select"
                                        name="selectedTripId"
                                        value={formData.selectedTripId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">-- Chọn chuyến xe bạn muốn nghỉ --</option>
                                        {tripsForDate.map(t => (
                                            <option key={t.tripId} value={t.tripId}>
                                                [{new Date(t.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}] {t.routeName}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="u-p-12 u-bg-red-50 u-rounded-8 u-size-13 u-color-red" style={{ border: '1px solid #feb2b2' }}>
                                        Bạn không có lịch trình nào vào ngày này.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 4. Reason (Manual Input - Textarea) */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Lý do xin nghỉ:</label>
                            <textarea 
                                className="admin-form-input"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Vui lòng nhập lý do cụ thể..."
                                rows="4"
                                style={{ resize: 'none' }}
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                        <button type="submit" className="admin-btn-primary" disabled={isSubmitting} style={{ background: '#1a3a8f' }}>
                            {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Gửi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DriverLeaveRequest;
