import React, { useState, useEffect } from 'react';
import provinceService from '../../services/province.service';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';



const ProvinceManagement = () => {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [currentProvince, setCurrentProvince] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isToggling, setIsToggling] = useState(false);

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            setLoading(true);
            const response = await provinceService.getAllProvinces();
            setProvinces(handleApiResponse(response));

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
            setIsToggling(true);
            await provinceService.toggleActive(currentProvince.provinceId);
            toast.success(`${currentProvince.isActive ? 'Khóa' : 'Mở khóa'} tỉnh thành thành công`);
            await fetchProvinces();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
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
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Quản lý Tỉnh thành</h1>
                    <p className="admin-header-subtitle">Bật/tắt trạng thái hoạt động của các tỉnh thành trong hệ thống</p>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-toolbar">
                    <div className="search-box" style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tỉnh thành..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Tỉnh thành</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredProvinces.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                        Không tìm thấy tỉnh thành nào
                                    </td>
                                </tr>
                            ) : (
                                filteredProvinces.map((prov) => (
                                    <tr key={prov.provinceId}>
                                        <td>{prov.provinceId}</td>
                                        <td style={{ fontWeight: '600', color: '#2d3748' }}>{prov.provinceName}</td>
                                        <td>
                                            <span className={`status-badge ${prov.isActive ? 'status-active' : 'status-inactive'}`}>
                                                <span className="status-dot" style={{ backgroundColor: 'currentColor' }}></span>
                                                {prov.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleToggleActiveClick(prov)}
                                                style={{
                                                    color: prov.isActive ? '#e53e3e' : '#38a169',
                                                    border: '1px solid currentColor',
                                                    background: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '12px',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    transition: 'all 0.2s'
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
                isLoading={isToggling}
                isDangerous={currentProvince?.isActive}
            />
        </div>
    );

};

export default ProvinceManagement;
