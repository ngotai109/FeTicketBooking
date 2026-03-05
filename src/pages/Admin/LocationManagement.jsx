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
    const [formData, setFormData] = useState({ locationName: '' });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const data = await locationService.getLocations();
            setLocations(data);
        } catch (error) {
            toast.error('Không thể tải danh sách địa điểm');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (location = null) => {
        if (location) {
            setCurrentLocation(location);
            setFormData({ locationName: location.locationName });
            console.log(location);
        } else {
            setCurrentLocation(null);
            setFormData({ locationName: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ locationName: '' });
        setCurrentLocation(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentLocation) {
                await locationService.updateLocation(currentLocation.locationId, formData);
                toast.success('Cập nhật địa điểm thành công');
            } else {
                await locationService.createLocation(formData);
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

    return (
        <div className="location-management">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Quản lý địa điểm</h1>
                    <p className="header-time">Quản lý các tỉnh thành, địa danh</p>
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
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Đang tải...</td>
                                </tr>
                            ) : locations.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Chưa có dữ liệu</td>
                                </tr>
                            ) : (
                                locations.map((loc) => (
                                    <tr key={loc.locationId} style={{ borderBottom: '1px solid #f7fafc' }}>
                                        <td style={{ padding: '16px' }}>{loc.locationId}</td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{loc.locationName}</td>
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

            {/* simple popup form */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px' }}>
                        <h2 style={{ marginBottom: '24px' }}>{currentLocation ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tên địa điểm</label>
                                <input
                                    type="text"
                                    value={formData.locationName}
                                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    placeholder="Nhập tên địa điểm..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
                                    Lưu
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
                message={`Bạn có chắc chắn muốn xóa địa điểm "${currentLocation?.locationName}" không?`}
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
};

export default LocationManagement;
