import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/styles/vnpay-mock.css'; // Reusing styles

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
            <div className="vnpay-mock-container">
                <div className="vnpay-card">
                    <div className="loading-spinner"></div>
                    <h2>Đang xử lý kết quả...</h2>
                </div>
            </div>
        );
    }

    const isSuccess = status === 'success';

    return (
        <div className="vnpay-mock-container">
            <div className={`vnpay-card ${isSuccess ? 'success' : 'error'}`}>
                <div className="result-icon">
                    {isSuccess ? '✅' : '❌'}
                </div>
                <h2 className="result-title">
                    {isSuccess ? 'Thanh toán thành công!' : (status === 'cancelled' ? 'Giao dịch bị hủy' : 'Thanh toán thất bại')}
                </h2>
                
                <div className="result-details">
                    <div className="detail-row">
                        <span>Mã đơn PayOS:</span>
                        <strong>{orderCode || '---'}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Trạng thái:</span>
                        <strong className={isSuccess ? 'status-success' : 'status-error'}>
                            {status.toUpperCase()}
                        </strong>
                    </div>
                </div>

                <div className="result-actions">
                    <button className="back-home-btn" onClick={() => navigate('/home')}>
                        Quay lại Trang chủ
                    </button>
                    {isSuccess ? (
                        <button className="view-ticket-btn" onClick={() => navigate('/lookup/ticket')}>
                            Tra cứu vé đã đặt
                        </button>
                    ) : (
                         <button className="view-ticket-btn" onClick={() => navigate('/booking')}>
                             Thử lại
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayOSReturn;
