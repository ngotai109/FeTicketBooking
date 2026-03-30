import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/styles/Checkout.css';
import { Card } from '../../components/Common';
import bookingService from '../../services/booking.service';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Safety check if user didn't come from Booking
    const trip = location.state?.trip || { 
        departureOfficeName: 'Bến xe Miền Đông', arrivalOfficeName: 'Bến xe Nước Ngầm',
        departureTime: '12:30', arrivalTime: '18:30', ticketPrice: 0 
    };
    const selectedSeats = location.state?.selectedSeats || [];
    const [tripSeats, setTripSeats] = useState(location.state?.tripSeats || []);
    const tripId = trip.tripId || trip.TripId || trip.id;
    const ticketPrice = trip.ticketPrice || trip.TicketPrice || trip.price || 0;
    
    // Safety values for display
    const depPt = trip.departureOfficeName || trip.DepartureOfficeName || trip.departurePoint || '--';
    const arrPt = trip.arrivalOfficeName || trip.ArrivalOfficeName || trip.arrivalPoint || '--';
    const depTime = trip.departureTime || trip.DepartureTime || '--:--';
    const arrTime = trip.arrivalTime || trip.ArrivalTime || '--:--';

    // Self-healing: If tripSeats is missing, fetch it!
    useEffect(() => {
        const fetchMissingSeats = async () => {
            if (tripId && (!tripSeats || tripSeats.length === 0)) {
                try {
                    console.log("Đang nạp lại ghế cho chuyến:", tripId);
                    const res = await bookingService.getTripSeats(tripId);
                    const data = res.data?.data || res.data || [];
                    console.log("Dữ liệu nạp được cho Checkout:", data);
                    setTripSeats(data);
                } catch (error) {
                    console.error("Lỗi nạp ghế:", error);
                }
            }
        };
        fetchMissingSeats();
    }, [tripId]);

    // Map seat numbers to seat IDs
    const selectedSeatIds = selectedSeats.map(num => {
        const targetNum = num?.toString().trim().toUpperCase();
        const seatObj = tripSeats.find(s => {
            const sNum = (s.seatNumber || s.SeatNumber || '').toString().trim().toUpperCase();
            return sNum === targetNum;
        });
        return seatObj?.tripSeatId || seatObj?.TripSeatId || null;
    }).filter(id => id !== null);

    const [isLoading, setIsLoading] = useState(false);
    
    const [customer, setCustomer] = useState({ 
        phone: localStorage.getItem('userPhone') || '', 
        name: localStorage.getItem('userName') || '', 
        email: '' // Luôn để trống để khách hàng tự điền theo yêu cầu
    });
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

    const handleCheckout = async () => {
        if (!customer.name || !customer.phone) {
            toast.error("Vui lòng điền đủ thông tin!");
            return;
        }

        if (selectedSeatIds.length === 0) {
            toast.error(`Không tìm thấy dữ liệu ghế cho chuyến #${tripId}. Vui lòng quay lại đặt lại!`);
            console.error("Lỗi khớp ghế Checkout:", { trip, tripId, selectedSeats, tripSeats });
            return;
        }

        setIsLoading(true);
        try {
            const bookingPayload = {
                userId: null,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerEmail: customer.email,
                tripSeatIds: selectedSeatIds
            };

            const res = await bookingService.createBooking(bookingPayload);

            if (paymentMethod === 'vnpay') {
                const amount = selectedSeats.length * ticketPrice;
                toast.info("Đang chuyển hướng sang VNPay...");
                setTimeout(() => navigate('/payment/vnpay', { state: { amount, bookingId: res.data.bookingId } }), 1500);
            } else {
                toast.success("Đặt vé thành công! Check Email nhé!");
                setTimeout(() => navigate('/lookup/ticket'), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi đặt vé!");
        } finally {
            setIsLoading(false);
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
                                    <div className="info-value">{(depPt.includes(',') ? depPt.split(',')[1].trim() : depPt)} - {(arrPt.includes(',') ? arrPt.split(',')[1].trim() : arrPt)}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Giờ xuất bến</div>
                                    <div className="info-value" style={{ color: '#3182ce' }}>{depTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 30/03/2026</span></div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Điểm đón</div>
                                    <div className="info-value">{depPt}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Thời gian đón</div>
                                    <div className="info-value" style={{ color: '#3182ce' }}>{depTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày 30/03/2026</span></div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Điểm đến</div>
                                    <div className="info-value">{arrPt}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Số ghế</div>
                                    <div className="info-value">{selectedSeats.join(', ')}</div>
                                </div>
                            </div>

                            <div className="summary-row">
                                <div style={{ color: '#718096' }}>Tổng tiền vé</div>
                                <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{(selectedSeats.length * ticketPrice).toLocaleString('vi-VN')} đ</div>
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
                                <div className="total-value">{(selectedSeats.length * ticketPrice).toLocaleString('vi-VN')} đ</div>
                            </div>

                            <div className="u-flex u-align-center u-gap-8" style={{ marginBottom: '30px' }}>
                                <input type="checkbox" defaultChecked />
                                <span style={{ color: '#4a5568' }}>Tôi đồng ý quy định của <strong style={{ color: '#e53e3e' }}>LẠC HỒNG SUNRISE. Hotline: 1900 3088</strong></span>
                            </div>

                            <div className="checkout-actions">
                                <button onClick={() => navigate('/booking')} className="btn-cancel">Huỷ</button>
                                <button 
                                    onClick={handleCheckout} 
                                    disabled={isLoading}
                                    className={`btn-checkout ${paymentMethod === 'vnpay' ? 'btn-checkout-vnpay' : 'btn-checkout-later'}`}
                                >
                                    {isLoading ? 'ĐANG XỬ LÝ...' : (paymentMethod === 'vnpay' ? 'Thanh toán VNPay' : 'Trả sau')}
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
