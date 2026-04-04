import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../components/Common';

import '../../assets/styles/AdminDashboard.css';
import '../../assets/styles/admin-common.css';

import logo from '../../assets/images/logo.webp';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleLogoutClick = () => {
        setIsProfileDropdownOpen(false);
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

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const isActive = (path) => location.pathname === path;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Dashboard';
        if (path.includes('/routes')) return 'Quản lý Tuyến đường';
        if (path.includes('/provinces')) return 'Quản lý Tỉnh/Thành';
        if (path.includes('/wards')) return 'Quản lý Phường/Xã';
        if (path.includes('/offices')) return 'Quản lý Văn phòng';
        if (path.includes('/vehicles')) return 'Quản lý Phương tiện';
        if (path.includes('/bus-types')) return 'Quản lý Loại xe';
        if (path.includes('/passengers')) return 'Quản lý Hành khách';
        if (path.includes('/schedules')) return 'Quản lý chuyến đi';
        if (path.includes('/trips')) return 'Theo dõi Chuyến đi';
        if (path.includes('/cancellation')) return 'Duyệt yêu cầu hủy vé';
        return 'Hệ thống Quản trị';
    };

    const userEmail = localStorage.getItem('userEmail') || 'Admin@gmail.com';

    return (
        <div className={`admin-dashboard ${isSidebarCollapsed ? 'collapsed' : ''}`} onClick={() => isProfileDropdownOpen && setIsProfileDropdownOpen(false)}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="Logo" className="sidebar-logo-img" />
                    </div>
                    {!isSidebarCollapsed && <h2>Đồng Hương Sông Lam</h2>}
                </div>

                <nav className="sidebar-nav">

                    <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`} title="Dashboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        {!isSidebarCollapsed && <span>Dashboard</span>}
                    </Link>
                    <Link to="/admin/trips" className={`nav-item ${isActive('/admin/trips') ? 'active' : ''}`} title="Theo dõi Vận tải">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        {!isSidebarCollapsed && <span>Theo dõi Vận tải</span>}
                    </Link>
                    <Link to="/admin/cancellation" className={`nav-item ${isActive('/admin/cancellation') ? 'active' : ''}`} title="Yêu cầu hủy vé">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                        {!isSidebarCollapsed && <span>Yêu cầu hủy vé</span>}
                    </Link>
                    <Link to="/admin/passengers" className={`nav-item ${isActive('/admin/passengers') ? 'active' : ''}`} title="Hành khách">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        {!isSidebarCollapsed && <span>Quản lý Hành khách</span>}
                    </Link>
                    <Link to="/admin/schedules" className={`nav-item ${isActive('/admin/schedules') ? 'active' : ''}`} title="Quản lý chuyến đi">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {!isSidebarCollapsed && <span>Quản lý chuyến đi</span>}
                    </Link>
                    <Link to="/admin/vehicles" className={`nav-item ${isActive('/admin/vehicles') ? 'active' : ''}`} title="Quản lý Xe">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"></rect><path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path></svg>
                        {!isSidebarCollapsed && <span>Quản lý Xe</span>}
                    </Link>

                    <Link to="/admin/bus-types" className={`nav-item ${isActive('/admin/bus-types') ? 'active' : ''}`} title="Loại xe">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
                        {!isSidebarCollapsed && <span>Quản lý Loại xe</span>}
                    </Link>

                    <Link to="/admin/routes" className={`nav-item ${isActive('/admin/routes') ? 'active' : ''}`} title="Tuyến đường">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {!isSidebarCollapsed && <span>Tuyến đường</span>}
                    </Link>

                    <Link to="/admin/offices" className={`nav-item ${isActive('/admin/offices') ? 'active' : ''}`} title="Văn phòng">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v14h18V7L12 3 3 7z"></path><path d="M9 21v-9h6v9"></path></svg>
                        {!isSidebarCollapsed && <span>Văn phòng</span>}
                    </Link>

                    <Link to="/admin/provinces" className={`nav-item ${isActive('/admin/provinces') ? 'active' : ''}`} title="Quản lý Tỉnh">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {!isSidebarCollapsed && <span>Quản lý Tỉnh</span>}
                    </Link>

                    <Link to="/admin/wards" className={`nav-item ${isActive('/admin/wards') ? 'active' : ''}`} title="Quản lý Xã">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        {!isSidebarCollapsed && <span>Quản lý Xã</span>}
                    </Link>


                </nav>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="top-header-left u-flex u-align-center u-gap-16">
                        <button className="header-icon-btn toggle-sidebar-btn" onClick={(e) => { e.stopPropagation(); toggleSidebar(); }} title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <h1 className="page-title">{getPageTitle()}</h1>
                    </div>
                    <div className="top-header-right">
                        <button className="header-icon-btn" title="Chế độ tối">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                        </button>
                        <button className="header-icon-btn" title="Thông báo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span className="notification-badge"></span>
                        </button>
                        <div className="header-user-profile-container" style={{ position: 'relative' }}>
                            <div className="header-user-profile" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }} title="Tài khoản">
                                <div className="header-user-avatar">
                                    {userEmail.charAt(0).toUpperCase()}
                                </div>
                                <span className="header-user-name">{userEmail.split('@')[0]}</span>
                                <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>

                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <div className="dropdown-item">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        <span>Hồ sơ</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <div className="dropdown-item logout" onClick={handleLogoutClick}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        <span>Đăng xuất</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="page-content-wrapper">
                    <Outlet />
                </div>
            </main>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
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
