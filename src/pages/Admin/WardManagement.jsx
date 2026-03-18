import React, { useState, useEffect } from 'react';
import wardService from '../../services/ward.service';
import provinceService from '../../services/province.service';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CustomSelect from '../../components/Common/CustomSelect';

const WardManagement = () => {
    const [wards, setWards] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [currentWard, setCurrentWard] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProvinceId, setFilterProvinceId] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        fetchProvinces();
        fetchWards();
    }, []);

    const fetchProvinces = async () => {
        try {
            const response = await provinceService.getAllProvinces();
            const data = response.data?.data || response.data || [];
            setProvinces(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách tỉnh');
        }
    };

    const fetchWards = async () => {
        try {
            setLoading(true);
            const response = await wardService.getAllWards();
            const data = response.data?.data || response.data || [];
            setWards(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách phường xã');
            setWards([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActiveClick = (ward) => {
        setCurrentWard(ward);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            await wardService.toggleActive(currentWard.wardId);
            toast.success(`${currentWard.isActive ? 'Khóa' : 'Mở khóa'} phường xã thành công`);
            await fetchWards();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const getProvinceName = (id) => {
        const province = provinces.find(p => p.provinceId === id);
        return province ? province.provinceName : 'Không xác định';
    };

    const filteredWards = wards.filter(w => {
        const matchesSearch = w.wardName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProvince = filterProvinceId === '' || w.provinceId === parseInt(filterProvinceId);
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && w.isActive) || 
            (filterStatus === 'inactive' && !w.isActive);
        return matchesSearch && matchesProvince && matchesStatus;
    });

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Phường xã</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Bật/tắt trạng thái hoạt động của các phường xã, điểm đón trả</p>
                </div>
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
                            placeholder="Tìm kiếm phường xã..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '6px 12px 6px 32px', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0', 
                                width: '100%',
                                transition: 'all 0.2s',
                                outline: 'none',
                                fontSize: '12px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#4299e1';
                                e.target.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        />
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                    </div>

                    <CustomSelect
                        value={filterProvinceId}
                        onChange={(val) => setFilterProvinceId(val)}
                        options={[
                            { value: '', label: 'Tất cả tỉnh thành' },
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
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f7fafc' }}>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>ID</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tên Phường xã</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Thuộc Tỉnh/Thành</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredWards.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                        Không tìm thấy phường xã nào
                                    </td>
                                </tr>
                            ) : (
                                filteredWards.map((ward) => (
                                    <tr key={ward.wardId} style={{ borderBottom: '1px solid #f7fafc', transition: 'background 0.2s', fontSize: '12px' }}>
                                        <td style={{ padding: '8px 12px' }}>{ward.wardId}</td>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#2d3748' }}>{ward.wardName}</td>
                                        <td style={{ padding: '8px 12px', color: '#718096' }}>
                                            {getProvinceName(ward.provinceId)}
                                        </td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: ward.isActive ? '#e6fffa' : '#fff5f5',
                                                color: ward.isActive ? '#38a169' : '#e53e3e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: ward.isActive ? '#38a169' : '#e53e3e' }}></span>
                                                {ward.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleToggleActiveClick(ward)}
                                                style={{
                                                    color: ward.isActive ? '#e53e3e' : '#38a169',
                                                    border: '1px solid currentColor',
                                                    background: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    minWidth: '90px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = ward.isActive ? '#fff5f5' : '#e6fffa';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {ward.isActive ? 'Khóa' : 'Mở khóa'}
                                            </button>
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
                title={currentWard?.isActive ? 'Khóa phường xã' : 'Mở khóa phường xã'}
                message={`Bạn có chắc chắn muốn ${currentWard?.isActive ? 'khóa' : 'mở khóa'} phường xã "${currentWard?.wardName}" không?`}
                confirmText={currentWard?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentWard?.isActive}
            />
        </div>
    );
};

export default WardManagement;
