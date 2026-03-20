import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CustomSelect from '../../components/Common/CustomSelect';
import routeService from '../../services/route.service';
import officeService from '../../services/office.service';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [offices, setOffices] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [allWards, setAllWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoute, setCurrentRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDeparture, setFilterDeparture] = useState('all');
    const [filterArrival, setFilterArrival] = useState('all');
    const [isToggling, setIsToggling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        routeName: '',
        departureOfficeId: '',
        arrivalOfficeId: '',
        basePrice: '',
        distanceKm: '',
        estimatedTimeHours: '',
        isActive: true
    });

    useEffect(() => {
        fetchRoutes();
        fetchOffices();
        fetchProvinces();
        fetchAllWards();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const response = await routeService.getRoutes();
            const data = response.data?.data || response.data || [];
            setRoutes(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách tuyến đường');
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffices = async () => {
        try {
            const response = await officeService.getAllOffices();
            const data = response.data?.data || response.data || [];
            console.log('Offices loaded:', data);
            setOffices(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách văn phòng');
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await provinceService.getAllProvinces();
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) setProvinces(data);
        } catch (error) {
            console.error('Lỗi khi tải tỉnh thành:', error);
        }
    };

    const fetchAllWards = async () => {
        try {
            const response = await wardService.getAllWards();
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) setAllWards(data);
        } catch (error) {
            console.error('Lỗi khi tải xã phường:', error);
        }
    };

    const handleOpenFormModal = (route = null) => {
        if (route) {
            setIsEditing(true);
            setCurrentRoute(route);
            setFormData({
                routeName: route.routeName,
                departureOfficeId: route.departureOfficeId.toString(),
                arrivalOfficeId: route.arrivalOfficeId.toString(),
                basePrice: route.basePrice,
                distanceKm: route.distanceKm,
                estimatedTimeHours: route.estimatedTimeHours,
                isActive: route.isActive
            });
        } else {
            setIsEditing(false);
            setCurrentRoute(null);
            setFormData({
                routeName: '',
                departureOfficeId: '',
                arrivalOfficeId: '',
                basePrice: '',
                distanceKm: '',
                estimatedTimeHours: '',
                isActive: true
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentRoute(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.departureOfficeId === formData.arrivalOfficeId) {
            toast.warning('Điểm khởi hành và điểm đến không được trùng nhau');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                routeName: formData.routeName,
                departureOfficeId: parseInt(formData.departureOfficeId),
                arrivalOfficeId: parseInt(formData.arrivalOfficeId),
                basePrice: parseFloat(formData.basePrice),
                distanceKm: parseFloat(formData.distanceKm),
                estimatedTimeHours: parseInt(formData.estimatedTimeHours),
                isActive: formData.isActive
            };

            if (isEditing) {
                await routeService.updateRoute(currentRoute.routeId, payload);
                toast.success('Cập nhật tuyến đường thành công');
            } else {
                await routeService.createRoute(payload);
                toast.success('Thêm tuyến đường mới thành công');
            }
            fetchRoutes();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tuyến đường');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActiveClick = (route) => {
        setCurrentRoute(route);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        // Assume routeService has a way to toggle status or just use updateRoute
        try {
            setIsToggling(true);
            const payload = { ...currentRoute, isActive: !currentRoute.isActive };
            await routeService.updateRoute(currentRoute.routeId, payload);
            toast.success(`${currentRoute.isActive ? 'Khóa' : 'Mở khóa'} tuyến đường thành công`);
            fetchRoutes();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const getProvinceName = (id) => {
        const province = provinces.find(p => p.provinceId === parseInt(id));
        return province ? province.provinceName : '';
    };

    const getWardName = (id) => {
        const ward = allWards.find(w => w.wardId === parseInt(id));
        return ward ? ward.wardName : '';
    };

    const getFullOfficeDisplayName = (id) => {
        const office = offices.find(o => o.officeId === id);
        if (!office) return 'N/A';
        
        let pName = getProvinceName(office.provinceId);
        let wName = getWardName(office.wardId);
        
        // Nếu office không có trực tiếp provinceId, tìm qua wardId
        if (!pName && office.wardId) {
            const ward = allWards.find(w => w.wardId === office.wardId);
            if (ward) {
                wName = ward.wardName;
                pName = getProvinceName(ward.provinceId);
            }
        }
        
        return `${pName ? pName + ' - ' : ''}${wName ? wName + ' - ' : ''}${office.officeName}`;
    };

    const getOfficeName = (id) => {
        return getFullOfficeDisplayName(id);
    };

    const getGroupedOffices = () => {
        if (!offices.length) return [];
        
        const map = {};
        
        offices.forEach(o => {
            // Xác định Tỉnh cho văn phòng
            let pId = o.provinceId ? parseInt(o.provinceId) : null;
            const ward = allWards.find(w => parseInt(w.wardId) === parseInt(o.wardId));
            if (!pId && ward) pId = parseInt(ward.provinceId);
            
            const province = provinces.find(p => parseInt(p.provinceId) === pId);
            const pName = province ? province.provinceName : (pId ? `Mã tỉnh ${pId}` : 'Văn phòng chưa rõ vùng');
            
            if (!map[pName]) map[pName] = [];
            
            const lowerPName = pName.toLowerCase();
            const isHanoi = lowerPName.includes('hà nội');
            const isNgheAn = lowerPName.includes('nghệ an');
            
            const wName = ward ? ward.wardName : '';
            let label = '';
            
            if (isHanoi) {
                // Nhóm Hà Nội -> Hiện: VP.Nhà xe
                label = o.officeName;
            } else if (isNgheAn) {
                // Nhóm Nghệ An -> Hiện: Tên Xã
                label = wName || o.officeName;
            } else {
                // Các tỉnh khác -> Hiện cả Xã và Văn phòng
                label = `${wName ? wName + ' - ' : ''}${o.officeName}`;
            }
            
            map[pName].push({
                value: o.officeId.toString(),
                label: label
            });
        });
        
        // Chuyển map thành mảng và sắp xếp (Hà Nội, Nghệ An lên đầu)
        return Object.keys(map).sort((a, b) => {
            const aLow = a.toLowerCase();
            const bLow = b.toLowerCase();
            if (aLow.includes('hà nội')) return -1;
            if (bLow.includes('hà nội')) return 1;
            if (aLow.includes('nghệ an')) return -1;
            if (bLow.includes('nghệ an')) return 1;
            return a.localeCompare(b);
        }).map(name => ({
            type: 'group',
            label: name,
            items: map[name]
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredRoutes = routes.filter(r => {
        const name = r.routeName || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && r.isActive) || 
            (filterStatus === 'inactive' && !r.isActive);
        const matchesDeparture = filterDeparture === 'all' || parseInt(r.departureOfficeId) === parseInt(filterDeparture);
        const matchesArrival = filterArrival === 'all' || parseInt(r.arrivalOfficeId) === parseInt(filterArrival);
        
        return matchesSearch && matchesStatus && matchesDeparture && matchesArrival;
    });

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Tuyến đường</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Quản lý danh mục các tuyến xe, giá vé và khoảng cách</p>
                </div>
                <button 
                    className="add-button" 
                    onClick={() => handleOpenFormModal()}
                    style={{
                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 6px rgba(247, 147, 30, 0.3)',
                        fontSize: '13px'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Thêm Tuyến mới
                </button>
            </header>

            <div className="content-card" style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginBottom: '16px', 
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '10px'
                }}>
                    <div className="search-box" style={{ flex: '1.5', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tuyến đường..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '6px 12px 6px 32px', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0', 
                                width: '100%',
                                outline: 'none',
                                fontSize: '12px'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>

                    <CustomSelect
                        value={filterDeparture}
                        onChange={(val) => setFilterDeparture(val)}
                        options={[
                            { value: 'all', label: 'Tất cả điểm đi' },
                            ...getGroupedOffices()
                        ]}
                    />

                    <CustomSelect
                        value={filterArrival}
                        onChange={(val) => setFilterArrival(val)}
                        options={[
                            { value: 'all', label: 'Tất cả điểm đến' },
                            ...getGroupedOffices()
                        ]}
                    />

                    <CustomSelect
                        value={filterStatus}
                        onChange={(val) => setFilterStatus(val)}
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'active', label: 'Đang hoạt động' },
                            { value: 'inactive', label: 'Ngừng hoạt động' }
                        ]}
                    />
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f7fafc' }}>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tên Tuyến</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Văn phòng Đi/Đến</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Giá cơ bản</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Khoảng cách</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Thời gian</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredRoutes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Không tìm thấy tuyến đường nào
                                    </td>
                                </tr>
                            ) : (
                                filteredRoutes.map((route) => (
                                    <tr key={route.routeId} style={{ borderBottom: '1px solid #f7fafc', transition: 'background 0.2s', fontSize: '12px' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#2d3748' }}>{route.routeName}</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: '#38a169', fontSize: '10px' }}>●</span> {getOfficeName(route.departureOfficeId)}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ color: '#e53e3e', fontSize: '10px' }}>●</span> {getOfficeName(route.arrivalOfficeId)}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px 12px', color: '#2d3748', fontWeight: '600' }}>{formatCurrency(route.basePrice)}</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{route.distanceKm} km</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{route.estimatedTimeHours} giờ</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: route.isActive ? '#e6fffa' : '#fff5f5',
                                                color: route.isActive ? '#38a169' : '#e53e3e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: route.isActive ? '#38a169' : '#e53e3e' }}></span>
                                                {route.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleOpenFormModal(route)}
                                                    style={{
                                                        color: '#4a5568', background: 'white', border: '1px solid #e2e8f0',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px'
                                                    }}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiveClick(route)}
                                                    style={{
                                                        color: route.isActive ? '#e53e3e' : '#38a169', background: 'none', border: '1px solid currentColor',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', minWidth: '60px'
                                                    }}
                                                >
                                                    {route.isActive ? 'Khóa' : 'Mở'}
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

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentRoute?.isActive ? 'Khóa tuyến đường' : 'Mở khóa tuyến đường'}
                message={`Bạn có chắc chắn muốn ${currentRoute?.isActive ? 'khóa' : 'mở khóa'} tuyến đường "${currentRoute?.routeName}" không?`}
                confirmText={currentRoute?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentRoute?.isActive}
            />

            {/* Modal Form */}
            {isFormModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ 
                        background: 'white', padding: '32px', borderRadius: '16px', 
                        width: '600px', maxHeight: '95vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{isEditing ? 'Cập nhật tuyến đường' : 'Thêm tuyến mới'}</h2>
                            <button onClick={handleCloseFormModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Tên Tuyến đường *</label>
                                    <input
                                        type="text"
                                        value={formData.routeName}
                                        onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="Ví dụ: Hà Nội - Đà Nẵng"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Văn phòng/Điểm đi *</label>
                                    <select
                                        value={formData.departureOfficeId}
                                        onChange={(e) => setFormData({ ...formData, departureOfficeId: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">-- Chọn điểm đi --</option>
                                        {getGroupedOffices().map(group => (
                                            <optgroup key={group.label} label={group.label}>
                                                {group.items.map(item => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Văn phòng/Điểm đến *</label>
                                    <select
                                        value={formData.arrivalOfficeId}
                                        onChange={(e) => setFormData({ ...formData, arrivalOfficeId: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">-- Chọn điểm đến --</option>
                                        {getGroupedOffices().map(group => (
                                            <optgroup key={group.label} label={group.label}>
                                                {group.items.map(item => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Giá vé cơ bản (VND) *</label>
                                    <input
                                        type="number"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="Vd: 250000"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Khoảng cách (Km) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.distanceKm}
                                        onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="Vd: 350.5"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Thời gian dự kiến (giờ) *</label>
                                    <input
                                        type="number"
                                        value={formData.estimatedTimeHours}
                                        onChange={(e) => setFormData({ ...formData, estimatedTimeHours: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="Vd: 8"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Trạng thái</label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button type="button" onClick={handleCloseFormModal} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600' }}>Hủy</button>
                                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', fontWeight: '600', opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteManagement;
