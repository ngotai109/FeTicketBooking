import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ConfirmationModal, Badge, Card, Modal, Pagination, LoadingSpinner } from '../../components/Common';
import { handleApiResponse } from '../../utils/common';
import driverService from '../../services/driver.service';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDriver, setCurrentDriver] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        licenseNumber: '',
        licenseType: '',
        experienceYears: 0,
        status: 0,
        password: 'Driver@123',
        avatarUrl: ''
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await driverService.getAllDrivers();
            setDrivers(handleApiResponse(response));
        } catch (error) {
            toast.error('Không thể tải danh sách tài xế');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFormModal = (driver = null) => {
        if (driver) {
            setIsEditing(true);
            setCurrentDriver(driver);
            setFormData({
                fullName: driver.fullName,
                email: driver.email,
                phoneNumber: driver.phoneNumber,
                licenseNumber: driver.licenseNumber,
                licenseType: driver.licenseType || '',
                experienceYears: driver.experienceYears,
                status: driver.status,
                password: '',
                avatarUrl: driver.avatarUrl || ''
            });
        } else {
            setIsEditing(false);
            setCurrentDriver(null);
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                licenseNumber: '',
                licenseType: '',
                experienceYears: 0,
                status: 0,
                password: 'Driver@123',
                avatarUrl: ''
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentDriver(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (isEditing) {
                await driverService.updateDriver(currentDriver.driverId, formData);
                toast.success('Cập nhật thông tin tài xế thành công');
            } else {
                await driverService.createDriver(formData);
                toast.success('Thêm tài xế mới thành công!');
            }
            fetchDrivers();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data || 'Có lỗi xảy ra khi lưu thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (driver) => {
        setCurrentDriver(driver);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsSubmitting(true);
            const response = await driverService.deleteDriver(currentDriver.driverId);
            toast.success(handleApiResponse(response)?.message || 'Thao tác thành công');
            fetchDrivers();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thực hiện thao tác');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDrivers = drivers.filter(d => 
        (d.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (d.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (d.licenseNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getStatusType = (status) => {
        switch (status) {
            case 0: return 'success'; // Available
            case 1: return 'warning'; // OnTrip
            case 2: return 'secondary'; // OffDuty
            case 3: return 'danger'; // Retired
            case 4: return 'danger'; // Locked
            default: return 'info';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 0: return 'Sẵn sàng';
            case 1: return 'Đang chạy chuyến';
            case 2: return 'Đang nghỉ';
            case 3: return 'Đã nghỉ việc';
            case 4: return 'Đã khóa';
            default: return 'Không xác định';
        }
    };

    return (
        <div className="admin-page-container">
            <div className="u-flex u-gap-16 u-m-b-20">
                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Tổng số Tài xế</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#3182ce15', color: '#3182ce' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{drivers.length}</div>
                </Card>

                <Card padding="14px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div className="u-flex u-justify-between u-align-start u-m-b-8">
                        <h3 className="u-size-13 u-color-slate-500 u-weight-600 u-m-0">Đang sẵn sàng</h3>
                        <div className="u-flex u-align-center u-justify-center u-rounded-10" style={{ width: '28px', height: '28px', background: '#38a16915', color: '#38a169' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div className="u-size-22 u-weight-700 u-color-slate-800">{drivers.filter(d => d.status === 0).length}</div>
                </Card>
            </div>

            <Card padding="0" className="admin-table-card">
                <div className="table-card-content">
                    <div className="admin-toolbar">
                        <div className="search-box u-flex u-align-center" style={{ flex: '1', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email hoặc bằng lái..."
                                className="admin-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                        </div>

                        <button
                            className="admin-btn-add u-m-l-auto"
                            onClick={() => handleOpenFormModal()}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Thêm Tài xế mới
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Họ và Tên</th>
                                    <th>Liên hệ</th>
                                    <th>Bằng lái</th>
                                    <th>Kinh nghiệm</th>
                                    <th>Trạng thái</th>
                                    <th className="u-text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6"><LoadingSpinner message="Đang tải dữ liệu..." /></td>
                                    </tr>
                                ) : filteredDrivers.length === 0 ? (
                                    <tr><td colSpan="6" className="u-text-center u-p-40">Không tìm thấy tài xế nào</td></tr>
                                ) : (
                                    filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((driver) => (
                                        <tr key={driver.driverId}>
                                            <td>
                                                <div className="u-flex u-align-center u-gap-12">
                                                    <div className="driver-table-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f4f8', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                                        {driver.avatarUrl ? (
                                                            <img src={driver.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span className="u-size-14 u-weight-700 u-color-slate-400">{(driver.fullName?.charAt(0) || 'D').toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="u-weight-600 u-color-slate-800">{driver.fullName}</div>
                                                        <div className="u-size-12 u-color-slate-500">{driver.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="u-color-slate-600">{driver.phoneNumber}</td>
                                            <td>
                                                <div className="u-weight-500">{driver.licenseNumber}</div>
                                                <div className="u-size-12 u-color-slate-500">Hạng: {driver.licenseType}</div>
                                            </td>
                                            <td>{driver.experienceYears} năm</td>
                                            <td>
                                                <Badge type={getStatusType(driver.status)}>
                                                    {getStatusLabel(driver.status)}
                                                </Badge>
                                            </td>
                                            <td className="u-text-center">
                                                <div className="u-flex u-gap-12 u-justify-center">
                                                    <button
                                                        onClick={() => handleOpenFormModal(driver)}
                                                        className="admin-btn-icon"
                                                        title="Chỉnh sửa"
                                                        style={{ color: '#2b6cb0' }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(driver)}
                                                        className="admin-btn-icon"
                                                        title={driver.status === 4 ? "Mở khóa" : "Khóa tài xế"}
                                                        style={{ color: driver.status === 4 ? '#38a169' : '#e53e3e' }}
                                                    >
                                                        {driver.status === 4 ? (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                                        ) : (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
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
                    totalItems={filteredDrivers.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={isEditing ? 'Cập nhật tài xế' : 'Thêm tài xế mới'}
                width="600px"
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="u-grid u-grid-2 u-gap-16">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Họ và Tên *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Email *</label>
                            <input
                                type="email"
                                className="admin-form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isEditing}
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Số điện thoại *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Số Bằng lái *</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Loại bằng (Hạng)</label>
                            <input
                                type="text"
                                className="admin-form-input"
                                value={formData.licenseType}
                                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                                placeholder="VD: Hạng E"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Kinh nghiệm (năm)</label>
                            <input
                                type="number"
                                className="admin-form-input"
                                value={formData.experienceYears}
                                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                            />
                        </div>
                        {!isEditing && (
                            <div className="admin-form-group">
                                <label className="admin-form-label">Mật khẩu mặc định</label>
                                <input
                                    type="text"
                                    className="admin-form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="admin-form-group">
                            <label className="admin-form-label">Trạng thái</label>
                            <select
                                className="admin-form-select"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                            >
                                <option value="0">Sẵn sàng</option>
                                <option value="1">Đang chạy chuyến</option>
                                <option value="2">Đang nghỉ</option>
                                <option value="3">Đã nghỉ việc</option>
                                <option value="4">Đã khóa</option>
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-group u-m-t-16">
                        <label className="admin-form-label">Ảnh đại diện</label>
                        <div className="u-flex u-align-center u-gap-16">
                            <div 
                                className="driver-avatar-upload-preview" 
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '12px', 
                                    background: '#f7fafc', 
                                    border: '2px dashed #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('driver-avatar-input').click()}
                            >
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                )}
                            </div>
                            <div className="u-flex-column u-gap-4">
                                <button 
                                    type="button" 
                                    className="admin-btn-outline u-size-12" 
                                    style={{ padding: '6px 12px' }}
                                    onClick={() => document.getElementById('driver-avatar-input').click()}
                                >
                                    Chọn ảnh
                                </button>
                                <p className="u-size-11 u-color-slate-500">JPG, PNG tối đa 2MB</p>
                            </div>
                            <input 
                                type="file" 
                                id="driver-avatar-input" 
                                hidden 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, avatarUrl: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="admin-form-actions u-m-t-24">
                        <button type="button" className="admin-btn-outline" onClick={handleCloseFormModal}>Hủy</button>
                        <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={currentDriver?.status === 4 ? "Mở khóa tài xế" : "Khóa tài xế"}
                message={currentDriver?.status === 4 
                    ? `Bạn có chắc chắn muốn mở khóa tài xế "${currentDriver?.fullName}"?`
                    : `Bạn có chắc chắn muốn khóa tài xế "${currentDriver?.fullName}"? Tài xế này sẽ không thể đăng nhập hoặc tham gia chuyến đi.`
                }
                confirmText={currentDriver?.status === 4 ? "Mở khóa" : "Khóa"}
                isDangerous={currentDriver?.status !== 4}
                isLoading={isSubmitting}
            />
        </div>
    );
};

export default DriverManagement;
