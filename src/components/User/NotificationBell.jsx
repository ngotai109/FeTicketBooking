import React, { useState, useRef, useEffect } from 'react';
import { useSignalR } from '../../contexts/SignalRContext';
import '../../assets/styles/NotificationBell.css';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead } = useSignalR();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            markAsRead();
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-btn" onClick={toggleDropdown}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Thông báo</h3>
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="notification-empty">Không có thông báo mới</div>
                        ) : (
                            notifications.map((notif, index) => (
                                <div key={index} className="notification-item">
                                    <div className="notification-content">
                                        <p className="notification-message">{notif.message}</p>
                                        <span className="notification-time">
                                            {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
