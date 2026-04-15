import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';

import busService from '../../services/bus.service';
import busTypeService from '../../services/busType.service';
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
    const [viewingLayoutBus, setViewingLayoutBus] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [busTypes, setBusTypes] = useState([]);
    const [formData, setFormData] = useState({
        plateNumber: '',
        busName: '',
        busTypeId: '',
        status: 0, // Active = 0
    });

    // Remove hardcoded busTypes array

    useEffect(() => {
        fetchBuses();
        fetchBusTypes();
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
            setBuses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBusTypes = async () => {
        try {
            const response = await busTypeService.getAllBusTypes();
            setBusTypes(handleApiResponse(response));
        } catch (error) {
            console.error('Lỗi khi tải loại xe:', error);
        }
    };

    const handleOpenFormModal = (bus = null) => {
        if (bus) {
            setIsEditing(true);
            setCurrentBus(bus);
            setFormData({
                plateNumber: bus.plateNumber,
                busName: bus.busName,
                busTypeId: bus.busTypeId?.toString() || '',
                status: bus.status
            });
        } else {
            setIsEditing(false);
            setCurrentBus(null);
            setFormData({
                plateNumber: '',
                busName: '',
                busTypeId: busTypes.find(t => t.isActive)?.busTypeId.toString() || '',
                status: 0
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

            // Tìm loại xe hiện tại để lấy số ghế mặc định
            const selectedType = busTypes.find(t => t.busTypeId.toString() === formData.busTypeId);
            const defaultSeats = selectedType ? selectedType.defaultSeats : 0;

            // Sơ đồ ghế (vẫn dùng logic cũ nếu layout tồn tại, hoặc map theo số ghế)
            const layout = getBusLayout(defaultSeats.toString());

            const generatedSeats = layout ? [
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
            ] : [];

            const payload = {
                plateNumber: formData.plateNumber,
                busName: formData.busName,
                busTypeId: parseInt(formData.busTypeId),
                status: parseInt(formData.status),
                totalSeats: generatedSeats.length || defaultSeats
            };

            if (isEditing) {
                payload.busId = currentBus.busId;
                await busService.updateBus(currentBus.busId, payload);
                toast.success('Cập nhật phương tiện thành công');
            } else {
                await busService.createBus(payload);
                toast.success('Thêm phương tiện thành công!');
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
            const nextStatusStr = currentBus.status === 0 ? 'InActive' : 'Active'; 
            await busService.toggleStatus(currentBus.busId, nextStatusStr);

            toast.success(`${currentBus.status === 0 ? 'Khóa' : 'Mở khóa'} phương tiện thành công`);
            fetchBuses();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredBuses = buses.filter(b => {
        const matchesSearch = (b.plateNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (b.busName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || b.busTypeId?.toString() === filterType;
        return matchesSearch && matchesType;
    });

    const getBusTypeLabel = (busTypeId) => {
        const type = busTypes.find(t => t.busTypeId === busTypeId);
        return type ? type.typeName : 'Không xác định';
    };

    return (
        <div className="admin-page-container">
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng số Xe</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{buses.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{buses.filter(b => b.status === 0).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang bảo trì</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{buses.filter(b => b.status === 1).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Ngừng hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{buses.filter(b => b.status === 2).length}</div>
                </Card>
            </div>

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
                                ...busTypes.map(t => ({ value: t.busTypeId.toString(), label: t.typeName }))
                            ]}
                        />

                        <button
                            className="admin-btn-add u-m-l-auto"
                            onClick={() => handleOpenFormModal()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Thêm Xe mới
                        </button>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Biển số xe</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Tên xe</th>
                                    <th>Loại xe</th>
                                    <th>Trạng thái</th>
                                    <th className="u-text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && buses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <LoadingSpinner message="Đang tải dữ liệu..." />
                                        </td>
                                    </tr>
                                ) : filteredBuses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="u-text-center u-p-40">Không tìm thấy phương tiện nào</td>
                                    </tr>
                                ) : (
                                    filteredBuses.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bus) => (
                                        <tr key={bus.busId}>
                                            <td className="u-weight-600 u-color-slate-800">{bus.plateNumber}</td>
                                            <td className="u-color-slate-600">{bus.busName}</td>
                                            <td>
                                                <Badge type="info" className="u-size-11 u-weight-600 u-bg-transparent" style={{ border: '1px solid #3182ce', color: '#3182ce' }}>
                                                    {getBusTypeLabel(bus.busTypeId)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge type={bus.status === 0 ? 'success' : (bus.status === 1 ? 'warning' : 'danger')}>
                                                    {bus.status === 0 ? 'Hoạt động' : (bus.status === 1 ? 'Bảo trì' : 'Tạm dừng')}
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
                title={`Sơ đồ ghế: ${viewingLayoutBus?.plateNumber}`}
                width="800px"
            >
                {viewingLayoutBus && (
                    <>
                        {(() => {
                            const layout = getBusLayout(busTypes.find(t => t.busTypeId === viewingLayoutBus.busTypeId)?.defaultSeats || 40);
                            return (
                                <>
                                    <p className="u-size-13 u-color-slate-500 u-m-b-20">{layout.name}</p>

                                    <div className="admin-bus-layout-container u-flex u-gap-40" style={{ justifyContent: 'center' }}>
                                        <div className="admin-floor-section">
                                            <h3 className="admin-floor-title u-size-14 u-weight-700 u-p-b-12 u-text-center">Tầng 1</h3>
                                            <div className="admin-seat-grid" style={{
                                                display: 'grid',
                                                gap: '8px',
                                                gridTemplateColumns: `repeat(${layout.columns}, 45px)`
                                            }}>
                                                {layout.floor1.map(seat => (
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

                                        {layout.floor2 && layout.floor2.length > 0 && (
                                            <div className="admin-floor-section">
                                                <h3 className="admin-floor-title u-size-14 u-weight-700 u-p-b-12 u-text-center">Tầng 2</h3>
                                                <div className="admin-seat-grid" style={{
                                                    display: 'grid',
                                                    gap: '8px',
                                                    gridTemplateColumns: `repeat(${layout.columns}, 45px)`
                                                }}>
                                                    {layout.floor2.map(seat => (
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
                                        )}
                                    </div>

                                    <div className="u-flex u-justify-center u-gap-24 u-m-t-32">
                                        <div className="u-flex u-align-center u-gap-8">
                                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ebf4ff', border: '1px solid #bee3f8' }}></span>
                                            <span className="u-size-12 u-color-slate-600">Tầng 1</span>
                                        </div>
                                        {layout.floor2 && layout.floor2.length > 0 && (
                                            <div className="u-flex u-align-center u-gap-8">
                                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}></span>
                                                <span className="u-size-12 u-color-slate-600">Tầng 2</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </>
                )}
            </Modal>

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentBus?.status === 0 ? 'Khóa phương tiện' : 'Mở khóa phương tiện'}
                message={`Bạn có chắc chắn muốn ${currentBus?.status === 0 ? 'khóa' : 'mở khóa'} xe "${currentBus?.plateNumber}" không?`}
                confirmText={currentBus?.status === 0 ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentBus?.status === 0}
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
                                value={formData.plateNumber}
                                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                                required
                                placeholder="VD: 37B-123.45"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên xe</label>
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
                                value={formData.busTypeId}
                                onChange={(e) => setFormData({ ...formData, busTypeId: e.target.value })}
                                required
                                disabled={isEditing}
                            >
                                <option value="">-- Chọn loại xe --</option>
                                {busTypes.map(t => {
                                    if (!t.isActive && formData.busTypeId !== t.busTypeId.toString()) return null;
                                    return (
                                        <option key={t.busTypeId} value={t.busTypeId.toString()}>
                                            {t.typeName} ({t.defaultSeats} ghế) {!t.isActive ? '- Ngừng hoạt động' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {isEditing && (
                                <span className="u-size-12 u-color-slate-500 u-m-t-4" style={{ display: 'block' }}>
                                    Không thể thay đổi Loại xe để bảo toàn cấu trúc ghế đã tạo.
                                </span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái</label>
                            <select
                                className="admin-form-select"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                            >
                                <option value="0">Đang hoạt động</option>
                                <option value="1">Bảo trì</option>
                                <option value="2">Tạm dừng</option>
                            </select>
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
