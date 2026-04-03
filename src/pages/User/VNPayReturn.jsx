import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment.service';
import { toast } from 'react-toastify';
import '../../assets/styles/VNPayMock.css'; // Reuse existing styles or create new

const VNPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const query = location.search;
                const res = await paymentService.executeVNPayCallback(query);
                setResult(res.data);
                
                if (res.data.success && res.data.vnPayResponseCode === "00") {
                    toast.success("Thanh toán vé xe thành công!");
                } else {
                    toast.error("Thanh toán không thành công hoặc đã bị hủy.");
                }
            } catch (error) {
                console.error("Lỗi xử lý kết quả VNPay:", error);
                toast.error("Đã xảy ra lỗi khi xác thực giao dịch.");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [location]);

    if (loading) {
        return (
            <div className="vnpay-mock-container">
                <div className="vnpay-card">
                    <div className="loading-spinner"></div>
                    <h2>Đang xác thực giao dịch...</h2>
                    <p>Vui lòng không đóng trình duyệt.</p>
                </div>
            </div>
        );
    }

    const isSuccess = result?.success && result?.vnPayResponseCode === "00";

    return (
        <div className="vnpay-mock-container">
            <div className={`vnpay-card ${isSuccess ? 'success' : 'error'}`}>
                <div className="result-icon">
                    {isSuccess ? '✅' : '❌'}
                </div>
                <h2 className="result-title">
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h2>
                
                <div className="result-details">
                    <div className="detail-row">
                        <span>Mã đơn hàng:</span>
                        <strong>{result?.orderId || '---'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Mã giao dịch VNPay:</span>
                        <strong>{result?.transactionId || '---'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Nội dung:</span>
                        <strong>{result?.orderDescription || '---'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Trạng thái:</span>
                        <strong className={isSuccess ? 'status-success' : 'status-error'}>
                            {isSuccess ? 'Giao dịch hoàn tất' : `Lỗi: ${result?.vnPayResponseCode}`}
                        </strong>
                    </div>
                </div>

                <div className="result-actions">
                    <button className="back-home-btn" onClick={() => navigate('/home')}>
                        Quay lại Trang chủ
                    </button>
                    {isSuccess && (
                        <button className="view-ticket-btn" onClick={() => navigate('/lookup/ticket')}>
                            Tra cứu vé đã đặt
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VNPayReturn;
