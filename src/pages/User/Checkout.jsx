import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/styles/Checkout.css';
import { Card } from '../../components/Common';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Safety check if user didn't come from Booking
    const trip = location.state?.trip || { 
        departurePoint: 'BX Khách Nghệ An', arrivalPoint: 'BX Khách Hà Nội',
        departureTime: '12:30', arrivalTime: '18:30', price: 490000 
    };
    const selectedSeats = location.state?.selectedSeats || ['B1'];
    
    const [customer, setCustomer] = useState({ phone: '0832696061', name: 'Ngô Khắc Tài', email: 'taitiktok37@gmail.com' });
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'vnpay'

    useEffect(() => {
        if (!location.state) {
            toast.error("Vui lòng chọn chuyến và ghế trước!");
            navigate('/booking');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.warning("Hết thời gian giao dịch. Vui lòng đặt lại!");
                    navigate('/booking');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [location, navigate]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCheckout = () => {
        if (paymentMethod === 'vnpay') {
            const amount = selectedSeats.length * trip.price;
            toast.info("Đang chuyển hướng sang Cổng thanh toán VNPay...");
            setTimeout(() => navigate('/payment/vnpay', { state: { amount } }), 1500);
        } else {
            toast.success("Đặt vé thành công! Vui lòng thanh toán theo hướng dẫn.");
            setTimeout(() => navigate('/lookup/ticket'), 2000);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                
                {/* Header */}
                <div className="checkout-header">
                    <div className="checkout-header-logo">
                        <div className="checkout-logo-icon">🎫</div>
                        <h2 className="checkout-title">Xác nhận mua vé</h2>
                    </div>
                    <div className="checkout-timer">
                        Thời gian giao dịch còn lại <span className="checkout-timer-value">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="checkout-main">
                    
                    {/* LEFT COLUMN */}
                    <div className="checkout-left-col">
                        
                        {/* Thông tin khách hàng */}
                        <Card padding="30px">
                            <h3 className="checkout-section-title">Thông tin khách hàng</h3>
                            
                            <div className="checkout-customer-form">
                                <div className="checkout-form-field">
                                    <div className="checkout-field-label">Số điện thoại</div>
                                    <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="checkout-field-input" />
                                </div>
                                <div className="checkout-form-field">
                                    <div className="checkout-field-label">Họ tên</div>
                                    <input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="checkout-field-input" />
                                </div>
                                <div className="checkout-form-field">
                                    <div className="checkout-field-label">Email</div>
                                    <input value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="checkout-field-input" />
                                </div>
                            </div>
                        </Card>

                        {/* Phương thức thanh toán */}
                        <div>
                            <h3 className="checkout-section-title">Phương thức thanh toán</h3>
                            
                            <div className="payment-method-list">
                                {/* Tùy chọn 1: Tiền mặt */}
                                <div 
                                    onClick={() => setPaymentMethod('cash')} 
                                    className={`payment-method-item ${paymentMethod === 'cash' ? 'active-cash' : ''}`}
                                >
                                    {paymentMethod === 'cash' && (
                                        <div className="payment-check-mark cash">
                                            <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                                        </div>
                                    )}
                                    <div className="payment-radio"></div>
                                    <div>
                                        <div className="payment-info-title">Tiền mặt</div>
                                        <div className="payment-info-subtitle">💵 Thanh toán bằng tiền mặt</div>
                                    </div>
                                </div>

                                {/* Tùy chọn 2: VNPay */}
                                <div 
                                    onClick={() => setPaymentMethod('vnpay')} 
                                    className={`payment-method-item ${paymentMethod === 'vnpay' ? 'active-vnpay' : ''}`}
                                >
                                    {paymentMethod === 'vnpay' && (
                                        <div className="payment-check-mark vnpay">
                                            <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                                        </div>
                                    )}
                                    <div className="payment-radio"></div>
                                    <div>
                                        <div className="payment-info-title">Cổng thanh toán điện tử VNPay</div>
                                        <div className="payment-info-subtitle">💳 Quét mã QR qua ứng dụng ngân hàng hoặc thẻ ATM</div>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Guide block */}
                            <div className="checkout-guide">
                                <div className="guide-header">
                                    <span className="guide-icon">i</span>
                                    {paymentMethod === 'cash' ? 'Hướng dẫn thanh toán (Chuyển khoản / Tại quầy)' : 'Thanh toán trực tuyến an toàn'}
                                </div>
                                {paymentMethod === 'cash' ? (
                                    <ul className="guide-list">
                                        <li>- Thông tin số tài khoản ngân hàng:</li>
                                        <li>- BIDV: <strong style={{ color: '#e53e3e' }}>51110000695613</strong> HOANG THI LINH chi nhánh Đô Lương.</li>
                                        <li>- Nội dung chuyển khoản ghi đúng số điện thoại của quý khách để được xác nhận từ nhà xe nhanh nhất.</li>
                                        <li style={{ marginTop: '10px', color: '#e53e3e', fontWeight: 'bold' }}>Hỗ trợ: 1900 3088</li>
                                    </ul>
                                ) : (
                                    <ul className="guide-list">
                                        <li>- Hệ thống sẽ chuyển tiếp bạn đến cổng thanh toán bảo mật Vnpay.</li>
                                        <li>- Bạn có thể dùng <strong>Internet Banking</strong>, <strong>Mobile Banking</strong> hoặc quét mã QR tiện lợi.</li>
                                        <li>- Giao dịch được xử lý và kiểm duyệt tức thời. Vé điện tử sẽ ngay lập tức được gửi vào email.</li>
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="right-column">
                        <Card padding="30px">
                            <h3 className="checkout-section-title">Thông tin vé</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px', marginBottom: '25px' }}>
                                <div className="info-row">
                                    <div className="info-label">Tuyến</div>
                                    <div className="info-value">{trip.departurePoint.includes(',') ? trip.departurePoint.split(',')[1].trim() : trip.departurePoint} - {trip.arrivalPoint.includes(',') ? trip.arrivalPoint.split(',')[1].trim() : trip.arrivalPoint}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Giờ xuất bến</div>
                                    <div className="info-value" style={{ color: '#3182ce' }}>{trip.departureTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 25/03/2026</span></div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Điểm đón</div>
                                    <div className="info-value">{trip.departurePoint}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Thời gian đón</div>
                                    <div className="info-value" style={{ color: '#3182ce' }}>{trip.departureTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 25/03/2026</span></div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Điểm đến</div>
                                    <div className="info-value">{trip.arrivalPoint}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Số ghế</div>
                                    <div className="info-value">{selectedSeats.join(', ')}</div>
                                </div>
                            </div>

                            <div className="summary-row">
                                <div style={{ color: '#718096' }}>Tổng tiền vé</div>
                                <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</div>
                            </div>

                            <div className="promo-row">
                                <div style={{ color: '#718096' }}>Mã giảm giá</div>
                                <div className="u-flex u-align-center u-gap-16">
                                    <input placeholder="Nhập mã giảm giá" className="promo-input" />
                                    <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>- 0 đ</span>
                                </div>
                            </div>

                            <div className="total-row">
                                <div style={{ fontWeight: '500', color: '#4a5568' }}>Tổng tiền thanh toán</div>
                                <div className="total-value">{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</div>
                            </div>

                            <div className="u-flex u-align-center u-gap-8" style={{ marginBottom: '30px' }}>
                                <input type="checkbox" defaultChecked />
                                <span style={{ color: '#4a5568' }}>Tôi đồng ý quy định của <strong style={{ color: '#e53e3e' }}>LẠC HỒNG SUNRISE. Hotline: 1900 3088</strong></span>
                            </div>

                            <div className="checkout-actions">
                                <button onClick={() => navigate('/booking')} className="btn-cancel">Huỷ</button>
                                <button 
                                    onClick={handleCheckout} 
                                    className={`btn-checkout ${paymentMethod === 'vnpay' ? 'btn-checkout-vnpay' : 'btn-checkout-later'}`}
                                >
                                    {paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Trả sau'}
                                </button>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
