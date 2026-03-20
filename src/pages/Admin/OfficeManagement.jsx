import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CustomSelect from '../../components/Common/CustomSelect';
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
    const [isToggling, setIsToggling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    const fetchOffices = async () => {
        try {
            setLoading(true);
            const response = await officeService.getAllOffices();
            console.log('API Response (Offices):', response.data);
            const data = response.data?.data || response.data || [];

            // Log structure to help verify field names
            if (data.length > 0) {
                console.log('Sample Office Object:', data[0]);
            }

            setOffices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Full Error Details:', error);
            if (error.response) {
                console.error('Response Data:', error.response.data);
                console.error('Response Status:', error.response.status);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Request Setup Error:', error.message);
            }
            toast.error('Không thể tải danh sách văn phòng');
            setOffices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await provinceService.getAllProvinces();
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) {
                // Lấy tất cả tỉnh để đảm bảo dữ liệu cũ vẫn hiển thị đúng trong combo box
                setProvinces(data);
            } else {
                setProvinces([]);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách tỉnh thành');
        }
    };

    const fetchAllWards = async () => {
        try {
            const response = await wardService.getAllWards();
            const data = response.data?.data || response.data || [];
            setAllWards(Array.isArray(data) ? data : []);
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
            // Lọc xã phường từ danh sách cache theo provinceId
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

            // Xử lý dữ liệu ban đầu
            let currentProvinceId = office.provinceId;
            let currentWardId = office.wardId;

            // Tìm provinceId từ wardId trong danh sách allWards nếu office.provinceId trống
            if (!currentProvinceId && currentWardId && allWards.length > 0) {
                const foundWard = allWards.find(w => w.wardId === parseInt(currentWardId));
                if (foundWard) {
                    currentProvinceId = foundWard.provinceId;
                }
            } else if (!currentProvinceId && office.ward?.provinceId) {
                currentProvinceId = office.ward.provinceId;
            }

            // Cập nhật danh sách wards theo provinceId tìm được
            // Bao gồm cả ward hiện tại dù nó có đang bị khóa (isActive = false)
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
            await fetchOffices(); // Đợi load lại dữ liệu xong mới đóng modal
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

        // Tìm provinceId của văn phòng (từ data hoặc từ wardId trong cache)
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
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Văn phòng</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Quản lý danh sách các văn phòng đại diện trong hệ thống</p>
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
                    Thêm Văn phòng
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
                    <div className="search-box" style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm văn phòng, địa chỉ..."
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
                        value={filterProvince}
                        onChange={(val) => setFilterProvince(val)}
                        options={[
                            { value: 'all', label: 'Tất cả tỉnh thành' },
                            ...provinces.map(p => ({
                                value: p.provinceId.toString(),
                                label: p.provinceName
                            }))
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
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>ID</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tên Văn phòng</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Địa chỉ</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Điện thoại</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredOffices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Không tìm thấy văn phòng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOffices.map((office) => (
                                    <tr key={office.officeId} style={{ borderBottom: '1px solid #f7fafc', transition: 'background 0.2s', fontSize: '12px' }}>
                                        <td style={{ padding: '8px 12px' }}>{office.officeId}</td>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#2d3748' }}>{office.officeName}</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>
                                            {office.address}
                                            {office.wardName && office.provinceName ? 
                                                `, ${office.wardName}, ${office.provinceName}` : 
                                                (getWardName(office.wardId) ? `, ${getWardName(office.wardId)}, ${getProvinceName(office.provinceId || allWards.find(w => w.wardId === office.wardId)?.provinceId)}` : '')
                                            }
                                        </td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{office.phoneNumber || office.phone}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: office.isActive ? '#e6fffa' : '#fff5f5',
                                                color: office.isActive ? '#38a169' : '#e53e3e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: office.isActive ? '#38a169' : '#e53e3e' }}></span>
                                                {office.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleOpenFormModal(office)}
                                                    style={{
                                                        color: '#4a5568',
                                                        border: '1px solid #e2e8f0',
                                                        background: 'white',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '12px',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiveClick(office)}
                                                    style={{
                                                        color: office.isActive ? '#e53e3e' : '#38a169',
                                                        border: '1px solid currentColor',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '12px',
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        minWidth: '80px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = office.isActive ? '#fff5f5' : '#e6fffa';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    {office.isActive ? 'Khóa' : 'Mở khóa'}
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
                title={currentOffice?.isActive ? 'Khóa văn phòng' : 'Mở khóa văn phòng'}
                message={`Bạn có chắc chắn muốn ${currentOffice?.isActive ? 'khóa' : 'mở khóa'} văn phòng "${currentOffice?.officeName}" không?`}
                confirmText={currentOffice?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentOffice?.isActive}
            />

            {/* Modal thêm/sửa văn phòng */}
            {isFormModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '32px', borderRadius: '16px',
                        width: '550px', maxHeight: '95vh', overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
                                {isEditing ? 'Cập nhật văn phòng' : 'Thêm văn phòng mới'}
                            </h2>
                            <button onClick={handleCloseFormModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Tên Văn phòng *</label>
                                    <input
                                        type="text"
                                        value={formData.officeName}
                                        onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                                        required
                                        className="form-input"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                        placeholder="Vd: Văn phòng Mỹ Đình"
                                    />
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Địa chỉ chi tiết *</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                        className="form-input"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                        placeholder="Vd: Số 20, đường Phạm Hùng..."
                                    />
                                    {(formData.wardId || formData.provinceId) && (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#718096', fontStyle: 'italic' }}>
                                            Địa chỉ đầy đủ: {formData.address}{formData.wardId ? `, ${getWardName(formData.wardId)}` : ''}{formData.provinceId ? `, ${getProvinceName(formData.provinceId)}` : ''}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Số điện thoại *</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                        className="form-input"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                        placeholder="0xxxxxxxxx"
                                    />
                                </div>

                                {isEditing && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Trạng thái</label>
                                        <select
                                            value={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                        >
                                            <option value="true">Đang hoạt động</option>
                                            <option value="false">Ngừng hoạt động</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Tỉnh / Thành phố *</label>
                                    <select
                                        value={formData.provinceId}
                                        onChange={handleProvinceChange}
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                    >
                                        <option value="">-- Chọn Tỉnh/Thành --</option>
                                        {provinces.map(p => (
                                            <option key={p.provinceId} value={p.provinceId}>{p.provinceName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#4a5568' }}>Quận / Huyện / Xã *</label>
                                    <select
                                        value={formData.wardId}
                                        onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                                        required
                                        disabled={!formData.provinceId}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                                    >
                                        <option value="">-- Chọn Xã/Phường --</option>
                                        {wards.map(w => (
                                            <option key={w.wardId} value={w.wardId}>{w.wardName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseFormModal}
                                    style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#4a5568' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', fontWeight: '600', cursor: 'pointer',
                                        opacity: isSubmitting ? 0.7 : 1,
                                        boxShadow: '0 4px 6px -1px rgba(247, 147, 30, 0.2)'
                                    }}
                                >
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

export default OfficeManagement;
