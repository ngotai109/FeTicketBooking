import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import busService from '../../services/bus.service';
import { getBusLayout } from '../../constants/busLayouts';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBus, setCurrentBus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [viewingLayoutBus, setViewingLayoutBus] = useState(null);
    const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        licensePlate: '',
        busName: '',
        busType: '40', // Default to 40 beds
        isActive: true,
        description: ''
    });

    const busTypes = [
        { value: '40', label: 'Xe giường nằm (40 giường)' },
        { value: '34', label: 'Xe Limousine (34 giường)' },
        { value: '22', label: 'Xe Limousine Cabin (22 phòng)' }
    ];

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const response = await busService.getAllBuses();
            const data = response.data?.data || response.data || [];
            setBuses(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách phương tiện');
            // Mock data for development if API fails
            setBuses([
                { busId: 1, licensePlate: '37B-123.45', busName: 'Xe 01', busType: '40', isActive: true, description: 'Xe đời mới 2023' },
                { busId: 2, licensePlate: '37B-678.90', busName: 'Xe 02', busType: '34', isActive: true, description: 'Xe Limousine VIP' },
                { busId: 3, licensePlate: '29A-555.55', busName: 'Xe 03', busType: '22', isActive: false, description: 'Đang bảo trì' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFormModal = (bus = null) => {
        if (bus) {
            setIsEditing(true);
            setCurrentBus(bus);
            setFormData({
                licensePlate: bus.licensePlate,
                busName: bus.busName,
                busType: bus.busType.toString(),
                isActive: bus.isActive,
                description: bus.description || ''
            });
        } else {
            setIsEditing(false);
            setCurrentBus(null);
            setFormData({
                licensePlate: '',
                busName: '',
                busType: '40',
                isActive: true,
                description: ''
            });
        }
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setCurrentBus(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            
            // Lấy mẫu sơ đồ ứng với loại xe
            const layout = getBusLayout(formData.busType);
            
            // Tự động tạo danh sách ghế dựa trên sơ đồ mẫu
            const generatedSeats = [
                ...layout.floor1.map(s => ({ 
                    seatNumber: s.seatNumber, 
                    floor: 1, 
                    row: s.row, 
                    column: s.col, 
                    isActive: true 
                })),
                ...layout.floor2.map(s => ({ 
                    seatNumber: s.seatNumber, 
                    floor: 2, 
                    row: s.row, 
                    column: s.col, 
                    isActive: true 
                }))
            ];

            const payload = {
                ...formData,
                busType: parseInt(formData.busType).toString(), // Đảm bảo đúng định dạng string cho backend
                totalSeats: generatedSeats.length,
                seats: isEditing ? undefined : generatedSeats // Chỉ tạo ghế khi thêm mới xe
            };

            if (isEditing) {
                await busService.updateBus(currentBus.busId, payload);
                toast.success('Cập nhật phương tiện thành công');
            } else {
                await busService.createBus(payload);
                toast.success('Thêm phương tiện và khởi tạo sơ đồ ghế thành công!');
            }
            fetchBuses();
            handleCloseFormModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu phương tiện');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActiveClick = (bus) => {
        setCurrentBus(bus);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            // If backend has toggleStatus endpoint
            // await busService.toggleStatus(currentBus.busId);
            
            // Otherwise use updateBus
            const payload = { ...currentBus, isActive: !currentBus.isActive };
            await busService.updateBus(currentBus.busId, payload);
            
            toast.success(`${currentBus.isActive ? 'Khóa' : 'Mở khóa'} phương tiện thành công`);
            fetchBuses();
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredBuses = buses.filter(b => {
        const matchesSearch = b.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.busName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || b.busType.toString() === filterType;
        return matchesSearch && matchesType;
    });

    const getBusTypeLabel = (type) => {
        const busType = busTypes.find(t => t.value === type.toString());
        return busType ? busType.label : `${type} giường`;
    };

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Xe</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Quản lý đội xe, loại giường và trạng thái hoạt động</p>
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
                    Thêm Xe mới
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
                    <div className="search-box" style={{ flex: '1.5', minWidth: '200px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm bằng biển số hoặc tên xe..."
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

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid #e2e8f0', 
                            outline: 'none',
                            fontSize: '12px',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">Tất cả loại xe</option>
                        {busTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #f7fafc' }}>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Biển số xe</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Tên gọi</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Loại xe</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Ghi chú</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', color: '#718096', fontWeight: '600', fontSize: '12px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && buses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredBuses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '12px' }}>
                                        Không tìm thấy phương tiện nào
                                    </td>
                                </tr>
                            ) : (
                                filteredBuses.map((bus) => (
                                    <tr key={bus.busId} style={{ borderBottom: '1px solid #f7fafc', transition: 'background 0.2s', fontSize: '12px' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: '600', color: '#2d3748' }}>{bus.licensePlate}</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{bus.busName}</td>
                                        <td style={{ padding: '8px 12px', color: '#2d3748' }}>
                                            <span style={{ 
                                                backgroundColor: '#ebf4ff', 
                                                color: '#3182ce', 
                                                padding: '2px 8px', 
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {getBusTypeLabel(bus.busType)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', color: '#718096' }}>{bus.description}</td>
                                        <td style={{ padding: '8px 12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                backgroundColor: bus.isActive ? '#e6fffa' : '#fff5f5',
                                                color: bus.isActive ? '#38a169' : '#e53e3e',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '3px'
                                            }}>
                                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: bus.isActive ? '#38a169' : '#e53e3e' }}></span>
                                                {bus.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => {
                                                        setViewingLayoutBus(bus);
                                                        setIsLayoutModalOpen(true);
                                                    }}
                                                    style={{
                                                        color: '#3182ce', background: 'white', border: '1px solid #e2e8f0',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px'
                                                    }}
                                                >
                                                    Sơ đồ
                                                </button>
                                                <button
                                                    onClick={() => handleOpenFormModal(bus)}
                                                    style={{
                                                        color: '#4a5568', background: 'white', border: '1px solid #e2e8f0',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px'
                                                    }}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActiveClick(bus)}
                                                    style={{
                                                        color: bus.isActive ? '#e53e3e' : '#38a169', background: 'none', border: '1px solid currentColor',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', minWidth: '60px'
                                                    }}
                                                >
                                                    {bus.isActive ? 'Khóa' : 'Mở'}
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

            {/* Modal Xem Sơ Đồ */}
            {isLayoutModalOpen && viewingLayoutBus && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div style={{ 
                        background: 'white', padding: '24px', borderRadius: '20px', 
                        width: '800px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Sơ đồ ghế: {viewingLayoutBus.licensePlate}</h2>
                                <p style={{ fontSize: '12px', color: '#718096' }}>{getBusLayout(viewingLayoutBus.busType).name}</p>
                            </div>
                            <button onClick={() => setIsLayoutModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                            {/* Render Tầng 1 */}
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '15px' }}>Tầng 1</h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: `repeat(${getBusLayout(viewingLayoutBus.busType).columns}, 45px)`,
                                    gap: '10px',
                                    padding: '15px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    {/* Backend seats should be used here if available, otherwise use template for preview */}
                                    {getBusLayout(viewingLayoutBus.busType).floor1.map(seat => (
                                        <div key={seat.seatNumber} style={{
                                            gridRow: seat.row + 1,
                                            gridColumn: seat.col + 1,
                                            height: '45px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#ebf4ff',
                                            color: '#3182ce',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            border: '1px solid #bee3f8'
                                        }}>
                                            {seat.seatNumber}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Render Tầng 2 */}
                            <div>
                                <h3 style={{ textAlign: 'center', fontSize: '14px', marginBottom: '15px' }}>Tầng 2</h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: `repeat(${getBusLayout(viewingLayoutBus.busType).columns}, 45px)`,
                                    gap: '10px',
                                    padding: '15px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}>
                                    {getBusLayout(viewingLayoutBus.busType).floor2.map(seat => (
                                        <div key={seat.seatNumber} style={{
                                            gridRow: seat.row + 1,
                                            gridColumn: seat.col + 1,
                                            height: '45px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#fef3c7',
                                            color: '#d97706',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            border: '1px solid #fde68a'
                                        }}>
                                            {seat.seatNumber}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                <div style={{ width: '15px', height: '15px', backgroundColor: '#ebf4ff', borderRadius: '3px', border: '1px solid #bee3f8' }}></div>
                                <span>Tầng 1</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                <div style={{ width: '15px', height: '15px', backgroundColor: '#fef3c7', borderRadius: '3px', border: '1px solid #fde68a' }}></div>
                                <span>Tầng 2</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isToggleModalOpen}
                onClose={() => setIsToggleModalOpen(false)}
                onConfirm={handleToggleActiveConfirm}
                title={currentBus?.isActive ? 'Khóa phương tiện' : 'Mở khóa phương tiện'}
                message={`Bạn có chắc chắn muốn ${currentBus?.isActive ? 'khóa' : 'mở khóa'} xe "${currentBus?.licensePlate}" không?`}
                confirmText={currentBus?.isActive ? 'Khóa' : 'Mở khóa'}
                cancelText="Hủy"
                isLoading={isToggling}
                isDangerous={currentBus?.isActive}
            />

            {/* Modal Form */}
            {isFormModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ 
                        background: 'white', padding: '32px', borderRadius: '16px', 
                        width: '500px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{isEditing ? 'Cập nhật xe' : 'Thêm xe mới'}</h2>
                            <button onClick={handleCloseFormModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Biển số xe *</label>
                                    <input
                                        type="text"
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="VD: 37B-123.45"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Tên xe/Biệt danh</label>
                                    <input
                                        type="text"
                                        value={formData.busName}
                                        onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        placeholder="VD: Xe 01"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Loại xe *</label>
                                    <select
                                        value={formData.busType}
                                        onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        {busTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Trạng thái</label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Tạm dừng</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Ghi chú</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}
                                        placeholder="Thông tin thêm về xe..."
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                                <button type="button" onClick={handleCloseFormModal} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600' }}>Hủy</button>
                                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', fontWeight: '600', opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'Đanh lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusManagement;
