import React, { useState, useEffect } from 'react';
import provinceService from '../../services/province.service';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CustomSelect from '../../components/Common/CustomSelect';

const ProvinceManagement = () => {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [currentProvince, setCurrentProvince] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            setLoading(true);
            const response = await provinceService.getAllProvinces();
            const data = response.data?.data || response.data || [];
            setProvinces(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách tỉnh thành');
            setProvinces([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActiveClick = (province) => {
        setCurrentProvince(province);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            await provinceService.toggleActive(currentProvince.provinceId);
            toast.success(`${currentProvince.isActive ? 'Khóa' : 'Mở khóa'} tỉnh thành thành công`);
            fetchProvinces();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        }
    };

    const filteredProvinces = provinces.filter(p => {
        const matchesSearch = p.provinceName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && p.isActive) || 
            (filterStatus === 'inactive' && !p.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Tỉnh thành</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Bật/tắt trạng thái hoạt động của các tỉnh thành trong hệ thống</p>
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
                            placeholder="Tìm kiếm tỉnh thành..."
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
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tên Tỉnh thành</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredProvinces.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                                        Không tìm thấy tỉnh thành nào
                                    </td>
                                </tr>
                            ) : (
                                filteredProvinces.map((prov) => (
                                    <tr key={prov.provinceId} style={{ borderBottom: '1px solid #f7fafc', transition: 'background 0.2s', fontSize: '12px' }}>
                                        <td style={{ padding: '8px 12px' }}>{prov.provinceId}</td>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#2d3748' }}>{prov.provinceName}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: prov.isActive ? '#e6fffa' : '#fff5f5',
                                                color: prov.isActive ? '#38a169' : '#e53e3e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: prov.isActive ? '#38a169' : '#e53e3e' }}></span>
                                                {prov.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleToggleActiveClick(prov)}
                                                style={{
                                                    color: prov.isActive ? '#e53e3e' : '#38a169',
                                                    border: '1px solid currentColor',
                                                    background: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '12px',
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                    minWidth: '85px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = prov.isActive ? '#fff5f5' : '#e6fffa';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {prov.isActive ? 'Khóa' : 'Mở khóa'}
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
                title={currentProvince?.isActive ? 'Khóa tỉnh thành' : 'Mở khóa tỉnh thành'}
                message={`Bạn có chắc chắn muốn ${currentProvince?.isActive ? 'khóa' : 'mở khóa'} tỉnh "${currentProvince?.provinceName}" không?`}
                confirmText={currentProvince?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
            />
        </div>
    );
};

export default ProvinceManagement;
