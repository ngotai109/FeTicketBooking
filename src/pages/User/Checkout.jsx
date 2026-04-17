import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/styles/Checkout.css';
import Card from '../../components/Common/Card';
import bookingService from '../../services/booking.service';
import paymentService from '../../services/payment.service';

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
    const pickupTime = trip.pickupTime || trip.PickupTime || depTime; // Fallback to departure time if not set
    const depDateRaw = trip.departureDate || trip.DepartureDate || '';
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Ngày không xác định';
        try {
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) {
                // If it's pure YYYY-MM-DD, try to split
                const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
                if (parts.length === 3) {
                    if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`; // YYYY-MM-DD
                    return dateStr; // Already in DD/MM/YYYY or something else
                }
                return dateStr;
            }
            const d = dateObj.getDate().toString().padStart(2, '0');
            const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const y = dateObj.getFullYear();
            return `${d}/${m}/${y}`;
        } catch (e) {
            return dateStr;
        }
    };

    const depDateFormatted = formatDate(depDateRaw);

    // Self-healing: If tripSeats is missing, fetch it!
    useEffect(() => {
        const fetchMissingSeats = async () => {
            if (tripId && (!tripSeats || tripSeats.length === 0)) {
                try {
                    console.log("Đang nạp lại ghế cho chuyến:", tripId);
                    const res = await bookingService.getTripSeats(tripId, { skipLoading: true });
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
        email: localStorage.getItem('userEmail') || ''
    });

    // Tự động lưu thông tin khách hàng vào localStorage khi nhập
    useEffect(() => {
        if (customer.name) localStorage.setItem('userName', customer.name);
        if (customer.phone) localStorage.setItem('userPhone', customer.phone);
        if (customer.email) localStorage.setItem('userEmail', customer.email);
    }, [customer]);

    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [paymentMethod, setPaymentMethod] = useState('payos'); // 'vnpay' or 'payos'

    // Custom QR Modal State
    const [showQRModal, setShowQRModal] = useState(false);
    const [payosData, setPayosData] = useState(null);
    const [currentBookingId, setCurrentBookingId] = useState(null);

    // Polling payment status
    useEffect(() => {
        let pollInterval;
        if (showQRModal && currentBookingId) {
            pollInterval = setInterval(async () => {
                try {
                    const res = await bookingService.getBookingById(currentBookingId, { skipLoading: true });
                    const booking = res.data?.data || res.data;

                    // 1. Kiểm tra trạng thái trong DB (dựa vào webhook)
                    if (booking && (booking.status === 1 || booking.Status === 1)) { 
                        clearInterval(pollInterval);
                        setShowQRModal(false);
                        toast.success("Hệ thống đã nhận được thanh toán!");
                        setTimeout(() => navigate(`/payment/payos-return?status=PAID&orderCode=${payosData?.orderCode}`), 1000);
                        return;
                    }

                    // 2. Kiểm tra CHỦ ĐỘNG qua PayOS (Dùng cho môi trường localhost không nhận được webhook)
                    if (payosData && payosData.orderCode) {
                        const checkRes = await paymentService.checkPayOSStatus({
                            bookingId: currentBookingId,
                            orderCode: payosData.orderCode
                        });
                        
                        if (checkRes.data?.status === 'PAID') {
                            console.log("[PAYOS] Phát hiện đã thanh toán qua API check-status!");
                            // Lần chạy polling tiếp theo của bước 1 sẽ bắt được trạng thái cập nhật trong DB
                        }
                    }
                } catch (err) {
                    console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
                }
            }, 3000); 
        }
        return () => clearInterval(pollInterval);
    }, [showQRModal, currentBookingId, payosData, navigate]);

    useEffect(() => {
        if (!location.state) {
            toast.error("Vui lòng chọn chuyến và ghế trước!");
            navigate('/booking');
            return;
        }

        const timer = setInterval(async () => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Tự động hủy đơn hàng trên server khi hết hạn
                    if (currentBookingId) {
                        bookingService.updateBookingStatus(currentBookingId, 2).catch(e => console.error("Auto-cancel failed", e));
                    }
                    toast.warning("Hết thời gian giao dịch. Ghế đã được giải phóng!");
                    navigate('/booking');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            clearInterval(timer);
            // TỰ ĐỘNG HỦY KHI RỜI TRANG:
            // Nếu có booking đang treo mà người dùng rời khỏi trang Checkout (nhấn Back, đổi link...)
            // thì gửi yêu cầu hủy để giải phóng ghế ngay lập tức.
            if (currentBookingId) {
                console.log("Cleanup: Hủy đơn hàng đang treo:", currentBookingId);
                // Dùng .then().catch() để không chặn việc unmount
                bookingService.updateBookingStatus(currentBookingId, 2)
                    .then(() => console.log("Đã giải phóng ghế thành công"))
                    .catch(err => console.error("Lỗi giải phóng ghế:", err));
            }
        };
    }, [location, navigate, currentBookingId]);

    const handleCancelPayment = async () => {
        if (!currentBookingId) {
            setPayosData(null);
            return;
        }

        try {
            await bookingService.updateBookingStatus(currentBookingId, 2); // 2 = Cancelled
            toast.info("Ghế đã được giải phóng. Bạn có thể chọn chuyến khác.");
            setPayosData(null);
            setCurrentBookingId(null);
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            // Vẫn cho quay lại dù lỗi mạng
            setPayosData(null);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCheckout = async () => {
        // 1. Validate Họ tên
        if (!customer.name || customer.name.trim().length < 2) {
            toast.error("Vui lòng nhập họ tên hợp lệ!");
            return;
        }
        
        // 2. Validate Số điện thoại (Định dạng VN)
        const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
        if (!phoneRegex.test(customer.phone)) {
            toast.error("Số điện thoại không hợp lệ (Yêu cầu 10 số)!");
            return;
        }

        // 3. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!customer.email || !emailRegex.test(customer.email)) {
            toast.error("Vui lòng nhập Email đúng định dạng!");
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
            const bookingId = res.data.bookingId;
            const totalAmount = selectedSeats.length * ticketPrice;

            if (paymentMethod === 'payos') {
                try {
                    const payRes = await paymentService.createPayOSPayment({ bookingId: bookingId });
                    if (payRes.data) {
                        setPayosData(payRes.data);
                        setCurrentBookingId(bookingId);
                        setShowQRModal(true);
                        toast.success("Đã tạo mã QR thanh toán!");
                         return;
                    } else {
                        throw new Error("Không lấy được dữ liệu thanh toán PayOS.");
                    }
                } catch (err) {
                    console.error("Lỗi PayOS:", err);
                    toast.error("Không thể kết nối cổng thanh toán PayOS.");
                    return;
                }
            } else if (paymentMethod === 'vnpay') {
                try {
                    toast.info("Đang chuyển hướng sang cổng thanh toán VNPay...");
                    
                    const paymentData = {
                        orderId: bookingId,
                        fullName: customer.name,
                        amount: totalAmount,
                        description: `Thanh toán vé xe cho ${customer.name} - ${selectedSeats.join(', ')}`
                    };

                    const payRes = await paymentService.createVNPayPayment(paymentData);
                    
                    if (payRes.data?.paymentUrl) {
                        window.location.href = payRes.data.paymentUrl;
                        return; // Dừng thực thi để đợi chuyển hướng
                    } else {
                        throw new Error("Không lấy được link thanh toán.");
                    }
                } catch (payError) {
                    console.error("Lỗi VNPay:", payError);
                    toast.error("Không thể kết nối cổng thanh toán VNPay. Vui lòng thử lại!");
                    return;
                }
            } else if (paymentMethod === 'cash') {
                toast.success("Đặt vé thành công! Vui lòng thanh toán tại quầy.");
                setTimeout(() => navigate('/lookup/ticket'), 2000);
            } else {
                toast.warning("Vui lòng chọn phương thức thanh toán!");
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
                        {!payosData ? (
                            <>
                                {/* Thông tin khách hàng */}
                                <Card padding="30px">
                                    <h3 className="checkout-section-title">Thông tin khách hàng</h3>
                                    
                                    <div className="checkout-customer-form">
                                        <div className="checkout-form-field">
                                            <div className="checkout-field-label">Họ tên</div>
                                            <input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="checkout-field-input" />
                                        </div>
                                        <div className="checkout-form-field">
                                            <div className="checkout-field-label">Số điện thoại</div>
                                            <input value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="checkout-field-input" />
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
                                    
                                        {/* Tùy chọn 1: PayOS (Mặc định mới) */}
                                        <div 
                                            onClick={() => setPaymentMethod('payos')} 
                                            className={`payment-method-item ${paymentMethod === 'payos' ? 'active-payos' : ''}`}
                                        >
                                            {paymentMethod === 'payos' && (
                                                <div className="payment-check-mark payos">
                                                    <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                                                </div>
                                            )}
                                            <div className="payment-radio"></div>
                                            <div>
                                                <div className="payment-info-title">Thanh toán PayOS (QR Code)</div>
                                                <div className="payment-info-subtitle">⚡ Thanh toán nhanh qua QR-Code ngân hàng</div>
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

                                    {/* Conditional Guide block */}
                                    <div className="checkout-guide">
                                        <div className="guide-header">
                                            <span className="guide-icon">i</span>
                                            {paymentMethod === 'payos' ? 'Thanh toán trực tuyến an toàn' : 'Thanh toán trực tuyến an toàn'}
                                        </div>
                                        {paymentMethod === 'payos' ? (
                                            <ul className="guide-list">
                                                <li>- Hệ thống sẽ tạo mã QR thanh toán riêng cho đơn hàng của bạn.</li>
                                                <li>- Bạn chỉ cần mở ứng dụng Ngân hàng và <strong>Quét mã QR</strong> để hoàn tất.</li>
                                                <li>- Giao dịch an toàn, bảo mật và được xác nhận tự động.</li>
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
                            </>
                        ) : (
                            /* GIAO DIỆN HIỂN THỊ MÃ QR THAY CHO FORM */
                            <Card className="qr-inline-card">
                                <div className="qr-compact-header">
                                    <h3 className="qr-modal-title" style={{ fontSize: '18px' }}>Quét mã chuyển khoản</h3>
                                </div>

                                <div className="qr-code-container">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payosData.qrCode)}&size=200x200&ecc=M`}
                                        alt="Payment QR Code" 
                                    />
                                </div>

                                <div className="qr-payment-info">
                                    <div className="qr-info-item">
                                        <span className="qr-info-label">Ngân hàng</span>
                                        <span className="qr-info-value">BIDV</span>
                                    </div>
                                    <div className="qr-info-item">
                                        <span className="qr-info-label">Chủ tài khoản</span>
                                        <span className="qr-info-value">{payosData.accountName || "NGO KHAC TAI"}</span>
                                    </div>
                                    <div className="qr-info-item">
                                        <span className="qr-info-label">Số tài khoản</span>
                                        <div className="qr-info-value-wrap">
                                            <span className="qr-info-value" style={{ color: '#3182ce' }}>{payosData.accountNumber}</span>
                                            <button className="qr-copy-btn" onClick={() => {
                                                navigator.clipboard.writeText(payosData.accountNumber);
                                                toast.info("Đã chép số tài khoản");
                                            }}>Chép</button>
                                        </div>
                                    </div>
                                    <div className="qr-info-item">
                                        <span className="qr-info-label">Nội dung</span>
                                        <div className="qr-info-value-wrap">
                                            <span className="qr-info-value">{payosData.description}</span>
                                            <button className="qr-copy-btn" onClick={() => {
                                                navigator.clipboard.writeText(payosData.description);
                                                toast.info("Đã chép nội dung");
                                            }}>Chép</button>
                                        </div>
                                    </div>
                                    <div className="qr-info-item" style={{ background: '#e53e3e', color: 'white' }}>
                                        <span className="qr-info-label" style={{ color: 'white' }}>Tổng tiền</span>
                                        <span className="qr-info-value" style={{ fontSize: '16px' }}>{payosData.amount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                </div>

                                <div className="qr-footer-compact">
                                    <div className="qr-footer-msg" style={{ margin: 0 }}>
                                        <div className="qr-spinner"></div>
                                        <span>Đang chờ thanh toán...</span>
                                    </div>
                                    <span className="btn-back-link" onClick={handleCancelPayment}>
                                        « Quay lại / Đổi phương thức
                                    </span>
                                </div>
                            </Card>
                        )}
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
                                    <div className="info-value" style={{ color: '#3182ce' }}>{depTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày {depDateFormatted}</span></div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Điểm đón</div>
                                    <div className="info-value">{depPt}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label">Thời gian đón</div>
                                    <div className="info-value" style={{ color: '#3182ce' }}>{pickupTime} <span style={{ color: '#2d3748', fontWeight: 'normal' }}>ngày {depDateFormatted}</span></div>
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

                            <div className="total-row">
                                <div style={{ fontWeight: '500', color: '#4a5568' }}>Tổng tiền thanh toán</div>
                                <div className="total-value">{(selectedSeats.length * ticketPrice).toLocaleString('vi-VN')} đ</div>
                            </div>

                            <div className="u-flex u-align-center u-gap-8" style={{ marginBottom: '30px' }}>
                                <input type="checkbox" defaultChecked />
                                <span style={{ color: '#4a5568' }}>Tôi đồng ý quy định của <strong style={{ color: '#e53e3e' }}>ĐỒNG HƯƠNG SÔNG LAM. Hotline: 1900 3088</strong></span>
                            </div>

                            <div className="checkout-actions">
                                <button onClick={() => navigate('/booking')} className="btn-cancel">Huỷ</button>
                                <button 
                                    onClick={handleCheckout} 
                                    disabled={isLoading}
                                    className={`btn-checkout ${paymentMethod === 'payos' ? 'btn-checkout-payos' : 'btn-checkout-vnpay'}`}
                                >
                                    {isLoading ? 'ĐANG XỬ LÝ...' : (paymentMethod === 'payos' ? 'Thanh toán PayOS' : 'Thanh toán VNPay')}
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
