import React, { useState, useEffect } from 'react';
import locationService from '../../services/location.service';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';

const LocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    
    // Khởi tạo form với các trường mới
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
            const locationData = response.data?.data || response.data || [];
            setLocations(Array.isArray(locationData) ? locationData : []);
        } catch (error) {
            toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    // Lọc danh sách các tỉnh để làm Parent
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
            const payload = {
                ...formData,
                // Chuyển string trống thành null cho backend
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

    // Hàm lấy tên địa điểm cha để hiển thị trên bảng
    const getParentName = (parentId) => {
        if (!parentId) return '-';
        const parent = locations.find(l => l.locationId === parentId);
        return parent ? parent.locationName : 'Không xác định';
    };

    return (
        <div className="location-management">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Quản lý địa điểm</h1>
                    <p className="header-time">Quản lý các tỉnh thành, văn phòng và điểm đón trả</p>
                </div>
            </header>

            <div className="content-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm địa điểm..."
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px' }}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        + Thêm địa điểm
                    </button>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f7fafc' }}>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>ID</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Tên địa điểm</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Loại</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Thuộc tỉnh/thành</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Đang tải...</td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Chưa có dữ liệu</td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.locationId} style={{ borderBottom: '1px solid #f7fafc' }}>
                                        <td style={{ padding: '16px' }}>{loc.locationId}</td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>
                                            {loc.parentId ? `|-- ${loc.locationName}` : <strong>{loc.locationName}</strong>}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '12px',
                                                backgroundColor: loc.locationType === 1 ? '#ebf8ff' : '#fefcbf',
                                                color: loc.locationType === 1 ? '#2b6cb0' : '#b7791f'
                                            }}>
                                                {loc.locationType === 1 ? 'Tỉnh/Thành' : 'Văn phòng/Xã'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>{getParentName(loc.parentId)}</td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenModal(loc)}
                                                style={{ marginRight: '8px', color: '#4facfe', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(loc)}
                                                style={{ color: '#f56565', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '24px' }}>{currentLocation ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Loại địa điểm</label>
                                <select 
                                    value={formData.locationType}
                                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value, parentId: e.target.value === "1" ? "" : formData.parentId })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                >
                                    <option value={1}>Tỉnh / Thành phố</option>
                                    <option value={2}>Văn phòng / Xã / Điểm đón</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tên địa điểm</label>
                                <input
                                    type="text"
                                    value={formData.locationName}
                                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    placeholder="Nhập tên địa điểm (Vd: Hà Nội hoặc VP Mỹ Đình)..."
                                />
                            </div>

                            {formData.locationType == 2 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Thuộc Tỉnh / Thành phố nào?</label>
                                    <select 
                                        value={formData.parentId}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                        required={formData.locationType == 2}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
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

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    {currentLocation ? 'Cập nhật' : 'Thêm mới'}
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
            />
        </div>
    );
};

export default LocationManagement;
