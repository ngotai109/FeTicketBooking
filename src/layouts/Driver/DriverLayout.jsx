import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ConfirmationModal } from '../../components/Common';
import driverService from '../../services/driver.service';
import { useSignalR } from '../../contexts/SignalRContext';

import '../../assets/styles/DriverLayout.css';
import logo from '../../assets/images/logo.webp';

const DriverLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
    const [driverInfo, setDriverInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchDriverInfo = async () => {
        try {
            const res = await driverService.getAllDrivers();
            const allDrivers = res.data?.data || res.data || [];
            const userEmail = localStorage.getItem('userEmail');
            const myInfo = allDrivers.find(d => d.email === userEmail);
            if (myInfo) {
                setDriverInfo(myInfo);
                await fetchNotifications();
            }
        } catch (error) {
            console.error("Error fetching driver info in layout", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const [resReqs, resSchedule] = await Promise.all([
                driverService.getLeaveRequests(),
                driverService.getMySchedule()
            ]);

            const reqs = resReqs.data || [];
            const trips = resSchedule.data || [];
            
            const newNotifs = [];
            const seenIds = JSON.parse(localStorage.getItem('seenNotifIds') || '[]');

            // 1. Notifications for Leave Requests (Approved/Rejected)
            reqs.forEach(r => {
                if (r.status !== 'Pending' && r.status !== 0) {
                    const id = `LR-${r.leaveRequestId}-${r.status}`;
                    newNotifs.push({
                        id,
                        title: r.status === 'Approved' || r.status === 1 ? 'Yêu cầu được chấp thuận' : 'Yêu cầu bị từ chối',
                        description: `Ngày nghỉ: ${new Date(r.leaveDate).toLocaleDateString('vi-VN')}. Phản hồi: ${r.adminNote || 'Không có'}`,
                        type: r.status === 'Approved' || r.status === 1 ? 'success' : 'danger',
                        time: r.createdAt || new Date(),
                        isRead: seenIds.includes(id)
                    });
                }
            });

            // 2. Notifications for Upcoming Trips (New)
            trips.forEach(t => {
                const id = `TRIP-${t.tripId}`;
                newNotifs.push({
                    id,
                    title: 'Chuyến xe mới được xếp',
                    description: `Tuyến: ${t.routeName}. Giờ chạy: ${new Date(t.departureTime).toLocaleTimeString('vi-VN')}`,
                    type: 'info',
                    time: t.departureTime,
                    isRead: seenIds.includes(id)
                });
            });

            const sortedNotifs = newNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
            setNotifications(sortedNotifs);
            setUnreadCount(sortedNotifs.filter(n => !n.isRead).length);

        } catch (error) {
            console.error("Notif Error:", error);
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem('seenNotifIds', JSON.stringify(allIds));
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const { notifications: signalRNotifs } = useSignalR();

    useEffect(() => {
        if (signalRNotifs.length > 0) {
            fetchNotifications();
            const lastMsg = signalRNotifs[0].message;
            toast.info(lastMsg, {
                position: "bottom-right",
                icon: "🔔"
            });
        }
    }, [signalRNotifs]);

    useEffect(() => {
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
        if (isActive('/driver/leave-request')) return 'Đổi lịch làm việc';
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
                        to="/driver/leave-request" 
                        className={`driver-nav-item ${isActive('/driver/leave-request') ? 'active' : ''}`}
                        onClick={() => setIsMobileSidebarOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path><path d="M12 8h.01"></path></svg>
                        {!isSidebarCollapsed && <span>Đổi lịch làm việc</span>}
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
                        <div className="driver-notif-container" style={{ position: 'relative' }}>
                            <button 
                                className={`driver-toggle-btn ${unreadCount > 0 ? 'has-notifs' : ''}`} 
                                title="Thông báo"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsNotifDropdownOpen(!isNotifDropdownOpen);
                                    setIsProfileDropdownOpen(false);
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                {unreadCount > 0 && <span className="driver-notif-badge">{unreadCount}</span>}
                            </button>

                            {isNotifDropdownOpen && (
                                <div className="driver-notif-dropdown" onClick={(e) => e.stopPropagation()}>
                                    <div className="notif-dropdown-header">
                                        <h3>Thông báo</h3>
                                        {unreadCount > 0 && <button onClick={markAllAsRead}>Đánh dấu đã đọc</button>}
                                    </div>
                                    <div className="notif-dropdown-list">
                                        {notifications.length === 0 ? (
                                            <div className="notif-empty">Không có thông báo mới</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`notif-item ${n.isRead ? 'read' : 'unread'}`}>
                                                    <div className={`notif-icon-circle ${n.type}`}>
                                                        {n.type === 'success' ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        ) : n.type === 'danger' ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                        )}
                                                    </div>
                                                    <div className="notif-content">
                                                        <div className="notif-title">{n.title}</div>
                                                        <div className="notif-desc">{n.description}</div>
                                                        <div className="notif-time">{new Date(n.time).toLocaleDateString('vi-VN')}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="driver-profile-card" onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsProfileDropdownOpen(!isProfileDropdownOpen);
                            setIsNotifDropdownOpen(false);
                        }}>
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
