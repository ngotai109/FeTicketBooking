import React, { useState } from 'react';
import { toast } from 'react-toastify';
import bookingService from '../../services/booking.service';
import '../../assets/styles/TicketLookup.css';
import step1Img from '../../assets/images/check-ticket-1.png';
import step2Img from '../../assets/images/check-ticket-2.png';

const TicketLookup = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!ticketCode || !phoneNumber) {
            toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsSearching(true);
        try {
            const res = await bookingService.lookupTicket(ticketCode, phoneNumber);
            const data = res.data;
            
            setLookupResult({
                code: `DSL${data.bookingId.toString().padStart(6, '0')}`,
                customer: data.customerName,
                phone: data.customerPhone,
                route: data.routeName,
                date: data.departureTime.split(' ngày ')[1],
                time: data.departureTime.split(' ngày ')[0],
                seat: data.tickets.map(t => t.seatNumber).join(', '),
                status: data.status === 0 ? 'Chờ thanh toán' : (data.status === 1 ? 'Đã xác nhận' : 'Đã hủy'),
                price: `${data.totalPrice.toLocaleString('vi-VN')}đ`
            });
        } catch (error) {
            console.error(error);
            setLookupResult('NOT_FOUND');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="ticket-lookup-page">
            <div className="lookup-container">
                <div className="lookup-header-simple">
                    <h1>Kiểm tra thông tin vé</h1>
                </div>

                <div className="lookup-form-wrapper">
                    <form className="horizontal-lookup-form" onSubmit={handleLookup}>
                        <div className="form-row">
                            <div className="input-field">
                                <label>Mã vé</label>
                                <input 
                                    type="text" 
                                    placeholder="Nhập mã vé" 
                                    value={ticketCode}
                                    onChange={(e) => setTicketCode(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <label>Số điện thoại</label>
                                <input 
                                    type="tel" 
                                    placeholder="Nhập số điện thoại" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="check-ticket-btn" disabled={isSearching}>
                                {isSearching ? <span className="loader small"></span> : 'KIỂM TRA VÉ'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lookup-guide-section">
                    <div className="guide-item">
                        <h4>Bước 1. Nhập thông tin vé</h4>
                        <div className="guide-image">
                            <img src={step1Img} alt="Bước 1" />
                        </div>
                    </div>
                    <div className="guide-item">
                        <h4>Bước 2. Kiểm tra vé</h4>
                        <div className="guide-image">
                            <img src={step2Img} alt="Bước 2" />
                        </div>
                    </div>
                </div>

                {lookupResult && lookupResult !== 'NOT_FOUND' && (
                    <div className="result-card-container fade-in">
                        <div className="result-card">
                            <div className="result-header">
                                <span className="status-badge">{lookupResult.status}</span>
                                <h3>Thông Tin Vé Xe</h3>
                            </div>
                            <div className="result-grid">
                                <div className="result-item">
                                    <span className="label">Mã vé:</span>
                                    <span className="value highlighting">{lookupResult.code}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Hành khách:</span>
                                    <span className="value">{lookupResult.customer}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Tuyến đường:</span>
                                    <span className="value">{lookupResult.route}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Ngày đi:</span>
                                    <span className="value">{lookupResult.date}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Giờ khởi hành:</span>
                                    <span className="value">{lookupResult.time}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Vị trí ghế:</span>
                                    <span className="value">{lookupResult.seat}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Giá vé:</span>
                                    <span className="value price">{lookupResult.price}</span>
                                </div>
                            </div>
                            <div className="result-actions">
                                <button className="print-btn">In vé / Tải PDF</button>
                                <button className="cancel-request-btn">Yêu cầu hủy vé</button>
                            </div>
                        </div>
                    </div>
                )}

                {lookupResult === 'NOT_FOUND' && (
                    <div className="error-card fade-in">
                        <div className="error-icon">⚠️</div>
                        <p>Không tìm thấy thông tin vé. Vui lòng kiểm tra lại số điện thoại hoặc mã vé.</p>
                        <span>Nếu bạn cần hỗ trợ, vui lòng gọi 1900 xxxx.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketLookup;
