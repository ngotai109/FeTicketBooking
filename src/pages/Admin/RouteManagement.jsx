import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination, Loading } from '../../components/Common';
import { handleApiResponse, formatCurrency } from '../../utils/common';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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
        fetchInitialData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDeparture, filterArrival]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [routesRes, officesRes, provincesRes, wardsRes] = await Promise.all([
                routeService.getRoutes(),
                officeService.getAllOffices(),
                provinceService.getAllProvinces(),
                wardService.getAllWards()
            ]);

            setRoutes(handleApiResponse(routesRes));
            setOffices(handleApiResponse(officesRes));
            setProvinces(handleApiResponse(provincesRes));
            setAllWards(handleApiResponse(wardsRes));
        } catch (error) {
            toast.error('Không thể tải danh sách dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await routeService.getRoutes();
            setRoutes(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách tuyến đường');
            setRoutes([]);
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
            let pId = o.provinceId ? parseInt(o.provinceId) : null;
            const ward = allWards.find(w => parseInt(w.wardId) === parseInt(o.wardId));
            if (!pId && ward) pId = parseInt(ward.provinceId);

            const province = provinces.find(p => parseInt(p.provinceId) === pId);
            const pName = province ? province.provinceName : (pId ? `Mã tỉnh ${pId}` : 'Văn phòng chưa rõ vùng');

            if (!map[pName]) map[pName] = [];

            // Chỉ hiển thị tên office (không mix ward name)
            const label = o.officeName;

            map[pName].push({
                value: o.officeId.toString(),
                label: label
            });
        });

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
        <div className="admin-page-container">
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Tuyến Đường</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{routes.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{routes.filter(r => r.isActive).length}</div>
                </Card>
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tuyến ngừng hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{routes.filter(r => !r.isActive).length}</div>
                </Card>
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Văn phòng / Điểm</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{offices.length}</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm tuyến đường..."
                                className="admin-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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

                        <button
                            className="admin-btn-add u-m-l-auto"
                            onClick={() => handleOpenFormModal()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Thêm Tuyến mới
                        </button>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto', minHeight: '300px' }}>
                        {loading ? (
                            <Loading />
                        ) : filteredRoutes.length === 0 ? (
                            <div className="u-text-center u-p-40 u-color-slate-500">Không tìm thấy tuyến đường nào</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Tên Tuyến</th>
                                        <th>Văn phòng Đi/Đến</th>
                                        <th>Giá cơ bản</th>
                                        <th>Khoảng cách</th>
                                        <th>Thời gian</th>
                                        <th>Trạng thái</th>
                                        <th className="u-text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((route) => (
                                        <tr key={route.routeId}>
                                            <td className="u-weight-600 u-color-slate-800">{route.routeName}</td>
                                            <td>
                                                <div className="u-flex u-flex-column u-gap-12">
                                                    <div className="u-flex u-align-center u-gap-8 u-size-13">
                                                        <span className="u-color-green" style={{ fontSize: '10px' }}>●</span> {getOfficeName(route.departureOfficeId)}
                                                    </div>
                                                    <div className="u-flex u-align-center u-gap-8 u-size-13">
                                                        <span className="u-color-red" style={{ fontSize: '10px' }}>●</span> {getOfficeName(route.arrivalOfficeId)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="u-weight-600 u-color-slate-800">{formatCurrency(route.basePrice)}</td>
                                            <td className="u-color-slate-600">{route.distanceKm} km</td>
                                            <td className="u-color-slate-600">{route.estimatedTimeHours} giờ</td>
                                            <td>
                                                <Badge type={route.isActive ? 'success' : 'danger'}>
                                                    {route.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-gap-12 u-justify-center">
                                                    <button
                                                        onClick={() => handleOpenFormModal(route)}
                                                        className="admin-btn-icon"
                                                        title="Chỉnh sửa"
                                                        style={{ color: '#2b6cb0' }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActiveClick(route)}
                                                        className="admin-btn-icon"
                                                        title={route.isActive ? 'Khóa tuyến' : 'Mở tuyến'}
                                                        style={{ color: route.isActive ? '#e53e3e' : '#38a169' }}
                                                    >
                                                        {route.isActive ? (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                        ) : (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredRoutes.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

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

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={isEditing ? 'Cập nhật tuyến đường' : 'Thêm tuyến mới'}
                width="600px"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="u-flex-column u-gap-20">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên Tuyến đường *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.routeName}
                                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                required
                                placeholder="Ví dụ: Hà Nội - Đà Nẵng"
                            />
                        </div>

                        <div className="u-flex u-gap-20">
                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Điểm đi *</label>
                                <select
                                    className="admin-form-select"
                                    value={formData.departureOfficeId}
                                    onChange={(e) => setFormData({ ...formData, departureOfficeId: e.target.value })}
                                    required
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

                            <div className="admin-form-group" style={{ flex: 1 }}>
                                <label className="admin-form-label">Điểm đến *</label>
                                <select
                                    className="admin-form-select"
                                    value={formData.arrivalOfficeId}
                                    onChange={(e) => setFormData({ ...formData, arrivalOfficeId: e.target.value })}
                                    required
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
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Giá vé (VND) *</label>
                                <input
                                    type="number"
                                    className="admin-form-input"
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Khoảng cách (Km) *</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="admin-form-input"
                                    value={formData.distanceKm}
                                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Thời gian (giờ) *</label>
                                <input
                                    type="number"
                                    className="admin-form-input"
                                    value={formData.estimatedTimeHours}
                                    onChange={(e) => setFormData({ ...formData, estimatedTimeHours: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái</label>
                            <select
                                className="admin-form-select"
                                value={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                            >
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Ngừng hoạt động</option>
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

export default RouteManagement;
