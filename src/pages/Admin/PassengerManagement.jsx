import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, Badge, Card, Modal, Pagination, CustomSelect, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import passengerService from '../../services/passenger.service';

const PassengerManagement = () => {
    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [currentPassenger, setCurrentPassenger] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [passengerHistory, setPassengerHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchPassengers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterMonth]);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            const response = await passengerService.getAllPassengers();
            setPassengers(handleApiResponse(response));
        } catch (error) {
            // Mock data if API is not yet available
            setPassengers([
                { id: '1', fullName: 'Ngô Khắc Tài', phoneNumber: '0832696061', email: 'taitiktok37@gmail.com', totalBookings: 12, totalTickets: 24, totalSpent: 2850000, lastBooking: '2026-03-25', status: 'Active' },
                { id: '2', fullName: 'Nguyễn Văn A', phoneNumber: '0912345678', email: 'vana@gmail.com', totalBookings: 5, totalTickets: 10, totalSpent: 1200000, lastBooking: '2026-03-20', status: 'Active' },
                { id: '3', fullName: 'Trần Thị B', phoneNumber: '0987654321', email: 'thib@yahoo.com', totalBookings: 1, totalTickets: 1, totalSpent: 250000, lastBooking: '2026-02-15', status: 'Locked' },
                { id: '4', fullName: 'Lê Văn C', phoneNumber: '0345678901', email: 'vanc@gmail.com', totalBookings: 8, totalTickets: 12, totalSpent: 1950000, lastBooking: '2026-03-22', status: 'Active' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLockClick = (passenger) => {
        setCurrentPassenger(passenger);
        setIsLockModalOpen(true);
    };

    const handleLockConfirm = async () => {
        try {
            setIsProcessing(true);
            // await passengerService.toggleLock(currentPassenger.id);
            toast.success(`${currentPassenger.status === 'Active' ? 'Khóa' : 'Mở khóa'} hành khách thành công`);
            
            // Mock update local state
            setPassengers(passengers.map(p => 
                p.id === currentPassenger.id 
                ? { ...p, status: p.status === 'Active' ? 'Locked' : 'Active' } 
                : p
            ));
            
            setIsLockModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewHistory = async (passenger) => {
        setCurrentPassenger(passenger);
        setIsHistoryModalOpen(true);
        setIsHistoryLoading(true);
        try {
            const response = await passengerService.getPassengerBookings(passenger.phoneNumber, passenger.fullName);
            setPassengerHistory(handleApiResponse(response) || []);
        } catch (error) {
            toast.error('Lỗi khi tải lịch sử đặt vé');
            setPassengerHistory([]);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const filteredPassengers = passengers.filter(p => {
        const matchesSearch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.phoneNumber?.includes(searchTerm) ||
                             p.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && p.status === 'Active') || 
                             (filterStatus === 'locked' && p.status === 'Locked');
        
        let matchesMonth = true;
        if (filterMonth !== 'all') {
            if (!p.lastBooking) {
                matchesMonth = false;
            } else {
                const bookingMonth = new Date(p.lastBooking).getMonth() + 1;
                matchesMonth = bookingMonth.toString() === filterMonth;
            }
        }

        return matchesSearch && matchesStatus && matchesMonth;
    });

    const totalPassengers = passengers.length;
    
    // Tính hành khách mới (giả sử có trường registrationDate, nếu chưa có ta lọc theo booking gần nhất trong tháng này)
    const newPassengersThisMonth = passengers.filter(p => {
        if (!p.lastBooking) return false;
        const lastBookingDate = new Date(p.lastBooking);
        const now = new Date();
        return lastBookingDate.getMonth() === now.getMonth() && lastBookingDate.getFullYear() === now.getFullYear();
    }).length;

    // Tính số hành khách đang hoạt động
    const activePassengers = passengers.filter(p => p.status === 'Active').length;
    const lockedPassengers = passengers.filter(p => p.status !== 'Active').length;
    
    return (
        <div className="admin-page-container">
            {/* Stats Overview */}
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Hành Khách</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{totalPassengers}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Hành Khách Mới (Tháng)</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{newPassengersThisMonth}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-green-600">{activePassengers}</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Tìm theo tên, SĐT, email..."
                                className="admin-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                        </div>

                        <div className="admin-toolbar-filters u-flex u-gap-12">
                            <CustomSelect 
                                value={filterStatus}
                                onChange={(val) => setFilterStatus(val)}
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Đang hoạt động' },
                                    { value: 'locked', label: 'Bị khóa' }
                                ]}
                            />
                            <CustomSelect 
                                value={filterMonth}
                                onChange={(val) => setFilterMonth(val)}
                                options={[
                                    { value: 'all', label: 'Tất cả các tháng' },
                                    { value: '1', label: 'Tháng 1' },
                                    { value: '2', label: 'Tháng 2' },
                                    { value: '3', label: 'Tháng 3' },
                                    { value: '4', label: 'Tháng 4' },
                                    { value: '5', label: 'Tháng 5' },
                                    { value: '6', label: 'Tháng 6' },
                                    { value: '7', label: 'Tháng 7' },
                                    { value: '8', label: 'Tháng 8' },
                                    { value: '9', label: 'Tháng 9' },
                                    { value: '10', label: 'Tháng 10' },
                                    { value: '11', label: 'Tháng 11' },
                                    { value: '12', label: 'Tháng 12' }
                                ]}
                            />
                        </div>

                        <div className="u-m-l-auto">
                            <button className="admin-btn-excel u-flex u-align-center u-gap-8">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                Xuất Excel
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="u-text-center" style={{ width: '80px' }}>STT</th>
                                    <th>Hành khách</th>
                                    <th>Liên hệ</th>
                                    <th className="u-text-center">Số vé đặt</th>
                                    <th className="u-text-right">Chi tiêu</th>
                                    <th className="u-text-center">Trạng thái</th>
                                    <th className="u-text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7"><LoadingSpinner message="Đang tải dữ liệu..." /></td>
                                    </tr>
                                ) : filteredPassengers.length === 0 ? (
                                    <tr><td colSpan="7" className="u-text-center u-p-40">Không tìm thấy hành khách nào</td></tr>
                                ) : (
                                    filteredPassengers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p, index) => (
                                        <tr key={p.id}>
                                            <td className="u-text-center">
                                                <div className="u-flex u-align-center u-justify-center u-rounded-full u-bg-slate-100 u-color-slate-600 u-weight-700" style={{ width: '30px', height: '30px', fontSize: '13px', margin: '0 auto', border: '1px solid #e2e8f0' }}>
                                                    {(currentPage - 1) * pageSize + index + 1}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="u-flex u-align-center u-gap-12">
                                                    <div className="u-flex-column">
                                                        <span className="u-weight-700 u-color-slate-800" style={{ fontSize: '14.5px' }}>{p.fullName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="u-flex-column">
                                                    <span className="u-size-14 u-color-slate-700 u-weight-600">{p.phoneNumber}</span>
                                                    <span className="u-size-12 u-color-slate-500">{p.email}</span>
                                                </div>
                                            </td>
                                            <td className="u-text-center">
                                                <Badge type="info" style={{ minWidth: '35px' }}>{p.totalTickets}</Badge>
                                            </td>
                                            <td className="u-text-right u-weight-700 u-color-blue-600" style={{ fontSize: '15px' }}>
                                                {p.totalSpent.toLocaleString('vi-VN')} đ
                                            </td>
                                            <td className="u-text-center">
                                                <Badge type={p.status === 'Active' ? 'success' : 'danger'}>
                                                    {p.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-justify-center u-gap-12">
                                                    <button onClick={() => handleViewHistory(p)} className="admin-btn-icon" title="Lịch sử đặt vé" style={{ color: '#3182ce' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                    </button>
                                                    <button onClick={() => handleLockClick(p)} className="admin-btn-icon" title={p.status === 'Active' ? 'Khóa khách hàng' : 'Mở khóa'} style={{ color: p.status === 'Active' ? '#e53e3e' : '#38a169' }}>
                                                        {p.status === 'Active' ? (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                        ) : (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalItems={filteredPassengers.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {/* Lock/Unlock Modal */}
            <ConfirmationModal
                isOpen={isLockModalOpen}
                onClose={() => setIsLockModalOpen(false)}
                onConfirm={handleLockConfirm}
                title={currentPassenger?.status === 'Active' ? 'Khóa hành khách' : 'Mở khóa hành khách'}
                message={`Bạn có chắc chắn muốn ${currentPassenger?.status === 'Active' ? 'khóa' : 'mở khóa'} hành khách "${currentPassenger?.fullName}"?`}
                confirmText={currentPassenger?.status === 'Active' ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isProcessing}
                isDangerous={currentPassenger?.status === 'Active'}
            />

            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Lịch sử đặt vé: ${currentPassenger?.fullName}`}
                width="800px"
            >
                <div className="u-flex-column u-gap-16">
                    <div className="u-flex u-justify-between u-align-center u-p-b-16" style={{ borderBottom: '1px solid #edf2f7' }}>
                        <div className="u-flex-column">
                            <span className="u-size-13 u-color-slate-500">Số điện thoại</span>
                            <span className="u-weight-600">{currentPassenger?.phoneNumber}</span>
                        </div>
                        <div className="u-flex-column u-text-right">
                            <span className="u-size-13 u-color-slate-500">Tổng chi tiêu</span>
                            <span className="u-weight-700 u-color-green-600">{currentPassenger?.totalSpent?.toLocaleString('vi-VN')} đ</span>
                        </div>
                    </div>

                    <div className="table-container" style={{ minHeight: '200px' }}>
                        {isHistoryLoading ? (
                            <div className="u-flex u-justify-center u-p-40">Đang tải lịch sử...</div>
                        ) : passengerHistory.length === 0 ? (
                            <div className="u-flex u-justify-center u-p-40 u-color-slate-400">Không có dữ liệu đặt vé</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mã vé</th>
                                        <th>Ngày đặt</th>
                                        <th>Chuyến đi</th>
                                        <th>Số tiền</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {passengerHistory.map(item => (
                                        <tr key={item.bookingId}>
                                            <td className="u-weight-600">DSL{item.bookingId.toString().padStart(6, '0')}</td>
                                            <td className="u-size-13">{new Date(item.bookingDate).toLocaleDateString('vi-VN')}</td>
                                            <td className="u-size-13">
                                                <div className="u-flex-column">
                                                    <span className="u-weight-500">{item.routeName}</span>
                                                    <span className="u-color-slate-500 u-size-12">{item.departureTime}</span>
                                                </div>
                                            </td>
                                            <td className="u-weight-600">{item.totalPrice.toLocaleString('vi-VN')} đ</td>
                                            <td>
                                                <Badge type={
                                                    item.status === 1 ? 'success' : 
                                                    item.status === 4 ? 'warning' : 
                                                    item.status === 2 ? 'danger' : 'info'
                                                }>
                                                    {item.status === 1 ? 'Thành công' : 
                                                     item.status === 4 ? 'Chờ hủy' : 
                                                     item.status === 2 ? 'Đã hủy' : 'Chờ TT'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="admin-form-actions">
                    <button className="admin-btn-primary" onClick={() => setIsHistoryModalOpen(false)}>Đóng</button>
                </div>
            </Modal>
        </div>
    );
};

export default PassengerManagement;
