import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Card, Modal, Badge, ConfirmationModal } from '../../components/Common';
import Loading from '../../components/Common/Loading';
import '../../assets/styles/admin-common.css';

const LeaveRequestManagement = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Chờ duyệt');
    
    // Modal states
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processAction, setProcessAction] = useState(null); // 'Approve' or 'Reject'
    const [adminComment, setAdminComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterData(activeTab);
    }, [requests, activeTab]);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('Driver/all-leave-requests');
            const data = res.data || [];
            
            // Sort by latest createdDate or id
            const sorted = data.sort((a, b) => (b.id) - (a.id));
            setRequests(sorted);
            
            setStats({
                pending: sorted.filter(r => r.status === 'Pending').length,
                approved: sorted.filter(r => r.status === 'Approved').length,
                rejected: sorted.filter(r => r.status === 'Rejected').length
            });
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Không thể tải danh sách yêu cầu.");
        } finally {
            setIsLoading(false);
        }
    };

    const filterData = (tab) => {
        if (tab === 'Tất cả') {
            setFilteredRequests(requests);
        } else {
            const statusMap = {
                'Chờ duyệt': 'Pending',
                'Đã duyệt': 'Approved',
                'Từ chối': 'Rejected'
            };
            setFilteredRequests(requests.filter(req => req.status === statusMap[tab]));
        }
    };

    const handleOpenProcessModal = (request, action) => {
        setSelectedRequest(request);
        setProcessAction(action);
        setAdminComment('');
        setIsProcessModalOpen(true);
    };

    const handleProcessRequest = async () => {
        if (!selectedRequest) return;
        
        setIsSubmitting(true);
        try {
            const payload = {
                approve: processAction === 'Approve',
                adminComment: adminComment || (processAction === 'Approve' ? 'Đã duyệt.' : 'Không được chấp thuận.')
            };

            await api.post(`Driver/leave-requests/${selectedRequest.id}/process`, payload);
            toast.success(processAction === 'Approve' ? 'Đã duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu.');
            setIsProcessModalOpen(false);
            fetchRequests();
        } catch (error) {
            toast.error('Lỗi khi xử lý yêu cầu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-page-container">
            {/* Header & Stats */}
            <div className="u-flex u-justify-between u-align-center u-m-b-24">
                <div>
                    <h2 className="admin-page-title">Quản Lý Đổi Lịch / Nghỉ Phép</h2>
                    <p className="u-color-slate-500 u-size-14">Duyệt và xem lịch sử yêu cầu của tài xế</p>
                </div>
            </div>

            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang Chờ Duyệt</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.pending}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đã Chấp Thuận</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{stats.approved}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Yêu Cầu</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{requests.length}</div>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
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
                    </div>

                    <div className="table-container u-p-12" style={{ overflowX: 'auto', minHeight: '300px' }}>
                        {isLoading ? (
                            <Loading />
                        ) : filteredRequests.length === 0 ? (
                            <div className="u-text-center u-p-40 u-color-slate-500">Không có yêu cầu nào trong danh sách</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tài Xế</th>
                                        <th>Ngày Xin Nghỉ</th>
                                        <th>Lý Do</th>
                                        <th>Chi Tiết</th>
                                        <th className="u-text-center">Trạng Thái</th>
                                        <th className="u-text-center">Quản Trị</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(req => (
                                        <tr key={req.id}>
                                            <td>
                                                <div className="u-weight-700 u-color-slate-800">{req.driverName || `Tài xế (ID: ${req.driverId})`}</div>
                                                <div className="u-size-11 u-color-slate-500">Mã đơn: #{req.id}</div>
                                            </td>
                                            <td className="u-weight-700 u-color-blue">
                                                {new Date(req.leaveDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="u-weight-500">{req.reason}</td>
                                            <td className="u-color-slate-500 u-size-12">{req.notes || '-'}</td>
                                            <td className="u-text-center">
                                                <Badge type={req.status === 'Pending' ? 'warning' : req.status === 'Approved' ? 'success' : 'danger'}>
                                                    {req.status === 'Pending' ? 'Chờ duyệt' : req.status === 'Approved' ? 'Đã duyệt' : 'Từ chối'}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                {req.status === 'Pending' && (
                                                    <div className="u-flex u-gap-8 u-justify-center">
                                                        <button 
                                                            className="admin-btn-icon" 
                                                            title="Duyệt đơn"
                                                            style={{ color: '#38a169', background: '#38a16915', width: '32px', height: '32px' }}
                                                            onClick={() => handleOpenProcessModal(req, 'Approve')}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </button>
                                                        <button 
                                                            className="admin-btn-icon" 
                                                            title="Từ chối đơn"
                                                            style={{ color: '#e53e3e', background: '#e53e3e15', width: '32px', height: '32px' }}
                                                            onClick={() => handleOpenProcessModal(req, 'Reject')}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status !== 'Pending' && (
                                                    <div className="u-size-11 u-color-slate-500 italic">
                                                        Phản hồi: {req.adminComment || '-'}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </Card>

            {/* Process Modal */}
            <Modal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                title={processAction === 'Approve' ? 'Duyệt Chấp Thuận Yêu Cầu' : 'Từ Chối Yêu Cầu'}
                width="450px"
            >
                <div>
                    <div className="u-m-b-16 u-size-14 u-color-slate-600">
                        Bạn đang muốn {processAction === 'Approve' ? 'chấp thuận' : 'từ chối'} đơn nghỉ của: 
                        <strong className="u-m-l-8 u-color-slate-800">{selectedRequest?.driverName}</strong>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Ghi chú (Tùy chọn):</label>
                        <textarea 
                            className="admin-form-input"
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            placeholder={processAction === 'Approve' ? 'Nhập lời chúc hoặc thông tin thêm...' : 'Lý do từ chối cụ thể...'}
                            rows="4"
                            style={{ resize: 'none' }}
                        ></textarea>
                    </div>

                    <div className="admin-form-actions u-m-t-20">
                        <button className="admin-btn-outline" onClick={() => setIsProcessModalOpen(false)}>Quay lại</button>
                        <button 
                            className="admin-btn-primary" 
                            disabled={isSubmitting}
                            style={{ background: processAction === 'Approve' ? '#38a169' : '#e53e3e' }}
                            onClick={handleProcessRequest}
                        >
                            {isSubmitting ? 'Đang xử lý...' : (processAction === 'Approve' ? 'Xác Nhận Duyệt' : 'Xác Nhận Từ Chối')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LeaveRequestManagement;
