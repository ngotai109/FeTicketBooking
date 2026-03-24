import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';

import officeService from '../../services/office.service';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';

const OfficeManagement = () => {
    const [offices, setOffices] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [allWards, setAllWards] = useState([]); // Cache all wards
    const [wards, setWards] = useState([]); // Filtered wards for display
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentOffice, setCurrentOffice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterProvince, setFilterProvince] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [formData, setFormData] = useState({
        officeName: '',
        address: '',
        phoneNumber: '',
        provinceId: '',
        wardId: '',
        isActive: true,
        wardName: '',
        provinceName: ''
    });

    useEffect(() => {
        fetchOffices();
        fetchProvinces();
        fetchAllWards(); // Fetch all wards once
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterProvince]);

    const fetchOffices = async () => {
        try {
            setLoading(true);
            const response = await officeService.getAllOffices();
            setOffices(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách văn phòng');
            setOffices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await provinceService.getAllProvinces();
            setProvinces(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách tỉnh thành');
        }
    };

    const fetchAllWards = async () => {
        try {
            const response = await wardService.getAllWards();
            setAllWards(handleApiResponse(response));
        } catch (error) {
            console.error('Lỗi khi tải danh sách xã/phường:', error);
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

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setFormData({ ...formData, provinceId, wardId: '' });

        if (provinceId) {
            const filteredWards = allWards.filter(w =>
                w.provinceId === parseInt(provinceId) && w.isActive
            );
            setWards(filteredWards);
        } else {
            setWards([]);
        }
    };

    const handleOpenFormModal = (office = null) => {
        if (office) {
            setIsEditing(true);
            setCurrentOffice(office);

            let currentProvinceId = office.provinceId;
            let currentWardId = office.wardId;

            if (!currentProvinceId && currentWardId && allWards.length > 0) {
                const foundWard = allWards.find(w => w.wardId === parseInt(currentWardId));
                if (foundWard) {
                    currentProvinceId = foundWard.provinceId;
                }
            } else if (!currentProvinceId && office.ward?.provinceId) {
                currentProvinceId = office.ward.provinceId;
            }

            if (currentProvinceId) {
                const filteredWards = allWards.filter(w =>
                    w.provinceId === parseInt(currentProvinceId) && (w.isActive || w.wardId === parseInt(currentWardId))
                );
                setWards(filteredWards);
            } else {
                setWards([]);
            }

            setFormData({
                officeName: office.officeName,
                address: office.address,
                phoneNumber: office.phoneNumber || office.phone || '',
                provinceId: currentProvinceId || '',
                wardId: currentWardId || '',
                isActive: office.isActive,
                wardName: getWardName(currentWardId),
                provinceName: getProvinceName(currentProvinceId)
            });
        } else {
            setIsEditing(false);
            setCurrentOffice(null);
            setFormData({
                officeName: '',
                address: '',
                phoneNumber: '',
                provinceId: '',
                wardId: '',
                isActive: true,
                wardName: '',
                provinceName: ''
            });
            setWards([]);
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentOffice(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                officeName: formData.officeName,
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                wardId: parseInt(formData.wardId),
                isActive: formData.isActive
            };

            if (isEditing) {
                await officeService.updateOffice(currentOffice.officeId, payload);
                toast.success('Cập nhật văn phòng thành công');
            } else {
                await officeService.createOffice(payload);
                toast.success('Thêm văn phòng mới thành công');
            }
            await fetchOffices();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu văn phòng');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActiveClick = (office) => {
        setCurrentOffice(office);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            await officeService.toggleActive(currentOffice.officeId);
            toast.success(`${currentOffice.isActive ? 'Khóa' : 'Mở khóa'} văn phòng thành công`);
            await fetchOffices();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredOffices = offices.filter(o => {
        const name = o.officeName || '';
        const address = o.address || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && o.isActive) ||
            (filterStatus === 'inactive' && !o.isActive);

        let officeProvinceId = o.provinceId;
        if (!officeProvinceId && o.wardId) {
            const ward = allWards.find(w => w.wardId === o.wardId);
            officeProvinceId = ward?.provinceId;
        } else if (!officeProvinceId && o.ward?.provinceId) {
            officeProvinceId = o.ward.provinceId;
        }

        const matchesProvince = filterProvince === 'all' ||
            parseInt(officeProvinceId) === parseInt(filterProvince);

        return matchesSearch && matchesStatus && matchesProvince;
    });

    return (
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Quản lý Văn phòng</h1>
                    <p className="admin-header-subtitle">Quản lý các điểm bán vé và đón trả khách</p>
                </div>
                <button
                    className="admin-btn-add"
                    onClick={() => handleOpenFormModal()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Thêm Văn phòng
                </button>
            </header>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                <div className="admin-toolbar" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <div className="search-box u-flex u-align-center" style={{ flex: '1.5', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm văn phòng..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>

                    <CustomSelect
                        value={filterProvince}
                        onChange={(val) => setFilterProvince(val)}
                        options={[
                            { value: 'all', label: 'Tất cả tỉnh thành' },
                            ...provinces.map(p => ({ value: p.provinceId.toString(), label: p.provinceName }))
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
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Tên văn phòng</th>
                                <th>Địa chỉ</th>
                                <th>Địa bàn</th>
                                <th>Số điện thoại</th>
                                <th>Trạng thái</th>
                                <th className="u-text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="u-text-center u-p-40 u-color-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredOffices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="u-text-center u-p-40 u-color-slate-500">
                                        Không tìm thấy văn phòng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOffices.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((office) => (
                                    <tr key={office.officeId}>
                                        <td className="u-weight-600 u-color-slate-800">{office.officeName}</td>
                                        <td className="u-color-slate-600">{office.address}</td>
                                        <td className="u-color-slate-500 u-size-13">
                                            {getWardName(office.wardId)}, {getProvinceName(office.provinceId)}
                                        </td>
                                        <td className="u-weight-600 u-size-14">{office.phoneNumber || office.phone}</td>
                                        <td>
                                            <Badge type={office.isActive ? 'success' : 'danger'}>
                                                {office.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                            </Badge>
                                        </td>
                                        <td className="u-text-center">
                                            <div className="u-flex u-gap-12 u-justify-center">
                                                <button
                                                    onClick={() => handleOpenFormModal(office)}
                                                    className="admin-btn-icon"
                                                    title="Chỉnh sửa"
                                                    style={{ color: '#2b6cb0' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiveClick(office)}
                                                    className="admin-btn-icon"
                                                    title={office.isActive ? 'Khóa văn phòng' : 'Mở văn phòng'}
                                                    style={{ color: office.isActive ? '#e53e3e' : '#38a169' }}
                                                >
                                                    {office.isActive ? (
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
                    totalItems={filteredOffices.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentOffice?.isActive ? 'Khóa văn phòng' : 'Mở khóa văn phòng'}
                message={`Bạn có chắc chắn muốn ${currentOffice?.isActive ? 'khóa' : 'mở khóa'} văn phòng "${currentOffice?.officeName}" không?`}
                confirmText={currentOffice?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentOffice?.isActive}
            />

            {/* Modal Form */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={isEditing ? 'Cập nhật văn phòng' : 'Thêm văn phòng mới'}
                width="550px"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="u-flex-column u-gap-20">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên Văn phòng *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.officeName}
                                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                                required
                                placeholder="Vd: Văn phòng Mỹ Đình"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Địa chỉ chi tiết *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder="Vd: Số 20, đường Phạm Hùng..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Số điện thoại *</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={formData.phoneNumber || formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    required
                                    placeholder="0xxxxxxxxx"
                                />
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

                            <div className="admin-form-group">
                                <label className="admin-form-label">Tỉnh / Thành phố *</label>
                                <select
                                    className="admin-form-select"
                                    value={formData.provinceId}
                                    onChange={handleProvinceChange}
                                    required
                                >
                                    <option value="">-- Chọn Tỉnh/Thành --</option>
                                    {provinces.map(p => (
                                        <option key={p.provinceId} value={p.provinceId}>{p.provinceName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Quận / Huyện / Xã *</label>
                                <select
                                    className="admin-form-select"
                                    value={formData.wardId}
                                    onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                                    required
                                    disabled={!formData.provinceId}
                                >
                                    <option value="">-- Chọn Xã/Phường --</option>
                                    {wards.map(w => (
                                        <option key={w.wardId} value={w.wardId}>{w.wardName}</option>
                                    ))}
                                </select>
                            </div>
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

export default OfficeManagement;
