import React, { useState, useEffect } from 'react';
import locationService from '../../services/location.service';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Pagination, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';

const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    const [formData, setFormData] = useState({ 
        locationName: '', 
        parentId: '', 
        locationType: 1 
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await locationService.getLocations();
            setLocations(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const provinces = locations.filter(loc => !loc.parentId || loc.locationType === 1);

    const handleOpenModal = (location = null) => {
        if (location) {
            setCurrentLocation(location);
            setFormData({ 
                locationName: location.locationName,
                parentId: location.parentId || '',
                locationType: location.locationType || 1
            });
        } else {
            setCurrentLocation(null);
            setFormData({ 
                locationName: '', 
                parentId: '', 
                locationType: 1 
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ locationName: '', parentId: '', locationType: 1 });
        setCurrentLocation(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                ...formData,
                parentId: formData.parentId === '' ? null : parseInt(formData.parentId),
                locationType: parseInt(formData.locationType)
            };

            if (currentLocation) {
                await locationService.updateLocation(currentLocation.locationId, payload);
                toast.success('Cập nhật địa điểm thành công');
            } else {
                await locationService.createLocation(payload);
                toast.success('Thêm địa điểm thành công');
            }
            fetchLocations();
            handleCloseModal();
        } catch (error) {
            toast.error(currentLocation ? 'Lỗi khi cập nhật' : 'Lỗi khi thêm mới');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (location) => {
        setCurrentLocation(location);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await locationService.deleteLocation(currentLocation.locationId);
            toast.success('Xóa địa điểm thành công');
            fetchLocations();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi xóa địa điểm');
        }
    };

    const getParentName = (parentId) => {
        if (!parentId) return '-';
        const parent = locations.find(l => l.locationId === parentId);
        return parent ? parent.locationName : 'Không xác định';
    };

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Quản lý địa điểm (Cũ)</h1>
                    <p className="admin-header-subtitle">Quản lý các tỉnh thành, văn phòng và điểm đón trả</p>
                </div>
                <div className="admin-header-actions">
                    <button onClick={() => handleOpenModal()} className="admin-btn-primary">
                        + Thêm địa điểm
                    </button>
                </div>
            </header>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Tên địa điểm</th>
                                <th>Loại</th>
                                <th>Thuộc tỉnh/thành</th>
                                <th className="u-text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5"><LoadingSpinner message="Đang tải dữ liệu..." /></td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="u-text-center u-p-40">Chưa có dữ liệu</td>
                                </tr>
                            ) : (
                                locations.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((loc) => (
                                    <tr key={loc.locationId}>
                                        <td className="u-color-slate-500">#{loc.locationId}</td>
                                        <td className="u-weight-600 u-color-slate-800">
                                            {loc.parentId ? `|-- ${loc.locationName}` : loc.locationName}
                                        </td>
                                        <td>
                                            <Badge type={loc.locationType === 1 ? 'info' : 'warning'}>
                                                {loc.locationType === 1 ? 'Tỉnh/Thành' : 'Văn phòng/Xã'}
                                            </Badge>
                                        </td>
                                        <td className="u-color-slate-600">{getParentName(loc.parentId)}</td>
                                        <td className="u-text-center">
                                            <div className="u-flex u-gap-12 u-justify-center">
                                                <button
                                                    onClick={() => handleOpenModal(loc)}
                                                    className="admin-btn-icon"
                                                    title="Sửa"
                                                    style={{ color: '#2b6cb0' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(loc)}
                                                    className="admin-btn-icon"
                                                    title="Xóa"
                                                    style={{ color: '#e53e3e' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
                    totalItems={locations.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h3>{currentLocation ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}</h3>
                            <button className="close-button" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Loại địa điểm</label>
                                    <select 
                                        className="admin-input"
                                        value={formData.locationType}
                                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value, parentId: e.target.value === "1" ? "" : formData.parentId })}
                                    >
                                        <option value={1}>Tỉnh / Thành phố</option>
                                        <option value={2}>Văn phòng / Xã / Điểm đón</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tên địa điểm</label>
                                    <input
                                        type="text"
                                        className="admin-input"
                                        value={formData.locationName}
                                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                        required
                                        placeholder="Nhập tên địa điểm (Vd: Hà Nội)..."
                                    />
                                </div>

                                {formData.locationType == 2 && (
                                    <div className="form-group">
                                        <label>Thuộc Tỉnh / Thành phố nào?</label>
                                        <select 
                                            className="admin-input"
                                            value={formData.parentId}
                                            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                            required={formData.locationType == 2}
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map(prov => (
                                                <option key={prov.locationId} value={prov.locationId}>
                                                    {prov.locationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={handleCloseModal} className="modal-btn cancel" disabled={isSubmitting}>Hủy</button>
                                <button type="submit" className="modal-btn confirm success" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : currentLocation ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Xóa địa điểm"
                message={`Bạn có chắc chắn muốn xóa địa điểm "${currentLocation?.locationName}" không? Lưu ý: Nếu xóa tỉnh, các văn phòng trực thuộc có thể bị ảnh hưởng.`}
                confirmText="Xóa"
                cancelText="Hủy"
                isDangerous={true}
            />
        </div>
    );
};

export default LocationManagement;
