import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../components/Common';

import '../../assets/styles/DriverLayout.css';
import logo from '../../assets/images/logo.webp';

const DriverLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [driverInfo, setDriverInfo] = useState(null);

    React.useEffect(() => {
        const fetchDriverInfo = async () => {
            try {
                const res = await driverService.getAllDrivers();
                const allDrivers = res.data?.data || res.data || [];
                const userEmail = localStorage.getItem('userEmail');
                const myInfo = allDrivers.find(d => d.email === userEmail);
                if (myInfo) setDriverInfo(myInfo);
            } catch (error) {
                console.error("Error fetching driver info in layout", error);
            }
        };
        fetchDriverInfo();
    }, []);

    const handleLogoutConfirm = () => {
        setIsLogoutModalOpen(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('token');
        toast.success('Đăng xuất thành công');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const userEmailFromStorage = localStorage.getItem('userEmail') || 'Tài xế Sông Lam';
    const displayName = driverInfo?.fullName || userEmailFromStorage.split('@')[0];

    const getPageTitle = () => {
        if (isActive('/driver/schedule')) return 'Lịch làm việc';
        if (isActive('/driver/profile') || isActive('/driver/change-password')) return 'Hồ sơ cá nhân';
        return 'Hệ Thống Điều Hành';
    };

    return (
        <div className="driver-layout-container" onClick={() => isProfileDropdownOpen && setIsProfileDropdownOpen(false)}>
            <aside className={`driver-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileSidebarOpen ? 'active-mobile' : ''}`}>
                <div className="driver-sidebar-header">
                    <div className="driver-logo-wrapper">
                        <img src={logo} alt="Logo" className="driver-logo-img" />
                    </div>
                    {!isSidebarCollapsed && (
                        <>
                            <h2 className="driver-brand-name">Đồng Hương Sông Lam Driver</h2>
                            <span className="u-size-11 u-color-slate-400 u-weight-500 u-m-t-4" style={{ letterSpacing: '0.5px' }}>TÀI XẾ CHUYÊN NGHIỆP</span>
                        </>
                    )}
                </div>

                <nav className="driver-nav">
                    <Link 
                        to="/driver/schedule" 
                        className={`driver-nav-item ${isActive('/driver/schedule') ? 'active' : ''}`}
                        onClick={() => setIsMobileSidebarOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {!isSidebarCollapsed && <span>Lịch làm việc</span>}
                    </Link>
                    
                    <Link 
                        to="/driver/profile" 
                        className={`driver-nav-item ${isActive('/driver/profile') ? 'active' : ''}`}
                        onClick={() => setIsMobileSidebarOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {!isSidebarCollapsed && <span>Hồ sơ</span>}
                    </Link>
                </nav>

                <div className="driver-sidebar-footer">
                    <button className="driver-logout-btn" onClick={() => setIsLogoutModalOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        {!isSidebarCollapsed && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {isMobileSidebarOpen && <div className="driver-mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>}

            <main className={`driver-main ${isSidebarCollapsed ? 'expanded' : ''}`}>
                <header className="driver-header">
                    <div className="driver-header-left">
                        <button className="driver-toggle-btn" onClick={(e) => {
                            e.stopPropagation();
                            if (window.innerWidth <= 1024) {
                                setIsMobileSidebarOpen(!isMobileSidebarOpen);
                            } else {
                                setIsSidebarCollapsed(!isSidebarCollapsed);
                            }
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <h1 className="driver-page-title">{getPageTitle()}</h1>
                    </div>
                    <div className="driver-header-right">
                        <button className="driver-toggle-btn" title="Thông báo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </button>
                        <div className="driver-profile-card" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}>
                            <div className="driver-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {driverInfo?.avatarUrl ? (
                                    <img src={driverInfo.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    displayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="driver-user-info">
                                <span className="driver-user-name" style={{ fontWeight: 700, fontSize: '14px' }}>{displayName}</span>
                                <span className="driver-user-role" style={{ fontSize: '11px', opacity: 0.7 }}>Tài xế Đồng Hương Sông Lam</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="driver-content-body">
                    <Outlet />
                </div>
            </main>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
                title="Xác nhận đăng xuất"
                message="Bạn có chắc chắn muốn kết thúc phiên làm việc không?"
                confirmText="Đăng xuất ngay"
            />
        </div>
    );
};

export default DriverLayout;

