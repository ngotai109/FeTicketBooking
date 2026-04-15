import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, CustomSelect, Badge, Card, Modal, Pagination, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import busTypeService from '../../services/busType.service';

const BusTypeManagement = () => {
    const [busTypes, setBusTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBusType, setCurrentBusType] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [formData, setFormData] = useState({
        typeName: '',
        defaultSeats: 0,
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchBusTypes();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const fetchBusTypes = async () => {
        try {
            setLoading(true);
            const response = await busTypeService.getAllBusTypes();
            setBusTypes(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách loại xe');
            setBusTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFormModal = (busType = null) => {
        if (busType) {
            setIsEditing(true);
            setCurrentBusType(busType);
            setFormData({
                typeName: busType.typeName,
                defaultSeats: busType.defaultSeats,
                description: busType.description || '',
                isActive: busType.isActive
            });
        } else {
            setIsEditing(false);
            setCurrentBusType(null);
            setFormData({
                typeName: '',
                defaultSeats: 29,
                description: '',
                isActive: true
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentBusType(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const payload = {
                typeName: formData.typeName,
                defaultSeats: parseInt(formData.defaultSeats),
                description: formData.description
            };

            if (isEditing) {
                await busTypeService.updateBusType(currentBusType.busTypeId, payload);
                toast.success('Cập nhật loại xe thành công');
            } else {
                await busTypeService.createBusType(payload);
                toast.success('Thêm loại xe mới thành công');
            }
            await fetchBusTypes();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu loại xe');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActiveClick = (busType) => {
        setCurrentBusType(busType);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            await busTypeService.toggleActive(currentBusType.busTypeId);
            toast.success(`${currentBusType.isActive ? 'Khóa' : 'Mở khóa'} loại xe thành công`);
            await fetchBusTypes();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredBusTypes = busTypes.filter(bt => {
        const matchesSearch = bt.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bt.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && bt.isActive) ||
            (filterStatus === 'inactive' && !bt.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-page-container">
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng Loại Xe</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{busTypes.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{busTypes.filter(bt => bt.isActive).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Dừng hoạt động</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#e53e3e15', color: '#e53e3e' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{busTypes.filter(bt => !bt.isActive).length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tỷ lệ sử dụng</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#805ad515', color: '#805ad5' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">100%</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm loại xe..."
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

                        <div className="u-m-l-auto">
                            <button
                                className="admin-btn-add"
                                onClick={() => handleOpenFormModal()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Thêm Loại Xe
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>ID</th>
                                    <th>Tên Loại Xe</th>
                                    <th>Số Ghế Mặc Định</th>
                                    <th>Mô Tả</th>
                                    <th>Trạng Thái</th>
                                    <th className="u-text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6"><LoadingSpinner message="Đang tải dữ liệu..." /></td></tr>
                                ) : filteredBusTypes.length === 0 ? (
                                    <tr><td colSpan="6" className="u-text-center u-p-40">Không tìm thấy loại xe nào</td></tr>
                                ) : (
                                    filteredBusTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bt) => (
                                        <tr key={bt.busTypeId}>
                                            <td className="u-color-slate-500">#{bt.busTypeId}</td>
                                            <td className="u-weight-600 u-color-slate-800">{bt.typeName}</td>
                                            <td className="u-weight-600">{bt.defaultSeats} ghế</td>
                                            <td className="u-color-slate-600 u-size-13" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {bt.description || 'N/A'}
                                            </td>
                                            <td>
                                                <Badge type={bt.isActive ? 'success' : 'danger'}>
                                                    {bt.isActive ? 'Đang hoạt động' : 'Dừng hoạt động'}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-justify-center u-gap-12">
                                                    <button onClick={() => handleOpenFormModal(bt)} className="admin-btn-icon" title="Chỉnh sửa" style={{ color: '#2b6cb0' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleToggleActiveClick(bt)} className="admin-btn-icon" title={bt.isActive ? 'Khóa' : 'Mở khóa'} style={{ color: bt.isActive ? '#e53e3e' : '#38a169' }}>
                                                        {bt.isActive ? (
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
                    totalItems={filteredBusTypes.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentBusType?.isActive ? 'Khóa loại xe' : 'Mở khóa loại xe'}
                message={`Bạn có chắc chắn muốn ${currentBusType?.isActive ? 'khóa' : 'mở khóa'} loại xe "${currentBusType?.typeName}" không?`}
                confirmText={currentBusType?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentBusType?.isActive}
            />

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={isEditing ? 'Cập nhật loại xe' : 'Thêm loại xe mới'}
                width="500px"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="u-flex-column u-gap-20">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên Loại Xe *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.typeName}
                                onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                                required
                                placeholder="Vd: Giường nằm 40 chỗ"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Số Ghế Mặc Định *</label>
                            <select
                                className="admin-form-input"
                                value={formData.defaultSeats}
                                onChange={(e) => setFormData({ ...formData, defaultSeats: parseInt(e.target.value) })}
                                required
                            >
                                <option value="">-- Chọn số ghế --</option>
                                <option value="16">16 ghế (Transit/Hiace)</option>
                                <option value="22">22 ghế (Limousine Cabin)</option>
                                <option value="34">34 ghế (Limousine Giường)</option>
                                <option value="40">40 ghế (Giường nằm)</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Mô Tả</label>
                            <textarea
                                className="admin-form-input"
                                style={{ minHeight: '100px', paddingTop: '10px' }}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Nhập mô tả về loại xe..."
                            />
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

export default BusTypeManagement;
