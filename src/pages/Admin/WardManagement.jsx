import React, { useState, useEffect } from 'react';
import wardService from '../../services/ward.service';
import provinceService from '../../services/province.service';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';



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
            setProvinces(handleApiResponse(response));

        } catch (error) {
            console.error('Lỗi khi tải danh sách tỉnh');
        }
    };

    const fetchWards = async () => {
        try {
            setLoading(true);
            const response = await wardService.getAllWards();
            setWards(handleApiResponse(response));

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
        <div className="admin-page-container">
            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>Quản lý Phường xã</h1>
                    <p className="admin-header-subtitle">Bật/tắt trạng thái hoạt động của các phường xã, điểm đón trả</p>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-toolbar">
                    <div className="search-box" style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm phường xã..."
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Phường xã</th>
                                <th>Thuộc Tỉnh/Thành</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredWards.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                        Không tìm thấy phường xã nào
                                    </td>
                                </tr>
                            ) : (
                                filteredWards.map((ward) => (
                                    <tr key={ward.wardId}>
                                        <td>{ward.wardId}</td>
                                        <td style={{ fontWeight: '600', color: '#2d3748' }}>{ward.wardName}</td>
                                        <td style={{ color: '#718096' }}>
                                            {getProvinceName(ward.provinceId)}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${ward.isActive ? 'status-active' : 'status-inactive'}`}>
                                                <span className="status-dot" style={{ backgroundColor: 'currentColor' }}></span>
                                                {ward.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-btn-outline"
                                                onClick={() => handleToggleActiveClick(ward)}
                                                style={{
                                                    color: ward.isActive ? '#e53e3e' : '#38a169',
                                                    borderColor: 'currentColor',
                                                    minWidth: '90px',
                                                    justifyContent: 'center'
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
