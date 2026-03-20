import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../components/Common/ConfirmationModal';
import '../../assets/styles/AdminDashboard.css';
import logo from '../../assets/images/logo.webp';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isRoutesMenuOpen, setIsRoutesMenuOpen] = useState(false);
    const [isVehiclesMenuOpen, setIsVehiclesMenuOpen] = useState(false);
    const [isLocationsMenuOpen, setIsLocationsMenuOpen] = useState(false);
    const [isOfficesMenuOpen, setIsOfficesMenuOpen] = useState(false);
    const [isOperationsMenuOpen, setIsOperationsMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        toast.success('Đăng xuất tài khoản thành công');
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const handleLogoutCancel = () => {
        setIsLogoutModalOpen(false);
    };

    return (
        <div className="admin-dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Đồng Hương Sông Lam Logo" className="sidebar-logo-img" />
                    </div>
                    <h2>Đồng Hương Sông Lam</h2>
                    <p className="sidebar-subtitle">Hệ thống quản trị</p>
                </div>

                <nav className="sidebar-nav">
                    <a href="/admin" className="nav-item active">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Dashboard</span>
                    </a>
                    <div className={`nav-group ${isOperationsMenuOpen ? 'open' : ''}`}>
                        <div
                            className="nav-item nav-item-header"
                            onClick={() => setIsOperationsMenuOpen(!isOperationsMenuOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Điều hành Vận tải</span>
                            <svg
                                className="chevron-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginLeft: 'auto', width: '16px', height: '16px', transition: 'transform 0.3s ease', transform: isOperationsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="submenu" style={{
                            maxHeight: isOperationsMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}>
                            <a href="/admin/schedules" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Lịch trình & Lên chuyến</span>
                            </a>
                            <a href="/admin/trips" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Theo dõi Điều hành xe</span>
                            </a>
                        </div>
                    </div>
                    <div className={`nav-group ${isVehiclesMenuOpen ? 'open' : ''}`}>
                        <div
                            className="nav-item nav-item-header"
                            onClick={() => setIsVehiclesMenuOpen(!isVehiclesMenuOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 14V17C4 18.1046 4.89543 19 6 19H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 14V17C20 18.1046 19.1046 19 18 19H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8" cy="19" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="16" cy="19" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Phương tiện</span>
                            <svg
                                className="chevron-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginLeft: 'auto', width: '16px', height: '16px', transition: 'transform 0.3s ease', transform: isVehiclesMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="submenu" style={{
                            maxHeight: isVehiclesMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}>
                             <a href="/admin/vehicles" className="nav-item submenu-item">
                                 <span style={{ marginLeft: '32px', fontSize: '14px' }}>Quản lý xe</span>
                             </a>
                         </div>
                    </div>

                    <div className={`nav-group ${isRoutesMenuOpen ? 'open' : ''}`}>
                        <div
                            className="nav-item nav-item-header"
                            onClick={() => setIsRoutesMenuOpen(!isRoutesMenuOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Tuyến đường</span>
                            <svg
                                className="chevron-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginLeft: 'auto', width: '16px', height: '16px', transition: 'transform 0.3s ease', transform: isRoutesMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="submenu" style={{
                            maxHeight: isRoutesMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}>
                            <a href="/admin/routes" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Quản lý tuyến</span>
                            </a>
                        </div>
                    </div>

                    <div className={`nav-group ${isLocationsMenuOpen ? 'open' : ''}`}>
                        <div
                            className="nav-item nav-item-header"
                            onClick={() => setIsLocationsMenuOpen(!isLocationsMenuOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Quản lý địa điểm</span>
                            <svg
                                className="chevron-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginLeft: 'auto', width: '16px', height: '16px', transition: 'transform 0.3s ease', transform: isLocationsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="submenu" style={{
                            maxHeight: isLocationsMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}>
                            <a href="/admin/provinces" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Quản lý Tỉnh</span>
                            </a>
                            <a href="/admin/wards" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Quản lý Xã</span>
                            </a>
                        </div>
                    </div>

                    <div className={`nav-group ${isOfficesMenuOpen ? 'open' : ''}`}>
                        <div
                            className="nav-item nav-item-header"
                            onClick={() => setIsOfficesMenuOpen(!isOfficesMenuOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 7V21H21V7L12 3L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Hệ thống văn phòng</span>
                            <svg
                                className="chevron-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ marginLeft: 'auto', width: '16px', height: '16px', transition: 'transform 0.3s ease', transform: isOfficesMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="submenu" style={{
                            maxHeight: isOfficesMenuOpen ? '200px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease'
                        }}>
                            <a href="/admin/offices" className="nav-item submenu-item">
                                <span style={{ marginLeft: '32px', fontSize: '14px' }}>Quản lý văn phòng</span>
                            </a>
                        </div>
                    </div>

                    <a href="#settings" className="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Cài đặt</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="logout-button">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
                title="Đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất không?"
                confirmText="Đăng xuất"
                cancelText="Hủy"
            />
        </div>
    );
};

export default AdminLayout;
