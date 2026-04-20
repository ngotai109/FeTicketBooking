import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRContext = createContext(null);

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7216'; // Cập nhật port nếu cần

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/notificationHub`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [baseUrl]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to SignalR NotificationHub');

                    connection.on('ReceiveNotification', (notification) => {
                        console.log('New notification:', notification);
                        setNotifications(prev => [notification, ...prev]);
                        setUnreadCount(prev => prev + 1);
                        
                        // Bạn có thể dùng react-toastify ở đây nếu muốn hiện popup nhanh
                        // toast.info(notification.message);
                    });
                })
                .catch(error => console.error('SignalR Connection Error: ', error));

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    const markAsRead = useCallback(() => {
        setUnreadCount(0);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const value = {
        connection,
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );
};
