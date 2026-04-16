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
                <div className="admin-card-header u-flex u-justify-between u-align-center">
                    <div>
                        <h2 className="u-m-0">Quản lý Xuống xe dọc đường</h2>
                        <p className="u-color-slate-500 u-size-14">Phê duyệt và gửi email xác nhận cho hành khách</p>
                    </div>
                    <button className="admin-btn-outline" onClick={fetchRequests}>
                        Làm mới
                    </button>
                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Chi tiết khách hàng</th>
                                <th>Chuyến xe / Ghế</th>
                                <th>Điểm xuống đề xuất</th>
                                <th>Thời gian gửi</th>
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
                                        <div className="u-size-13">{new Date(req.actualDropOffTime).toLocaleString('vi-VN')}</div>
                                    </td>
                                    <td className="u-text-center">
                                        <button 
                                            className="admin-btn-primary" 
                                            style={{ background: '#10b981', borderColor: '#10b981' }}
                                            onClick={() => handleApproveAndSendMail(req.ticketId)}
                                            disabled={processingId === req.ticketId}
                                        >
                                            {processingId === req.ticketId ? 'Đang gửi...' : 'Gửi Mail Xác Nhận'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="u-text-center u-p-40">
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

            <div className="admin-info-box u-m-t-24" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#0369a1', marginTop: 0 }}>Quy trình xử lý:</h4>
                <ol style={{ color: '#075985', fontSize: '14px', lineHeight: '1.8' }}>
                    <li>Tài xế gửi yêu cầu khi có khách muốn xuống xe tại điểm không cố định.</li>
                    <li>Admin kiểm tra và nhấn <b>"Gửi Mail Xác Nhận"</b> để gửi email cho khách.</li>
                    <li>Khách hàng nhận email và nhấn vào link để xác nhận mình đã xuống xe an toàn.</li>
                    <li>Chỉ sau khi khách xác nhận, trạng thái vé mới được chuyển thành <b>"HOÀN THÀNH"</b>.</li>
                </ol>
            </div>
        </div>
    );
};

export default MidTripDropOffManagement;
