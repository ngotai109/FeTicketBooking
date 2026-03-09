import React, { useState, useEffect } from 'react';
import routeService from '../../services/route.service';
import locationService from '../../services/location.service';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentRoute, setCurrentRoute] = useState(null);
    const [formData, setFormData] = useState({
        routeName: '',
        departureLocationId: '',
        arrivalLocationId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [routesResponse, locationsResponse] = await Promise.all([
                routeService.getRoutes(),
                locationService.getLocations()
            ]);
            const rData = routesResponse.data?.data || routesResponse.data || [];
            const lData = locationsResponse.data?.data || locationsResponse.data || [];
            setRoutes(Array.isArray(rData) ? rData : []);
            setLocations(Array.isArray(lData) ? lData : []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (route = null) => {
        if (route) {
            setCurrentRoute(route);
            setFormData({
                routeName: route.routeName,
                departureLocationId: route.departureLocationId,
                arrivalLocationId: route.arrivalLocationId
            });
        } else {
            setCurrentRoute(null);
            setFormData({
                routeName: '',
                departureLocationId: '',
                arrivalLocationId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ routeName: '', departureLocationId: '', arrivalLocationId: '' });
        setCurrentRoute(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.departureLocationId === formData.arrivalLocationId) {
            toast.warning('Điểm đi và điểm đến không được trùng nhau');
            return;
        }
        try {
            const dataToSubmit = {
                ...formData,
                departureLocationId: parseInt(formData.departureLocationId),
                arrivalLocationId: parseInt(formData.arrivalLocationId)
            };

            if (currentRoute) {
                await routeService.updateRoute(currentRoute.routeId, dataToSubmit);
                toast.success('Cập nhật tuyến đường thành công');
            } else {
                await routeService.createRoute(dataToSubmit);
                toast.success('Thêm tuyến đường thành công');
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            toast.error(currentRoute ? 'Lỗi khi cập nhật' : 'Lỗi khi thêm mới');
        }
    };

    const handleDeleteClick = (route) => {
        setCurrentRoute(route);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await routeService.deleteRoute(currentRoute.routeId);
            toast.success('Xóa tuyến đường thành công');
            fetchData();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi xóa tuyến đường');
        }
    };

    const getLocationName = (id) => {
        const loc = locations.find(l => l.locationId === id);
        return loc ? loc.locationName : 'N/A';
    };

    return (
        <div className="route-management">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Quản lý tuyến đường</h1>
                    <p className="header-time">Danh sách các tuyến đường hiện có</p>
                </div>
            </header>

            <div className="content-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div className="search-box">
                        <input type="text" placeholder="Tìm kiếm tuyến đường..." style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px' }} />
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
                        + Thêm tuyến mới
                    </button>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f7fafc' }}>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Tên Tuyến</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Điểm Đi</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600' }}>Điểm Đến</th>
                                <th style={{ padding: '12px 16px', color: '#718096', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Đang tải...</td>
                                </tr>
                            ) : routes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Chưa có dữ liệu</td>
                                </tr>
                            ) : (
                                routes.map((route) => (
                                    <tr key={route.routeId} style={{ borderBottom: '1px solid #f7fafc' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{route.routeName}</td>
                                        <td style={{ padding: '16px' }}>{getLocationName(route.departureLocationId)}</td>
                                        <td style={{ padding: '16px' }}>{getLocationName(route.arrivalLocationId)}</td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenModal(route)}
                                                style={{ marginRight: '8px', color: '#4facfe', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(route)}
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
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px' }}>
                        <h2 style={{ marginBottom: '24px' }}>{currentRoute ? 'Cập nhật tuyến đường' : 'Thêm tuyến đường mới'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tên Tuyến Đường</label>
                                <input
                                    type="text"
                                    value={formData.routeName}
                                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    placeholder="Ví dụ: Hà Nội - Hải Phòng"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Điểm Đi</label>
                                    <select
                                        value={formData.departureLocationId}
                                        onChange={(e) => setFormData({ ...formData, departureLocationId: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">Chọn điểm đi</option>
                                        {locations.map(loc => (
                                            <option key={loc.locationId} value={loc.locationId}>{loc.locationName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Điểm Đến</label>
                                    <select
                                        value={formData.arrivalLocationId}
                                        onChange={(e) => setFormData({ ...formData, arrivalLocationId: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">Chọn điểm đến</option>
                                        {locations.map(loc => (
                                            <option key={loc.locationId} value={loc.locationId}>{loc.locationName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={handleCloseModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Hủy</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Xóa tuyến đường"
                message={`Bạn có chắc chắn muốn xóa tuyến đường "${currentRoute?.routeName}" không?`}
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
};

export default RouteManagement;
