import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import driverService from '../../services/driver.service';
import { Badge, Card, Modal, Pagination, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import './AdminLeaveRequests.css';

const AdminLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // default to pending
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    // Processing Modal State
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [processingReq, setProcessingReq] = useState(null);
    const [processStatus, setProcessStatus] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDriver, filter]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [reqRes, driverRes] = await Promise.all([
                driverService.getAllLeaveRequests(),
                driverService.getAllDrivers()
            ]);
            
            const reqData = handleApiResponse(reqRes);
            setRequests(reqData);
            setDrivers(handleApiResponse(driverRes));
            updateStats(reqData);
        } catch (error) {
            toast.error('Không thể tải dữ liệu yêu cầu nghỉ phép');
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        setStats({
            total: data.length,
            pending: data.filter(r => r.status === 0).length,
            approved: data.filter(r => r.status === 1).length,
            rejected: data.filter(r => r.status === 2).length
        });
    };

    const handleOpenProcessModal = (req, status) => {
        setProcessingReq(req);
        setProcessStatus(status);
        setAdminNote('');
        setIsProcessModalOpen(true);
    };

    const handleConfirmProcess = async (e) => {
        e.preventDefault();
        const status = processStatus;
        const requestId = processingReq.leaveRequestId;
        const actionText = status === 1 ? 'duyệt' : 'từ chối';
        
        try {
            setIsSubmitting(true);
            await driverService.processLeaveRequest(requestId, { status, adminNote: adminNote });
            toast.success(`Đã ${actionText} yêu cầu của tài xế ${processingReq.driverName} thành công`);
            
            setIsProcessModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || `Có lỗi xảy ra khi ${actionText} yêu cầu`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusText = (status) => {
        const s = status?.toString();
        if (s === '0' || s === 'Pending') return 'Chờ duyệt';
        if (s === '1' || s === 'Approved') return 'Đã duyệt';
        if (s === '2' || s === 'Rejected') return 'Từ chối';
        return 'Không xác định';
    };

    const getStatusType = (status) => {
        const s = status?.toString();
        if (s === '0' || s === 'Pending') return 'warning';
        if (s === '1' || s === 'Approved') return 'success';
        if (s === '2' || s === 'Rejected') return 'danger';
        return 'info';
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' || 
            (filter === 'pending' && req.status === 0) ||
            (filter === 'approved' && req.status === 1) ||
            (filter === 'rejected' && req.status === 2);
            
        const matchesSearch = req.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             req.reason?.toLowerCase().includes(searchTerm.toLowerCase());
                             
        const matchesDriver = selectedDriver === 'all' || req.driverId === parseInt(selectedDriver);
        
        return matchesFilter && matchesSearch && matchesDriver;
    });

    return (
        <div className="admin-page-container">
            {/* Stats Overview */}
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng yêu cầu</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.total}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Chờ duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#f6ad5515', color: '#f6ad55' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.pending}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đã duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
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

            {/* Main Table Card */}
            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box" style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                            <input 
                                type="text" 
                                className="admin-search-input" 
                                placeholder="Tìm theo tài xế, lý do..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                        </div>

                        <div className="u-flex u-gap-12 u-m-l-auto">
                            <button 
                                className="admin-btn-icon" 
                                style={{ width: '36px', height: '36px' }} 
                                onClick={fetchInitialData} 
                                title="Tải lại dữ liệu"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                            </button>

                            <select 
                                className="admin-form-select"
                                style={{ width: '200px', height: '36px', padding: '0 12px', fontSize: '13px' }}
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                            >
                                <option value="all">Tất cả tài xế</option>
                                {drivers.map(d => (
                                    <option key={d.driverId} value={d.driverId}>{d.fullName}</option>
                                ))}
                            </select>

                            <div className="admin-tab-group" style={{ margin: 0, padding: '2px' }}>
                                <button className={`admin-tab-btn ${filter === 'pending' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setFilter('pending')}>
                                    Chờ duyệt
                                </button>
                                <button className={`admin-tab-btn ${filter === 'approved' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setFilter('approved')}>
                                    Đã duyệt
                                </button>
                                <button className={`admin-tab-btn ${filter === 'rejected' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setFilter('rejected')}>
                                    Từ chối
                                </button>
                                <button className={`admin-tab-btn ${filter === 'all' ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setFilter('all')}>
                                    Tất cả
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Tài xế</th>
                                    <th>Ngày nghỉ</th>
                                    <th>Loại</th>
                                    <th>Lý do</th>
                                    <th>Phản hồi</th>
                                    <th>Ngày gửi</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: 'right', paddingRight: '24px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && requests.length === 0 ? (
                                    <tr><td colSpan="8"><LoadingSpinner message="Đang tải dữ liệu..." /></td></tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="u-text-center u-p-80">
                                            <div className="empty-state">
                                                <div className="empty-icon">
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                                                </div>
                                                <p className="u-color-slate-400 u-m-t-16">Không có yêu cầu nào trong mục này</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(req => (
                                        <tr key={req.leaveRequestId}>
                                            <td style={{ paddingLeft: '24px' }} className="u-weight-600 u-color-slate-800">{req.driverName}</td>
                                            <td>
                                                <Badge type="info" className="u-size-12 u-weight-600 u-bg-transparent" style={{ border: '1px solid #e2e8f0', color: '#4a5568' }}>
                                                    {new Date(req.leaveDate).toLocaleDateString('vi-VN')}
                                                </Badge>
                                            </td>
                                            <td>{req.type === 1 ? 'Cả ngày' : 'Đổi ca'}</td>
                                            <td className="admin-reason-cell" title={req.reason}>{req.reason}</td>
                                            <td className="admin-feedback-cell">
                                                {req.adminNote ? (
                                                    <div className="u-size-12 u-color-slate-600" title={req.adminNote} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {req.adminNote}
                                                    </div>
                                                ) : (
                                                    <span className="u-size-11 u-color-slate-300">Nỗ lực...</span>
                                                )}
                                            </td>
                                            <td className="u-size-12 u-color-slate-500">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <Badge type={getStatusType(req.status)}>{getStatusText(req.status)}</Badge>
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                                {req.status === 0 && (
                                                    <div className="u-flex u-justify-end u-gap-8">
                                                        <button 
                                                            className="admin-btn-icon" 
                                                            style={{ color: '#38a169', border: '1px solid #c6f6d5' }}
                                                            onClick={() => handleOpenProcessModal(req, 1)}
                                                            title="Phê duyệt"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </button>
                                                        <button 
                                                            className="admin-btn-icon" 
                                                            style={{ color: '#e53e3e', border: '1px solid #fed7d7' }}
                                                            onClick={() => handleOpenProcessModal(req, 2)}
                                                            title="Từ chối"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                )}
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
                    totalItems={filteredRequests.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {/* Process Modal */}
            <Modal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                title={processStatus === 1 ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
                width="450px"
            >
                <form onSubmit={handleConfirmProcess}>
                    <div className="u-flex-column u-gap-16">
                        <div className="u-p-16 u-rounded-12 u-bg-slate-50" style={{ border: '1px solid #e2e8f0' }}>
                            <div className="u-flex u-justify-between u-m-b-8">
                                <span className="u-size-12 u-color-slate-500 u-weight-600">Tài xế:</span>
                                <span className="u-size-13 u-weight-700 u-color-slate-800">{processingReq?.driverName}</span>
                            </div>
                            <div className="u-flex u-justify-between u-m-b-8">
                                <span className="u-size-12 u-color-slate-500 u-weight-600">Ngày nghỉ:</span>
                                <span className="u-size-13 u-weight-700">{new Date(processingReq?.leaveDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="u-flex-column u-gap-4">
                                <span className="u-size-12 u-color-slate-500 u-weight-600">Lý do:</span>
                                <p className="u-size-13 u-color-slate-600 u-m-0" style={{ fontStyle: 'italic' }}>"{processingReq?.reason}"</p>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Ghi chú của Admin (tùy chọn):</label>
                            <textarea 
                                className="admin-form-textarea" 
                                rows="3"
                                placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={() => setIsProcessModalOpen(false)}>Hủy</button>
                        <button 
                            type="submit" 
                            className={processStatus === 1 ? "admin-btn-primary" : "admin-btn-primary"} 
                            style={{ background: processStatus === 1 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang xử lý...' : (processStatus === 1 ? 'Xác nhận Phê duyệt' : 'Xác nhận Từ chối')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminLeaveRequests;
