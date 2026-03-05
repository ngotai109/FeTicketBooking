import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminDashboard.css';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        setUserEmail(email || 'Admin');
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const stats = [
        {
            title: 'Tổng vé đã bán',
            value: '1,234',
            change: '+12.5%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#667eea'
        },
        {
            title: 'Doanh thu',
            value: '₫45.2M',
            change: '+8.2%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#f093fb'
        },
        {
            title: 'Người dùng',
            value: '856',
            change: '+23.1%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#4facfe'
        },
        {
            title: 'Chuyến đi',
            value: '42',
            change: '+5.4%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#f5576c'
        }
    ];

    const recentActivities = [
        { action: 'Vé mới được đặt', user: 'Nguyễn Văn A', time: '5 phút trước', type: 'booking' },
        { action: 'Thanh toán thành công', user: 'Trần Thị B', time: '12 phút trước', type: 'payment' },
        { action: 'Người dùng mới đăng ký', user: 'Lê Văn C', time: '25 phút trước', type: 'user' },
        { action: 'Chuyến đi được cập nhật', user: 'Admin', time: '1 giờ trước', type: 'update' },
        { action: 'Vé được hủy', user: 'Phạm Thị D', time: '2 giờ trước', type: 'cancel' }
    ];

    return (
        <>
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Dashboard</h1>
                    <p className="header-time">{currentTime.toLocaleString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
                <div className="header-right">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{userEmail}</span>
                            <span className="user-role">Quản trị viên</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ '--card-color': stat.color }}>
                        <div className="stat-icon">
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <h3>{stat.title}</h3>
                            <div className="stat-value">{stat.value}</div>
                            <div className={`stat-change ${stat.trend}`}>
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{stat.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="activities-section">
                <div className="section-header">
                    <h2>Hoạt động gần đây</h2>
                    <a href="#all-activities" className="view-all">Xem tất cả</a>
                </div>
                <div className="activities-list">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className={`activity-icon ${activity.type}`}>
                                {activity.type === 'booking' && (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                )}
                                {activity.type === 'payment' && (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                )}
                                {activity.type === 'user' && (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M20 8V14M23 11H17M12.5 7C12.5 8.933 10.933 10.5 9 10.5C7.067 10.5 5.5 8.933 5.5 7C5.5 5.067 7.067 3.5 9 3.5C10.933 3.5 12.5 5.067 12.5 7Z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                )}
                                {activity.type === 'update' && (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.5 2V8M21.5 8H15.5M21.5 8L18 4.5C16.7429 3.24286 15.1174 2.43254 13.3654 2.18241C11.6134 1.93228 9.82183 2.25454 8.26005 3.10301C6.69827 3.95148 5.44302 5.28129 4.66815 6.90909C3.89329 8.5369 3.63911 10.3737 3.93853 12.1607C4.23795 13.9478 5.07589 15.5971 6.33615 16.8924C7.59642 18.1877 9.21675 19.0679 10.9896 19.4162C12.7625 19.7645 14.5994 19.5641 16.2501 18.8411C17.9008 18.1182 19.2823 16.9073 20.2 15.38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                                {activity.type === 'cancel' && (
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                            </div>
                            <div className="activity-content">
                                <p className="activity-action">{activity.action}</p>
                                <p className="activity-user">{activity.user}</p>
                            </div>
                            <div className="activity-time">{activity.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default AdminDashboard
