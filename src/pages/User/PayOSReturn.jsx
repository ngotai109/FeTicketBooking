import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../../services/booking.service';
import '../../assets/styles/PayOSReturn.css';

const PayOSReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');
    const [orderCode, setOrderCode] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const statusParam = queryParams.get('status');
        const orderCodeParam = queryParams.get('orderCode');
        
        setOrderCode(orderCodeParam);

        if (statusParam === 'PAID') {
            setStatus('success');
            toast.success("Thanh toán PayOS thành công!");
            
            // Tự động gọi API check để cập nhật status booking ngay lập tức
            if (orderCodeParam) {
                // BookingId nằm ở 4 chữ số cuối của orderCode
                const bookingIdStr = orderCodeParam.slice(-4);
                const bId = parseInt(bookingIdStr);
                bookingService.checkPayOSStatus(bId, orderCodeParam)
                    .then(() => console.log("Payment status verified successfully"))
                    .catch(err => console.error("Failed to verify payment status:", err));
            }
        } else if (statusParam === 'CANCELLED') {
            setStatus('cancelled');
            toast.warn("Giao dịch đã bị hủy.");
        } else {
            setStatus('error');
            toast.error("Thanh toán thất bại hoặc có lỗi xảy ra.");
        }
    }, [location]);

    if (status === 'loading') {
        return (
            <div className="payos-return-container">
                <div className="payos-result-card loading-card">
                    <div className="premium-spinner"></div>
                    <h2 className="result-main-title">Đang xác nhận...</h2>
                    <p className="result-sub-text">Hệ thống đang kiểm tra giao dịch của bạn.</p>
                </div>
            </div>
        );
    }

    const isSuccess = status === 'success';
    const isCancelled = status === 'cancelled';

    return (
        <div className="payos-return-container">
            <div className="payos-result-card">
                <div className="result-body">
                    <div className="status-icon-container">
                        {isSuccess && <div className="success-bg-glow"></div>}
                        {isSuccess ? (
                            <div className="success-icon-wrapper">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        ) : isCancelled ? (
                            <div className="cancelled-icon-wrapper">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            </div>
                        ) : (
                            <div className="error-icon-wrapper">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                        )}
                    </div>

                    <h2 className="result-main-title">
                        {isSuccess ? 'Thanh toán thành công!' : isCancelled ? 'Giao dịch đã hủy' : 'Thanh toán thất bại'}
                    </h2>
                    <p className="result-sub-text">
                        {isSuccess 
                            ? 'Cảm ơn bạn đã tin tưởng dịch vụ của Đồng Hương Sông Lam.' 
                            : 'Giao dịch không thành công. Vui lòng kiểm tra lại phương thức thanh toán.'}
                    </p>
                    
                    <div className="receipt-container">
                        <div className="receipt-row">
                            <span className="receipt-label">Mã đơn hàng</span>
                            <span className="receipt-value">#{orderCode || 'N/A'}</span>
                        </div>
                        <div className="receipt-row">
                            <span className="receipt-label">Phương thức</span>
                            <span className="receipt-value">PayOS (QR Code)</span>
                        </div>
                        <div className="receipt-row">
                            <span className="receipt-label">Trạng thái</span>
                            <span className={`receipt-value status ${status}`}>
                                {isSuccess ? 'HOÀN TẤT' : isCancelled ? 'ĐÃ HỦY' : 'THẤT BẠI'}
                            </span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        {isSuccess ? (
                            <button className="btn-primary-payos" onClick={() => navigate('/lookup/ticket')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                Xem thông tin vé
                            </button>
                        ) : (
                            <button className="btn-primary-payos" onClick={() => navigate('/booking')}>
                                Thử lại ngay
                            </button>
                        )}
                        <button className="btn-secondary-payos" onClick={() => navigate('/home')}>
                            Về trang chủ
                        </button>
                    </div>

                    <p className="footer-copy">
                        © 2026 Nhà xe Đồng Hương Sông Lam
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PayOSReturn;
