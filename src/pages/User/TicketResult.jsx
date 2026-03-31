import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TicketResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { ticket } = location.state || {};

    useEffect(() => {
        const originalBg = document.body.style.background;
        document.body.style.background = '#ffffff';
        const mainInner = document.querySelector('.user-main-inner');
        const userMain = document.querySelector('.user-main');
        const originalInnerMaxW = mainInner ? mainInner.style.maxWidth : '';
        const originalMainPadding = userMain ? userMain.style.padding : '';
        
        if (mainInner) mainInner.style.maxWidth = '100%';
        if (userMain) userMain.style.padding = '0';

        return () => {
            document.body.style.background = originalBg;
            if (mainInner) mainInner.style.maxWidth = originalInnerMaxW;
            if (userMain) userMain.style.padding = originalMainPadding;
        };
    }, []);

    if (!ticket) {
        return (
            <div style={{ background: '#fff', textAlign: 'center', padding: '100px 20px', minHeight: '80vh' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '24px', color: '#333' }}>Không tìm thấy thông tin vé!</h2>
                    <p style={{ color: '#666', margin: '15px 0 25px' }}>Vui lòng thực hiện tìm kiếm lại.</p>
                    <button onClick={() => navigate('/lookup/ticket')} style={{ padding: '12px 40px', background: '#ffc107', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>QUAY LẠI</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', padding: '60px 0', overflowX: 'hidden' }}>

            <div style={{ width: '100%', margin: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                    
                    {/* Top Section: Ticket Info */}
                    <div style={{ padding: '0 30px' }}>
                        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Thông Tin Vé Xe</h3>
                        </div>

                        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '80px', rowGap: '0' }}>
                            {[
                                { label: 'Mã vé', value: ticket.code, highlight: true },
                                { label: 'Hành khách', value: ticket.customer },
                                { label: 'Tuyến đường', value: ticket.route },
                                { label: 'Ngày đi', value: ticket.date },
                                { label: 'Giờ khởi hành', value: ticket.time },
                                { label: 'Vị trí ghế', value: ticket.seat },
                                { label: 'Trạng thái', value: ticket.status, isStatus: true },
                                { label: 'Giá vé', value: ticket.price, isPrice: true }
                            ].map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b', fontSize: '15px' }}>{item.label}:</span>
                                    {item.isStatus ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                                                {item.value}
                                            </span>
                                            <button 
                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                Yêu cầu hủy vé
                                            </button>
                                        </div>
                                    ) : (
                                        <span style={{ fontWeight: '700', fontSize: item.isPrice ? '22px' : '16px', color: item.highlight ? '#2563eb' : (item.isPrice ? '#ef4444' : '#1e293b') }}>
                                            {item.value}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button onClick={() => navigate('/lookup/ticket')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>← Quay lại trang tra cứu</button>
                        </div>
                    </div>

                    {/* Bottom Section: Cancellation Policy (FULL WIDTH) - ENHANCED COLORS */}
                    <div style={{ 
                        background: '#f1f5f9', 
                        padding: '80px 0', 
                        width: '100%', 
                        position: 'relative',
                        borderTop: '1px solid #e2e8f0'
                    }}>

                        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 30px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Chính sách hủy vé & Hoàn tiền</h3>
                                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>Vui lòng lưu ý các mốc thời gian để được hỗ trợ tốt nhất</p>
                            </div>


                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' }}>
                                {[
                                    { 
                                        time: 'Trước 24 giờ', 
                                        fee: 'Phí hủy 10%', 
                                        color: '#3b82f6', 
                                        bg: '#eff6ff',
                                        icon: 'fa-history',
                                        desc: 'Hoàn tiền tự động vào tài khoản sau 3-5 ngày làm việc.' 
                                    },
                                    { 
                                        time: 'Từ 4h đến 24h', 
                                        fee: 'Phí hủy 50%', 
                                        color: '#f59e0b', 
                                        bg: '#fffbeb',
                                        icon: 'fa-user-clock',
                                        desc: 'Chỉ áp dụng cho vé chưa in hoặc chưa lên xe.' 
                                    },
                                    { 
                                        time: 'Dưới 4 giờ', 
                                        fee: 'Không hoàn tiền', 
                                        color: '#ef4444', 
                                        bg: '#fef2f2',
                                        icon: 'fa-ban',
                                        desc: 'Không áp dụng chính sách hủy hoặc đổi trả tiền trong mốc này.' 
                                    }
                                ].map((p, i) => (
                                    <div key={i} style={{ 
                                        background: '#ffffff',
                                        padding: '30px 25px',
                                        borderRadius: '24px',
                                        border: `1.5px solid ${p.bg}`,
                                        textAlign: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        transition: 'transform 0.2s'
                                    }}>
                                        <div style={{ 
                                            width: '45px', height: '45px', background: p.bg, color: p.color, 
                                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 20px'
                                        }}>
                                            <i className={`fas ${p.icon}`}></i>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{p.time}</div>
                                        <div style={{ color: p.color, fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{p.fee}</div>
                                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{p.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ 
                                background: '#ffffff', 
                                padding: '30px', 
                                borderRadius: '20px', 
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '25px'
                            }}>
                                <div style={{ 
                                    width: '50px', height: '50px', background: '#f8fafc', color: '#64748b', 
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-info-circle"></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ color: '#1e293b', fontSize: '16px', display: 'block', marginBottom: '10px' }}>Ghi chú dành cho quý khách:</strong>
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                        {[
                                            'Áp dụng cho vé thanh toán trực tuyến.',
                                            'Liên hệ tổng đài: 1900 xxxx (24/7).',
                                            'Chính sách có thể thay đổi ngày lễ.',
                                            'Có mặt trước 30 phút để lên xe.'
                                        ].map((t, i) => (
                                            <li key={i} style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <i className="fas fa-check" style={{ color: '#10b981', fontSize: '12px' }}></i> {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketResult;
