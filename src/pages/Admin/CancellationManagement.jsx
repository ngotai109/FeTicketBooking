import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../../services/booking.service';
import { Badge, Card, Modal, Pagination, CustomSelect } from '../../components/Common';
import '../../assets/styles/AdminDashboard.css';

const CancellationManagement = () => {
    const [requests, setRequests] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);
    
    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'history'
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await bookingService.getAllBookings();
            const data = res.data?.data || res.data || [];
            setAllBookings(data);
            // Lọc ra các booking có trạng thái RequestedCancellation (4)
            const cancellationRequests = data.filter(b => b.status === 4);
            setRequests(cancellationRequests.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)));
        } catch (error) {
            toast.error('Lỗi khi tải danh sách yêu cầu hủy vé');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenProcess = async (requestId) => {
        try {
            const res = await bookingService.getBookingById(requestId);
            setSelectedRequest(res.data?.data || res.data);
            setAdminNote('');
            setIsProcessModalOpen(true);
        } catch (error) {
            toast.error('Không thể tải chi tiết yêu cầu');
        }
    };

    const handleProcess = async (approve) => {
        if (!adminNote && !approve) {
            return toast.warning('Vui lòng nhập lý do từ chối để gửi cho khách');
        }

        setProcessing(true);
        try {
            await bookingService.processCancellation(selectedRequest.bookingId, approve, adminNote);
            toast.success(approve ? 'Đã phê duyệt hủy vé thành công' : 'Đã từ chối yêu cầu hủy vé');
            setIsProcessModalOpen(false);
            fetchRequests();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Chọn danh sách hiển thị dựa trên viewMode
    const displayList = viewMode === 'pending' 
        ? requests 
        : allBookings.filter(b => b.status === 2); // Status 2 là Cancelled

    const filteredRequests = displayList.filter(r => 
        r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerPhone?.includes(searchTerm) ||
        r.bookingId?.toString().includes(searchTerm)
    );

    const stats = {
        pending: requests.length,
        processed: allBookings.filter(b => b.status === 2).length // Số vé đã ở trạng thái Hủy
    };

    return (
        <div className="admin-page-container">
            {/* Stats Overview */}
            <div className="u-flex u-gap-16 u-m-b-24">
                <Card 
                    padding="16px" 
                    className="u-flex-1" 
                    style={{ 
                        border: '1px solid #edf2f7', 
                        borderLeft: '4px solid #ed8936',
                        cursor: 'pointer',
                        transform: viewMode === 'pending' ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: viewMode === 'pending' ? '0 4px 12px rgba(237, 137, 54, 0.1)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => { setViewMode('pending'); setCurrentPage(1); }}
                >
                    <div className="u-flex u-justify-between u-align-center">
                        <div>
                            <p className="u-size-11 u-color-slate-500 u-weight-700 u-m-b-4">YÊU CẦU ĐANG CHỜ</p>
                            <h3 className="u-size-24 u-weight-800 u-m-0 u-color-orange-600">{stats.pending}</h3>
                        </div>
                        <div className="u-flex u-align-center u-justify-center u-rounded-12" style={{ width: '40px', height: '40px', background: '#ed893615', color: '#ed8936' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                </Card>

                <Card 
                    padding="16px" 
                    className="u-flex-1" 
                    style={{ 
                        border: '1px solid #edf2f7', 
                        borderLeft: '4px solid #38a169',
                        cursor: 'pointer',
                        transform: viewMode === 'history' ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: viewMode === 'history' ? '0 4px 12px rgba(56, 161, 105, 0.1)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => { setViewMode('history'); setCurrentPage(1); }}
                >
                    <div className="u-flex u-justify-between u-align-center">
                        <div>
                            <p className="u-size-11 u-color-slate-500 u-weight-700 u-m-b-4">TỔNG LỊCH SỬ ĐÃ HỦY</p>
                            <h3 className="u-size-24 u-weight-800 u-m-0 u-color-green-600">{stats.processed}</h3>
                        </div>
                        <div className="u-flex u-align-center u-justify-center u-rounded-12" style={{ width: '40px', height: '40px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="admin-toolbar" style={{ padding: '20px' }}>
                    <div className="search-box" style={{ position: 'relative', width: '350px' }}>
                        <input
                            type="text"
                            placeholder="Tìm theo Mã vé, Tên khách, Số điện thoại..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>

                    <div className="u-m-l-auto u-flex u-gap-12">
                        <button className="admin-btn-excel u-flex u-align-center u-gap-8" onClick={fetchRequests}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                            Làm mới
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã vé</th>
                                <th>Khách hàng</th>
                                <th>Chuyến xe</th>
                                <th className="u-text-center">Số lượng</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th className="u-text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="u-text-center u-p-v-60"><div className="loader u-m-inset-auto"></div></td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="u-text-center u-p-v-80">
                                        <div className="u-flex-column u-align-center">
                                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', marginBottom: '16px' }}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            </div>
                                            <p className="u-color-slate-400 u-weight-600">
                                                {viewMode === 'pending' ? 'Không có yêu cầu nào cần xử lý lúc này' : 'Chưa có lịch sử hủy vé nào'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests
                                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                    .map((item) => (
                                    <tr key={item.bookingId}>
                                        <td className="u-weight-800 u-color-slate-600">
                                            <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px' }}>
                                                #DSL{item.bookingId.toString().padStart(6, '0')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="u-flex u-align-center u-gap-12">
                                                <div className="u-flex u-align-center u-justify-center u-rounded-full u-bg-orange-100 u-color-orange-600 u-weight-700" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                                    {item.customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="u-flex-column">
                                                    <span className="u-weight-700 u-color-slate-800">{item.customerName}</span>
                                                    <span className="u-size-12 u-color-slate-500">{item.customerPhone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="u-flex-column">
                                                <span className="u-size-14 u-weight-600 u-color-slate-700">{item.routeName}</span>
                                                <span className="u-size-12 u-color-slate-500">{item.departureTime}</span>
                                            </div>
                                        </td>
                                        <td className="u-text-center">
                                            <Badge type="info">{item.tickets?.length || 1} ghế</Badge>
                                        </td>
                                        <td className="u-weight-700 u-color-blue-600">{formatPrice(item.totalPrice)}</td>
                                        <td>
                                            {viewMode === 'pending' ? (
                                                <Badge type="warning" animate={true}>Yêu cầu hủy</Badge>
                                            ) : (
                                                <Badge type="danger">Đã hủy</Badge>
                                            )}
                                        </td>
                                        <td className="u-text-center">
                                            <button 
                                                className={viewMode === 'pending' ? "admin-btn-primary" : "admin-btn-outline"}
                                                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '20px' }}
                                                onClick={() => handleOpenProcess(item.bookingId)}
                                            >
                                                {viewMode === 'pending' ? 'Xem & Xử lý' : 'Xem chi tiết'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid #edf2f7' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredRequests.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </Card>

            {/* Modal Xử lý hủy vé */}
            <Modal
                isOpen={isProcessModalOpen}
                onClose={() => !processing && setIsProcessModalOpen(false)}
                title={
                    <div className="u-flex u-align-center u-gap-12">
                        <div className="modal-title-icon u-bg-orange-100 u-color-orange-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <span>Phê duyệt Hủy vé #DSL{selectedRequest?.bookingId.toString().padStart(6, '0')}</span>
                    </div>
                }
                width="650px"
            >
                {selectedRequest && (
                    <div className="cancellation-modal-layout">
                        <div className="admin-info-grid u-m-b-24" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div className="info-item">
                                <label className="admin-form-label u-size-11 u-color-slate-400">KHÁCH HÀNG</label>
                                <div className="u-weight-700 u-size-14">{selectedRequest.customerName}</div>
                                <div className="u-size-12 u-color-slate-500">{selectedRequest.customerPhone}</div>
                            </div>
                            <div className="info-item">
                                <label className="admin-form-label u-size-11 u-color-slate-400">LỘ TRÌNH</label>
                                <div className="u-weight-700 u-size-14">{selectedRequest.routeName}</div>
                                <div className="u-size-12 u-color-slate-500">{selectedRequest.departureTime}</div>
                            </div>
                            <div className="info-item">
                                <label className="admin-form-label u-size-11 u-color-slate-400">DANH SÁCH GHẾ</label>
                                <div className="u-flex u-gap-4 u-m-t-4">
                                    {selectedRequest.tickets?.map(t => (
                                        <Badge key={t.ticketId} type="info">{t.seatNumber}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="info-item">
                                <label className="admin-form-label u-size-11 u-color-slate-400">TỔNG TIỀN HOÀN TRẢ</label>
                                <div className="u-weight-800 u-size-18 u-color-blue-600">{formatPrice(selectedRequest.totalPrice)}</div>
                            </div>
                        </div>

                        <div className="u-m-b-24">
                            <label className="admin-form-label u-weight-700 u-color-slate-600">LÝ DO TỪ NGƯỜI DÙNG:</label>
                            <div className="u-p-16 u-m-t-8" style={{ borderLeft: '4px solid #cbd5e1', background: '#fff', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)', borderRadius: '0 8px 8px 0' }}>
                                <p className="u-m-0 u-weight-500 u-color-slate-700 italic">"{selectedRequest.cancellationReason || "Không để lại lý do cụ thể"}"</p>
                            </div>
                        </div>

                        {(selectedRequest.refundBankName || selectedRequest.refundAccountNumber) && (
                            <div className="u-m-b-24" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                                <label className="admin-form-label u-weight-700 u-color-green-700 u-flex u-align-center u-gap-8">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                    THÔNG TIN CHUYỂN KHOẢN HOÀN TIỀN:
                                </label>
                                <div className="u-m-t-12" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <div className="u-size-11 u-color-green-600 u-weight-700">NGÂN HÀNG</div>
                                        <div className="u-weight-700 u-color-slate-800">{selectedRequest.refundBankName || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="u-size-11 u-color-green-600 u-weight-700">SỐ TÀI KHOẢN</div>
                                        <div className="u-weight-800 u-size-16 u-color-green-700">{selectedRequest.refundAccountNumber || 'N/A'}</div>
                                    </div>
                                    <div className="u-col-span-2 u-m-t-8">
                                        <div className="u-size-11 u-color-green-600 u-weight-700">CHỦ TÀI KHOẢN</div>
                                        <div className="u-weight-700 u-color-slate-800">{selectedRequest.refundAccountName?.toUpperCase() || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="admin-form-group u-m-b-32">
                            <label className="admin-form-label u-weight-700 u-color-slate-600">PHẢN HỒI CỦA HỆ THỐNG:</label>
                            <textarea 
                                className="admin-form-input u-m-t-8" 
                                rows="4"
                                style={{ resize: 'none', padding: '12px' }}
                                placeholder="Ghi chú phản hồi cho khách hàng (ví dụ: 'Đã hoàn tiền vào ví', hoặc lý do từ chối nếu không hợp lệ)..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                            ></textarea>
                            <span className="u-size-11 u-color-slate-400 u-m-t-8 u-block u-text-right italic">* Thông tin này sẽ gửi qua Email cho khách khi duyệt</span>
                        </div>

                        <div className="admin-form-actions u-gap-16">
                            <button 
                                className="admin-btn-outline" 
                                style={{ marginRight: 'auto', borderRadius: '10px' }}
                                onClick={() => setIsProcessModalOpen(false)}
                                disabled={processing}
                            >
                                {selectedRequest.status === 4 ? 'Quay lại' : 'Đóng'}
                            </button>
                            {selectedRequest.status === 4 && (
                                <>
                                    <button 
                                        className="admin-btn-danger" 
                                        style={{ padding: '10px 24px', borderRadius: '10px' }}
                                        onClick={() => handleProcess(false)}
                                        disabled={processing}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="u-m-r-8"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        {processing ? '...' : 'Từ chối hủy'}
                                    </button>
                                    <button 
                                        className="admin-btn-primary" 
                                        style={{ padding: '10px 24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)' }}
                                        onClick={() => handleProcess(true)}
                                        disabled={processing}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="u-m-r-8"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        {processing ? 'Đang duyệt...' : 'Phê duyệt Hủy & Hoàn tiền'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CancellationManagement;
