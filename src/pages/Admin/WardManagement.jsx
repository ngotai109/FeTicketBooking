import React, { useState, useEffect } from 'react';
import wardService from '../../services/ward.service';
import provinceService from '../../services/province.service';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Pagination, LoadingSpinner } from '../../components/Common';
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
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchProvinces();
        fetchWards();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterProvinceId, filterStatus]);

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
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Phường xã</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{wards.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{wards.filter(w => w.isActive).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Dừng hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{wards.filter(w => !w.isActive).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Thuộc Tỉnh/Thành</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{provinces.length}</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box">
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
                                    <th style={{ width: '80px' }}>ID</th>
                                    <th>Tên Phường xã</th>
                                    <th>Thuộc Tỉnh/Thành</th>
                                    <th>Trạng thái</th>
                                    <th className="u-text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5"><LoadingSpinner message="Đang tải dữ liệu..." /></td>
                                    </tr>
                                ) : filteredWards.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="u-text-center u-p-40">Không tìm thấy phường xã nào</td>
                                    </tr>
                                ) : (
                                    filteredWards.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((ward) => (
                                        <tr key={ward.wardId}>
                                            <td className="u-color-slate-500">#{ward.wardId}</td>
                                            <td className="u-weight-600 u-color-slate-800">{ward.wardName}</td>
                                            <td className="u-color-slate-600">{getProvinceName(ward.provinceId)}</td>
                                            <td>
                                                <Badge type={ward.isActive ? 'success' : 'danger'}>
                                                    {ward.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-justify-center">
                                                    <button
                                                        onClick={() => handleToggleActiveClick(ward)}
                                                        className="admin-btn-icon"
                                                        title={ward.isActive ? 'Khóa' : 'Mở khóa'}
                                                        style={{ color: ward.isActive ? '#e53e3e' : '#38a169' }}
                                                    >
                                                        {ward.isActive ? (
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
                    totalItems={filteredWards.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

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
