import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../../services/booking.service';
import { Badge, Loading } from '../../components/Common';

const MidTripDropOffManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getMidTripRequests();
            setRequests(response.data);
        } catch (error) {
            toast.error("Không thể tải danh sách yêu cầu.");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAndSendMail = async (ticketId) => {
        try {
            setProcessingId(ticketId);
            await bookingService.approveMidTripRequest(ticketId);
            toast.success("Đã gửi email xác nhận cho khách hàng!");
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi yêu cầu.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="admin-page-container">
            <div className="admin-card">


                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Chi tiết khách hàng</th>
                                <th>Chuyến xe / Ghế</th>
                                <th>Điểm xuống đề xuất</th>
                                <th>Lý do</th>
                                <th>Thời gian gửi</th>
                                <th>Trạng thái</th>
                                <th className="u-text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.ticketId}>
                                    <td>
                                        <div className="u-weight-700">{req.customerName}</div>
                                        <div className="u-size-12 u-color-slate-500">{req.customerPhone}</div>
                                        <div className="u-size-11 u-color-blue-600">Mã đặt vé: {req.bookingCode}</div>
                                    </td>
                                    <td>
                                        <div className="u-size-14">{req.routeName}</div>
                                        <div className="u-size-12 u-color-slate-600">Xe: {req.busPlate} - Ghế: <b>{req.seatNumber}</b></div>
                                    </td>
                                    <td>
                                        <Badge type="warning" style={{ fontSize: '13px' }}>{req.actualDropOffLocation}</Badge>
                                    </td>
                                    <td>
                                        <div className="u-size-13 u-color-slate-700 italic" style={{ maxWidth: '200px', whiteSpace: 'normal' }}>{req.dropOffReason}</div>
                                    </td>
                                    <td>
                                        <div className="u-size-13">{new Date(req.actualDropOffTime).toLocaleString('vi-VN')}</div>
                                    </td>
                                    <td>
                                        {req.status === 'MidTripEmailSent' ? (
                                            <Badge type="info">Chờ khách xác nhận</Badge>
                                        ) : req.status === 'MidTripRejected' ? (
                                            <div className="u-flex-column u-gap-4">
                                                <Badge type="danger">Khách từ chối</Badge>
                                                {req.passengerNote && (
                                                    <div className="u-size-11 u-color-red-600 u-p-4 u-rounded-4" style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
                                                        Phản hồi: {req.passengerNote}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Badge type="warning">Yêu cầu mới</Badge>
                                        )}
                                    </td>
                                    <td className="u-text-center">
                                        {req.status === 'MidTripEmailSent' ? (
                                            <div 
                                                className="admin-badge" 
                                                style={{ background: '#ecfdf5', color: '#059669', padding: '10px 16px', borderRadius: '12px', fontWeight: '700' }}
                                            >
                                                Đã gửi mail thành công
                                            </div>
                                        ) : (
                                            <button 
                                                className="admin-btn-primary" 
                                                style={{ 
                                                    background: req.status === 'MidTripRejected' ? '#dc2626' : '#10b981', 
                                                    borderColor: req.status === 'MidTripRejected' ? '#dc2626' : '#10b981' 
                                                }}
                                                onClick={() => handleApproveAndSendMail(req.ticketId)}
                                                disabled={processingId === req.ticketId}
                                            >
                                                {processingId === req.ticketId ? 'Đang gửi...' : (req.status === 'MidTripRejected' ? 'Gửi Lại Mail Xác Nhận' : 'Gửi Mail Xác Nhận')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="u-text-center u-p-40">
                                        <div className="u-flex-column u-align-center u-gap-12">
                                            <span style={{ fontSize: '40px' }}>✅</span>
                                            <p className="u-color-slate-500">Không có yêu cầu nào đang chờ xử lý</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default MidTripDropOffManagement;
