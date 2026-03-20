import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VNPayMock = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy số tiền từ trang checkout gửi sang, mặc định 630.000 nếu không có
    const amount = location.state?.amount || 630000;
    
    // Tạo mã đơn hàng ảo giống VNPAY
    const [orderId] = useState(`EVUOZ52_${Date.now()}`);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    toast.error("Giao dịch đã hết hạn!");
                    navigate('/booking');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    const formatTimeBlock = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return (
            <div style={{ display: 'flex', gap: '5px', fontWeight: 'bold' }}>
                <span style={{ background: '#2d3748', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{m}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                <span style={{ background: '#2d3748', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{s}</span>
            </div>
        );
    };

    // Giả lập quét thành công khi bấm vào mã QR
    const handleSimulateScan = () => {
        toast.success("Giao dịch thành công! (Mock Scan)");
        setTimeout(() => {
            navigate('/lookup/ticket');
        }, 1500);
    };

    return (
        <div style={{ backgroundColor: '#f4f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
            
            <div style={{ background: 'white', width: '100%', maxWidth: '1000px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                
                {/* Header VNPAY */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#005baa', fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>VNPAY</span>
                            <span style={{ color: '#e53e3e', fontSize: '24px', fontWeight: '900' }}>QR</span>
                        </div>
                        <span style={{ color: '#718096', fontSize: '13px', paddingTop: '5px' }}>CỔNG THANH TOÁN</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#4a5568', fontSize: '14px' }}>Giao dịch hết hạn sau</span>
                        {formatTimeBlock(timeLeft)}
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    {/* Warning Banner */}
                    <div style={{ background: '#fffaf0', border: '1px solid #feebc8', color: '#c05621', padding: '15px 20px', borderRadius: '8px', fontSize: '14px', marginBottom: '30px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold' }}>⚠️</span>
                        <div>Quý khách vui lòng không tắt trình duyệt cho đến khi nhận được kết quả giao dịch trên website. Trường hợp đã thanh toán nhưng chưa nhận kết quả giao dịch, vui lòng bấm <u>"Tại đây"</u> để nhận kết quả. Xin cảm ơn!</div>
                    </div>

                    {/* Main Columns */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                        
                        {/* LEFT: Thông tin đơn hàng */}
                        <div style={{ flex: 1, background: '#f8f9fa', padding: '25px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', color: '#2d3748', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>Thông tin đơn hàng</h3>
                            
                            <div>
                                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>Số tiền thanh toán</div>
                                <div style={{ color: '#3182ce', fontSize: '28px', fontWeight: 'bold' }}>{amount.toLocaleString('vi-VN')} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>VND</span></div>
                            </div>

                            <div>
                                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>Giá trị đơn hàng</div>
                                <div style={{ color: '#2d3748', fontSize: '16px', fontWeight: '500' }}>{amount.toLocaleString('vi-VN')} <span style={{ fontSize: '12px' }}>VND</span></div>
                            </div>

                            <div>
                                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>Phí giao dịch</div>
                                <div style={{ color: '#2d3748', fontSize: '16px', fontWeight: '500' }}>0 <span style={{ fontSize: '12px' }}>VND</span></div>
                            </div>

                            <div>
                                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>Mã đơn hàng</div>
                                <div style={{ color: '#2d3748', fontSize: '16px', fontWeight: '500' }}>{orderId}</div>
                            </div>

                            <div>
                                <div style={{ color: '#718096', fontSize: '13px', marginBottom: '5px' }}>Nhà cung cấp</div>
                                <div style={{ color: '#2d3748', fontSize: '16px', fontWeight: '500' }}>NHÀ XE ĐỒNG HƯƠNG SÔNG LAM</div>
                            </div>
                        </div>

                        {/* RIGHT: QR Code Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', margin: '0 0 10px 0', textAlign: 'center' }}>Quét mã qua App Ngân hàng/ Ví điện tử</h3>
                            
                            <div style={{ color: '#3182ce', fontSize: '14px', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3182ce', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>i</span>
                                <u>Hướng dẫn thanh toán</u>
                            </div>

                            {/* Mã QR */}
                            <div style={{ border: '2px solid #3182ce', padding: '15px', borderRadius: '8px', position: 'relative', marginBottom: '25px', cursor: 'pointer' }} onClick={handleSimulateScan} title="Click vào đây để giả lập quét thành công!">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VNPAY_MOCK_${orderId}`} alt="QR Code" style={{ display: 'block' }} />
                                <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#3182ce', fontWeight: 'bold', fontSize: '14px' }}>
                                    Scan to Pay
                                </div>
                            </div>

                            {/* Nút hủy */}
                            <button onClick={() => navigate('/checkout')} style={{ width: '100%', maxWidth: '250px', padding: '12px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                                Hủy thanh toán
                            </button>
                        </div>

                    </div>
                    
                </div>
            </div>

            <div style={{ marginTop: '30px', width: '100%', maxWidth: '1000px', padding: '0 10px' }}>
                <div style={{ fontSize: '14px', color: '#718096', marginBottom: '15px' }}>Danh sách Ngân hàng/ Ví điện tử có áp dụng khuyến mãi</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Mock Bank Logos */}
                    <div style={{ width: '60px', height: '35px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#2b6cb0' }}>VIETCOMBANK</div>
                    <div style={{ width: '60px', height: '35px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#c53030' }}>TECHCOMBANK</div>
                    <div style={{ width: '60px', height: '35px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#2c7a7b' }}>MB BANK</div>
                    <div style={{ width: '60px', height: '35px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#d69e2e' }}>VNPAY WALLET</div>
                </div>
            </div>

        </div>
    );
};

export default VNPayMock;
