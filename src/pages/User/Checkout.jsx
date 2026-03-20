import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 0', fontFamily: 'Arial, sans-serif' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#3182ce', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>🎫</div>
                        <h2 style={{ fontSize: '24px', color: '#1a202c', margin: 0, fontWeight: '700' }}>Xác nhận mua vé</h2>
                    </div>
                    <div style={{ fontSize: '18px', color: '#718096' }}>
                        Thời gian giao dịch còn lại <span style={{ fontSize: '28px', color: '#1a202c', fontWeight: 'bold', marginLeft: '10px' }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    
                    {/* LEFT COLUMN */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        
                        {/* Thông tin khách hàng */}
                        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#2d3748' }}>Thông tin khách hàng</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '150px', color: '#718096' }}>Số điện thoại</div>
                                    <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', outline: 'none', fontSize: '16px', color: '#2d3748' }} />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '150px', color: '#718096' }}>Họ tên</div>
                                    <input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', outline: 'none', fontSize: '16px', color: '#2d3748' }} />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '150px', color: '#718096' }}>Email</div>
                                    <input value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} style={{ flex: 1, border: 'none', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', outline: 'none', fontSize: '16px', color: '#2d3748' }} />
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#2d3748' }}>Phương thức thanh toán</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* Tùy chọn 1: Tiền mặt */}
                                <div onClick={() => setPaymentMethod('cash')} style={{ cursor: 'pointer', border: paymentMethod === 'cash' ? '2px solid #e53e3e' : '1px solid #e2e8f0', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: paymentMethod === 'cash' ? '#fff5f5' : 'white', position: 'relative', overflow: 'hidden', transition: '0.2s' }}>
                                    {paymentMethod === 'cash' && (
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: '#e53e3e', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                                            <span style={{ color: 'white', position: 'absolute', top: '5px', right: '5px', fontSize: '12px' }}>✓</span>
                                        </div>
                                    )}
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'cash' ? '5px solid #e53e3e' : '1px solid #cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2d3748' }}>Tiền mặt</div>
                                        <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>💵 Thanh toán bằng tiền mặt</div>
                                    </div>
                                </div>

                                {/* Tùy chọn 2: VNPay */}
                                <div onClick={() => setPaymentMethod('vnpay')} style={{ cursor: 'pointer', border: paymentMethod === 'vnpay' ? '2px solid #3182ce' : '1px solid #e2e8f0', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', background: paymentMethod === 'vnpay' ? '#ebf8ff' : 'white', position: 'relative', overflow: 'hidden', transition: '0.2s' }}>
                                    {paymentMethod === 'vnpay' && (
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: '#3182ce', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
                                            <span style={{ color: 'white', position: 'absolute', top: '5px', right: '5px', fontSize: '12px' }}>✓</span>
                                        </div>
                                    )}
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: paymentMethod === 'vnpay' ? '5px solid #3182ce' : '1px solid #cbd5e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2d3748' }}>Cổng thanh toán điện tử VNPay</div>
                                        <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>💳 Quét mã QR qua ứng dụng ngân hàng hoặc thẻ ATM</div>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Guide block */}
                            <div style={{ marginTop: '25px', padding: '0 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', marginBottom: '15px' }}>
                                    <span style={{ background: '#2d3748', color: 'white', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '12px' }}>i</span>
                                    {paymentMethod === 'cash' ? 'Hướng dẫn thanh toán (Chuyển khoản / Tại quầy)' : 'Thanh toán trực tuyến an toàn'}
                                </div>
                                {paymentMethod === 'cash' ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#4a5568', lineHeight: '2' }}>
                                        <li>- Thông tin số tài khoản ngân hàng:</li>
                                        <li>- BIDV: <strong style={{ color: '#e53e3e' }}>51110000695613</strong> HOANG THI LINH chi nhánh Đô Lương.</li>
                                        <li>- Nội dung chuyển khoản ghi đúng số điện thoại của quý khách để được xác nhận từ nhà xe nhanh nhất.</li>
                                        <li style={{ marginTop: '10px', color: '#e53e3e', fontWeight: 'bold' }}>Hỗ trợ: 1900 3088</li>
                                    </ul>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#4a5568', lineHeight: '2' }}>
                                        <li>- Hệ thống sẽ chuyển tiếp bạn đến cổng thanh toán bảo mật Vnpay.</li>
                                        <li>- Bạn có thể dùng <strong>Internet Banking</strong>, <strong>Mobile Banking</strong> hoặc quét mã QR tiện lợi.</li>
                                        <li>- Giao dịch được xử lý và kiểm duyệt tức thời. Vé điện tử sẽ ngay lập tức được gửi vào email.</li>
                                    </ul>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '25px', color: '#2d3748' }}>Thông tin vé</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px', marginBottom: '25px' }}>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Tuyến</div>
                                <div style={{ flex: 1, color: '#2d3748', fontWeight: '500' }}>{trip.departurePoint.includes(',') ? trip.departurePoint.split(',')[1].trim() : trip.departurePoint} - {trip.arrivalPoint.includes(',') ? trip.arrivalPoint.split(',')[1].trim() : trip.arrivalPoint}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Giờ xuất bến</div>
                                <div style={{ flex: 1, color: '#3182ce', fontWeight: '500' }}>{trip.departureTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 25/03/2026</span></div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Điểm đón</div>
                                <div style={{ flex: 1, color: '#2d3748', fontWeight: '500' }}>{trip.departurePoint}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Thời gian đón</div>
                                <div style={{ flex: 1, color: '#3182ce', fontWeight: '500' }}>{trip.departureTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 25/03/2026</span></div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Điểm đến</div>
                                <div style={{ flex: 1, color: '#2d3748', fontWeight: '500' }}>{trip.arrivalPoint}</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ width: '150px', color: '#718096' }}>Số ghế</div>
                                <div style={{ flex: 1, color: '#2d3748', fontWeight: '500' }}>{selectedSeats.join(', ')}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                            <div style={{ color: '#718096' }}>Tổng tiền vé</div>
                            <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ color: '#718096' }}>Mã giảm giá</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <input placeholder="Nhập mã giảm giá" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none' }} />
                                <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>- 0 đ</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff5f5', borderRadius: '8px', marginBottom: '30px' }}>
                            <div style={{ fontWeight: '500', color: '#4a5568' }}>Tổng tiền thanh toán</div>
                            <div style={{ fontWeight: 'bold', color: '#e53e3e', fontSize: '24px' }}>{(selectedSeats.length * trip.price).toLocaleString('vi-VN')} đ</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ color: '#4a5568' }}>Tôi đồng ý quy định của <strong style={{ color: '#e53e3e' }}>LẠC HỒNG SUNRISE. Hotline: 1900 3088</strong></span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button onClick={() => navigate('/booking')} style={{ padding: '12px 30px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Huỷ</button>
                            <button onClick={handleCheckout} style={{ padding: '12px 30px', background: paymentMethod === 'vnpay' ? '#3182ce' : '#f6ad55', border: 'none', borderRadius: '24px', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                                {paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Trả sau'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
