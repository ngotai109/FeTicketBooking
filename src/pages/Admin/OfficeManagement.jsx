import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import CustomSelect from '../../components/Common/CustomSelect';

const OfficeManagement = () => {
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [currentOffice, setCurrentOffice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isToggling, setIsToggling] = useState(false);

    // Dữ liệu mẫu ban đầu
    useEffect(() => {
        // Sau này sẽ gọi API: fetchOffices();
        const mockData = [
            { officeId: 1, officeName: 'Văn phòng Vinh', address: '123 Lê Lợi, TP Vinh', phone: '0238.3.123.456', isActive: true },
            { officeId: 2, officeName: 'Văn phòng Mỹ Đình', address: 'Số 20 Phạm Hùng, Hà Nội', phone: '024.3.789.012', isActive: true },
            { officeId: 3, officeName: 'Văn phòng Nước Ngầm', address: 'Giải Phóng, Hà Nội', phone: '024.3.456.789', isActive: false },
        ];
        setOffices(mockData);
        setLoading(false);
    }, []);

    const handleToggleActiveClick = (office) => {
        setCurrentOffice(office);
        setIsToggleModalOpen(true);
    };

    const handleToggleActiveConfirm = async () => {
        try {
            setIsToggling(true);
            // Giả lập gọi API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedOffices = offices.map(o => 
                o.officeId === currentOffice.officeId ? { ...o, isActive: !o.isActive } : o
            );
            setOffices(updatedOffices);
            
            toast.success(`${currentOffice.isActive ? 'Khóa' : 'Mở khóa'} văn phòng thành công`);
            setIsToggleModalOpen(false);
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setIsToggling(false);
        }
    };

    const filteredOffices = offices.filter(o => {
        const matchesSearch = o.officeName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             o.address?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && o.isActive) || 
            (filterStatus === 'inactive' && !o.isActive);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="location-management">
            <header className="dashboard-header" style={{ marginBottom: '10px', paddingBottom: '6px', borderBottomWidth: '1px' }}>
                <div className="header-left">
                    <h1 style={{ fontSize: '18px', marginBottom: '1px' }}>Quản lý Văn phòng</h1>
                    <p className="header-time" style={{ fontSize: '11px', opacity: 0.8 }}>Quản lý danh sách các văn phòng đại diện trong hệ thống</p>
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
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{office.address}</td>
                                        <td style={{ padding: '8px 12px', color: '#4a5568' }}>{office.phone}</td>
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
                                                    minWidth: '90px',
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
        </div>
    );
};

export default OfficeManagement;
