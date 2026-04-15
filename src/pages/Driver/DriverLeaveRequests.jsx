import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import driverService from '../../services/driver.service';
import { Card, Modal, Badge, LoadingSpinner } from '../../components/Common';
import './DriverLeaveRequests.css';

const DriverLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leaveType, setLeaveType] = useState('1');
    const [leaveDate, setLeaveDate] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [allTrips, setAllTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await driverService.getMySchedule();
            // Handle case where response already contains .data or use helper
            const data = response.data?.success ? response.data.data : (Array.isArray(response.data) ? response.data : []);
            setAllTrips(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await driverService.getMyLeaveRequests();
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            toast.error('Không thể tải danh sách yêu cầu nghỉ phép');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!leaveDate || !leaveReason.trim()) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                leaveDate: leaveDate,
                type: parseInt(leaveType),
                reason: leaveReason
            };
            
            if (leaveType === '2' && selectedTripId) {
                payload.tripId = parseInt(selectedTripId);
            }

            await driverService.submitLeaveRequest(payload);
            toast.success('Gửi yêu cầu thành công');
            setIsModalOpen(false);
            resetForm();
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setLeaveType('1');
        setLeaveDate('');
        setLeaveReason('');
        setSelectedTripId('');
    };

    const getStatusType = (status) => {
        const s = status?.toString();
        if (s === '0' || s === 'Pending') return 'warning';
        if (s === '1' || s === 'Approved') return 'success';
        if (s === '2' || s === 'Rejected') return 'danger';
        return 'info';
    };

    const getStatusText = (status) => {
        const s = status?.toString();
        if (s === '0' || s === 'Pending') return 'Chờ duyệt';
        if (s === '1' || s === 'Approved') return 'Đã duyệt';
        if (s === '2' || s === 'Rejected') return 'Từ chối';
        return 'Không xác định';
    };

    const stats = {
        pending: requests.filter(r => r.status == 0 || r.status === 'Pending').length,
        approved: requests.filter(r => r.status == 1 || r.status === 'Approved').length,
        rejected: requests.filter(r => r.status == 2 || r.status === 'Rejected').length
    };

    const filteredRequests = requests.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'pending') return r.status == 0 || r.status === 'Pending';
        if (filter === 'approved') return r.status == 1 || r.status === 'Approved';
        if (filter === 'rejected') return r.status == 2 || r.status === 'Rejected';
        return true;
    });

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div className="admin-header-title">
                    <h1>Yêu cầu nghỉ phép / đổi lịch</h1>
                    <div className="admin-header-subtitle">
                        Quản lý và theo dõi các yêu cầu nghỉ phép của bạn
                    </div>
                </div>
                <div className="admin-header-actions">
                    <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tạo yêu cầu mới
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="u-flex u-gap-16 u-m-b-24">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Chờ duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#f6ad5515', color: '#f6ad55' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.pending}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đã duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.approved}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Từ chối</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.rejected}</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="admin-toolbar" style={{ borderBottom: '1px solid #edf2f7', borderRadius: '16px 16px 0 0' }}>
                    <div className="leave-tabs-container">
                        <button className={`tab-btn-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
                        <button className={`tab-btn-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Chờ duyệt</button>
                        <button className={`tab-btn-pill ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Đã duyệt</button>
                        <button className={`tab-btn-pill ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Từ chối</button>
                    </div>

                    <div className="u-m-l-auto">
                        <button 
                            className="admin-btn-icon" 
                            style={{ width: '36px', height: '36px' }} 
                            onClick={fetchRequests} 
                            title="Tải lại dữ liệu"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        </button>
                    </div>
                </div>

                <div className="admin-table-wrapper" style={{ boxShadow: 'none' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Ngày nghỉ</th>
                                <th>Loại</th>
                                <th>Lý do</th>
                                <th>Phản hồi</th>
                                <th>Ngày gửi</th>
                                <th style={{ paddingRight: '24px' }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                    <td colSpan="6">
                                        <LoadingSpinner message="Đang tải dữ liệu..." />
                                    </td>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="u-text-center u-p-40 u-color-slate-400">Không tìm thấy yêu cầu nào</td>
                                </tr>
                            ) : (
                                filteredRequests.map(req => (
                                    <tr key={req.leaveRequestId}>
                                        <td data-label="Ngày nghỉ" style={{ paddingLeft: '24px' }}>
                                            <div className="u-weight-700 u-color-slate-800">{new Date(req.leaveDate).toLocaleDateString('vi-VN')}</div>
                                        </td>
                                        <td data-label="Loại">
                                            <span className="u-size-13 u-weight-600">{req.type === 1 ? 'Cả ngày' : 'Đổi ca'}</span>
                                        </td>
                                        <td data-label="Lý do" className="reason-cell">
                                            <div className="u-size-13 u-color-slate-600 u-weight-500">{req.reason}</div>
                                        </td>
                                        <td data-label="Phản hồi" className="feedback-cell">
                                            {req.adminNote ? (
                                                <div className="admin-feedback-text">
                                                    {req.adminNote}
                                                </div>
                                            ) : (
                                                <span className="u-color-slate-300 u-size-12">Chưa có phản hồi</span>
                                            )}
                                        </td>
                                        <td data-label="Ngày gửi" className="u-size-12 u-color-slate-500">{new Date(req.createdAt).toLocaleString('vi-VN')}</td>
                                        <td data-label="Trạng thái" style={{ paddingRight: '24px' }}>
                                            <Badge type={getStatusType(req.status)}>
                                                {getStatusText(req.status)}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    <div className="u-flex u-align-center u-gap-12">
                        <div className="modal-premium-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </div>
                        <div className="u-flex-column">
                            <span className="premium-modal-title">Đăng ký nghỉ phép</span>
                            <span className="premium-modal-subtitle">Gửi yêu cầu tới Ban điều hành</span>
                        </div>
                    </div>
                }
                width="95%"
                maxWidth="440px"
                padding="0"
            >
                <form onSubmit={handleSubmit}>
                    <div className="driver-modal-body u-p-24">
                        <div className="leave-ui-container">
                            <div className="leave-ui-alert u-m-b-24">
                                <div className="alert-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                </div>
                                <p>Yêu cầu của bạn sẽ được Ban điều hành phê duyệt. Lịch trình nghỉ sẽ hiển thị màu đỏ khi được chấp thuận.</p>
                            </div>

                            <div className="leave-ui-form">
                                <div className="ui-input-wrapper u-m-b-20">
                                    <label className="ui-label">Loại yêu cầu</label>
                                    <div className="ui-select-container">
                                        <div className="ui-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                                        </div>
                                        <select 
                                            className="ui-select"
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                        >
                                            <option value="1">Xin nghỉ cả ngày</option>
                                            <option value="2">Xin nghỉ / đổi ca một chuyến cụ thể</option>
                                        </select>
                                        <div className="ui-arrow">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="ui-input-wrapper u-m-b-20">
                                    <label className="ui-label">Ngày nghỉ dự kiến</label>
                                    <div className="ui-input-container">
                                        <div className="ui-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        </div>
                                        <input 
                                            type="date" 
                                            className="ui-input"
                                            value={leaveDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => {
                                                setLeaveDate(e.target.value);
                                                setSelectedTripId(''); // Reset trip when date changes
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                {leaveType === '2' && leaveDate && (
                                    <div className="ui-input-wrapper u-m-b-20 animate-fade-in">
                                        <label className="ui-label">Chọn chuyến xe cần đổi / nghỉ</label>
                                        <div className="ui-select-container">
                                            <div className="ui-icon">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                            </div>
                                            <select 
                                                className="ui-select"
                                                value={selectedTripId}
                                                onChange={(e) => setSelectedTripId(e.target.value)}
                                                required={leaveType === '2'}
                                            >
                                                <option value="">-- Chọn chuyến xe --</option>
                                                {allTrips
                                                    .filter(t => new Date(t.departureTime).toISOString().split('T')[0] === leaveDate)
                                                    .map(t => (
                                                        <option key={t.tripId} value={t.tripId}>
                                                            {new Date(t.departureTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {t.routeName}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            <div className="ui-arrow">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </div>
                                        </div>
                                        {allTrips.filter(t => new Date(t.departureTime).toISOString().split('T')[0] === leaveDate).length === 0 && (
                                            <p className="u-size-11 u-color-red u-m-t-4">Không có chuyến xe nào trong ngày này của bạn.</p>
                                        )}
                                    </div>
                                )}

                                <div className="ui-input-wrapper">
                                    <label className="ui-label">Lý do chi tiết</label>
                                    <textarea 
                                        className="ui-textarea"
                                        placeholder="Vui lòng nhập lý do cụ thể..."
                                        value={leaveReason}
                                        onChange={(e) => setLeaveReason(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="driver-modal-footer u-p-16 u-p-x-24 u-flex u-justify-end u-gap-12">
                        <button 
                            type="button"
                            className="ui-btn-ghost" 
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit"
                            className="ui-btn-primary" 
                            disabled={isSubmitting || !leaveDate || !leaveReason.trim() || (leaveType === '2' && !selectedTripId)}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DriverLeaveRequests;
