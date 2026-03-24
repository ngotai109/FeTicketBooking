import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';

import busService from '../../services/bus.service';
import { getBusLayout } from '../../constants/busLayouts';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBus, setCurrentBus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [formData, setFormData] = useState({
        licensePlate: '',
        busName: '',
        busType: '40', // Default to 40 beds
        isActive: true,
        description: ''
    });

    const busTypes = [
        { value: '40', label: 'Xe giường nằm (40 giường)' },
        { value: '34', label: 'Xe Limousine (34 giường)' },
        { value: '22', label: 'Xe Limousine Cabin (22 phòng)' }
    ];

    useEffect(() => {
        fetchBuses();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const response = await busService.getAllBuses();
            setBuses(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách phương tiện');
            // Mock data for development if API fails
            setBuses([
                { busId: 1, licensePlate: '37B-123.45', busName: 'Xe 01', busType: '40', isActive: true, description: 'Xe đời mới 2023' },
                { busId: 2, licensePlate: '37B-678.90', busName: 'Xe 02', busType: '34', isActive: true, description: 'Xe Limousine VIP' },
                { busId: 3, licensePlate: '29A-555.55', busName: 'Xe 03', busType: '22', isActive: false, description: 'Đang bảo trì' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFormModal = (bus = null) => {
        if (bus) {
            setIsEditing(true);
            setCurrentBus(bus);
            setFormData({
                licensePlate: bus.licensePlate,
                busName: bus.busName,
                busType: bus.busType.toString(),
                isActive: bus.isActive,
                description: bus.description || ''
            });
        } else {
            setIsEditing(false);
            setCurrentBus(null);
            setFormData({
                licensePlate: '',
                busName: '',
                busType: '40',
                isActive: true,
                description: ''
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentBus(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            
            const layout = getBusLayout(formData.busType);
            
            const generatedSeats = [
                ...layout.floor1.map(s => ({ 
                    seatNumber: s.seatNumber, 
                    floor: 1, 
                    row: s.row, 
                    column: s.col, 
                    isActive: true 
                })),
                ...layout.floor2.map(s => ({ 
                    seatNumber: s.seatNumber, 
                    floor: 2, 
                    row: s.row, 
                    column: s.col, 
                    isActive: true 
                }))
            ];

            const payload = {
                ...formData,
                busType: parseInt(formData.busType).toString(),
                totalSeats: generatedSeats.length,
                seats: isEditing ? undefined : generatedSeats
            };

            if (isEditing) {
                await busService.updateBus(currentBus.busId, payload);
                toast.success('Cập nhật phương tiện thành công');
            } else {
                await busService.createBus(payload);
                toast.success('Thêm phương tiện và khởi tạo sơ đồ ghế thành công!');
            }
            fetchBuses();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu phương tiện');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActiveClick = (bus) => {
        setCurrentBus(bus);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            const payload = { ...currentBus, isActive: !currentBus.isActive };
            await busService.updateBus(currentBus.busId, payload);
            
            toast.success(`${currentBus.isActive ? 'Khóa' : 'Mở khóa'} phương tiện thành công`);
            fetchBuses();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredBuses = buses.filter(b => {
        const matchesSearch = b.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.busName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || b.busType.toString() === filterType;
        return matchesSearch && matchesType;
    });

    const getBusTypeLabel = (type) => {
        const busType = busTypes.find(t => t.value === type.toString());
        return busType ? busType.label : `${type} giường`;
    };

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Quản lý Xe</h1>
                    <p className="admin-header-subtitle">Quản lý đội xe, loại giường và trạng thái hoạt động</p>
                </div>
                <button 
                    className="admin-btn-add" 
                    onClick={() => handleOpenFormModal()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Thêm Xe mới
                </button>
            </header>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                <div className="admin-toolbar" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <div className="search-box u-flex u-align-center" style={{ flex: '1.5', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm bằng biển số hoặc tên xe..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>

                    <CustomSelect
                        value={filterType}
                        onChange={(val) => setFilterType(val)}
                        options={[
                            { value: 'all', label: 'Tất cả loại xe' },
                            ...busTypes
                        ]}
                    />
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Biển số xe</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Tên gọi</th>
                                <th>Loại xe</th>
                                <th>Ghi chú</th>
                                <th>Trạng thái</th>
                                <th className="u-text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && buses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="u-text-center u-p-40">Đang tải dữ liệu...</td>
                                </tr>
                            ) : filteredBuses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="u-text-center u-p-40">Không tìm thấy phương tiện nào</td>
                                </tr>
                            ) : (
                                filteredBuses.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bus) => (
                                    <tr key={bus.busId}>
                                        <td className="u-weight-600 u-color-slate-800">{bus.licensePlate}</td>
                                        <td className="u-color-slate-600">{bus.busName}</td>
                                        <td>
                                            <Badge type="info" className="u-size-11 u-weight-600 u-bg-transparent" style={{ border: '1px solid #3182ce', color: '#3182ce' }}>
                                                {getBusTypeLabel(bus.busType)}
                                            </Badge>
                                        </td>
                                        <td className="u-color-slate-500 u-size-13">{bus.description}</td>
                                        <td>
                                            <Badge type={bus.isActive ? 'success' : 'danger'}>
                                                {bus.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </Badge>
                                        </td>
                                        <td className="u-text-center">
                                            <div className="u-flex u-gap-12 u-justify-center">
                                                <button
                                                    onClick={() => {
                                                        setViewingLayoutBus(bus);
                                                        setIsLayoutModalOpen(true);
                                                    }}
                                                    className="admin-btn-icon"
                                                    title="Xem sơ đồ"
                                                    style={{ color: '#3182ce' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenFormModal(bus)} 
                                                    className="admin-btn-icon"
                                                    title="Chỉnh sửa"
                                                    style={{ color: '#2b6cb0' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiveClick(bus)}
                                                    className="admin-btn-icon"
                                                    title={bus.isActive ? 'Khóa xe' : 'Mở xe'}
                                                    style={{ color: bus.isActive ? '#e53e3e' : '#38a169' }}
                                                >
                                                    {bus.isActive ? (
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
                    totalItems={filteredBuses.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <Modal
                isOpen={isLayoutModalOpen}
                onClose={() => setIsLayoutModalOpen(false)}
                title={`Sơ đồ ghế: ${viewingLayoutBus?.licensePlate}`}
                width="800px"
            >
                {viewingLayoutBus && (
                    <>
                        <p className="u-size-13 u-color-slate-500 u-m-b-20">{getBusLayout(viewingLayoutBus.busType).name}</p>
                        
                        <div className="admin-bus-layout-container u-flex u-gap-40" style={{ justifyContent: 'center' }}>
                            <div className="admin-floor-section">
                                <h3 className="admin-floor-title u-size-14 u-weight-700 u-p-b-12 u-text-center">Tầng 1</h3>
                                <div className="admin-seat-grid" style={{ 
                                    display: 'grid',
                                    gap: '8px',
                                    gridTemplateColumns: `repeat(${getBusLayout(viewingLayoutBus.busType).columns}, 45px)` 
                                }}>
                                    {getBusLayout(viewingLayoutBus.busType).floor1.map(seat => (
                                        <div key={seat.seatNumber} className="admin-seat-item floor-1 u-flex u-align-center u-justify-center u-size-11 u-weight-600" style={{ 
                                            gridRow: seat.row + 1, 
                                            gridColumn: seat.col + 1,
                                            width: '45px',
                                            height: '45px',
                                            background: '#ebf4ff',
                                            border: '1px solid #bee3f8',
                                            borderRadius: '6px'
                                        }}>
                                            {seat.seatNumber}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-floor-section">
                                <h3 className="admin-floor-title u-size-14 u-weight-700 u-p-b-12 u-text-center">Tầng 2</h3>
                                <div className="admin-seat-grid" style={{ 
                                    display: 'grid',
                                    gap: '8px',
                                    gridTemplateColumns: `repeat(${getBusLayout(viewingLayoutBus.busType).columns}, 45px)` 
                                }}>
                                    {getBusLayout(viewingLayoutBus.busType).floor2.map(seat => (
                                        <div key={seat.seatNumber} className="admin-seat-item floor-2 u-flex u-align-center u-justify-center u-size-11 u-weight-600" style={{ 
                                            gridRow: seat.row + 1, 
                                            gridColumn: seat.col + 1,
                                            width: '45px',
                                            height: '45px',
                                            background: '#fef3c7',
                                            border: '1px solid #fde68a',
                                            borderRadius: '6px'
                                        }}>
                                            {seat.seatNumber}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="u-flex u-justify-center u-gap-24 u-m-t-32">
                            <div className="u-flex u-align-center u-gap-8">
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ebf4ff', border: '1px solid #bee3f8' }}></span>
                                <span className="u-size-12 u-color-slate-600">Tầng 1</span>
                            </div>
                            <div className="u-flex u-align-center u-gap-8">
                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}></span>
                                <span className="u-size-12 u-color-slate-600">Tầng 2</span>
                            </div>
                        </div>
                    </>
                )}
            </Modal>

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentBus?.isActive ? 'Khóa phương tiện' : 'Mở khóa phương tiện'}
                message={`Bạn có chắc chắn muốn ${currentBus?.isActive ? 'khóa' : 'mở khóa'} xe "${currentBus?.licensePlate}" không?`}
                confirmText={currentBus?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentBus?.isActive}
            />

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={isEditing ? 'Cập nhật xe' : 'Thêm xe mới'}
                width="500px"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="u-flex-column u-gap-16">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Biển số xe *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.licensePlate}
                                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                required
                                placeholder="VD: 37B-123.45"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên xe/Biệt danh</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.busName}
                                onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                                placeholder="VD: Xe 01"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Loại xe *</label>
                            <select
                                className="admin-form-select"
                                value={formData.busType}
                                onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                                required
                            >
                                {busTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái</label>
                            <select
                                className="admin-form-select"
                                value={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                            >
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Tạm dừng</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Ghi chú</label>
                            <textarea
                                className="admin-form-textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ minHeight: '80px' }}
                                placeholder="Thông tin thêm về xe..."
                            />
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn-outline" onClick={handleCloseFormModal}>Hủy</button>
                        <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BusManagement;
