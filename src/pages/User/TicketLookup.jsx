import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../../services/booking.service';
import { LoadingSpinner } from '../../components/Common';
import '../../assets/styles/TicketLookup.css';
import step1Img from '../../assets/images/check-ticket-1.png';
import step2Img from '../../assets/images/check-ticket-2.png';

const TicketLookup = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [ticketCode, setTicketCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

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
            
            const ticketResult = {
                code: `DSL${data.bookingId.toString().padStart(6, '0')}`,
                customer: data.customerName,
                phone: data.customerPhone,
                route: data.routeName,
                date: data.departureTime.split(' ngày ')[1],
                time: data.departureTime.split(' ngày ')[0],
                seat: data.tickets.map(t => t.seatNumber).join(', '),
                status: data.status === 0 ? 'Chờ thanh toán' : (data.status === 1 ? 'Đã xác nhận' : (data.status === 4 ? 'Chờ hủy' : 'Đã hủy')),
                rawStatus: data.status,
                bookingId: data.bookingId,
                price: `${data.totalPrice.toLocaleString('vi-VN')}đ`
            };

            navigate('/lookup/result', { state: { ticket: ticketResult } });
        } catch (error) {
            console.error(error);
            toast.error("Không tìm thấy thông tin vé. Vui lòng kiểm tra lại!");
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
                                {isSearching ? <LoadingSpinner size="small" message="" color="#ffffff" /> : 'KIỂM TRA VÉ'}
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


            </div>
        </div>
    );
};

export default TicketLookup;
