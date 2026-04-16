import React, { useState, useEffect } from 'react';
import './LoadingOverlay.css';

// Create a simple event-based system to control loading
export const loadingEvent = {
    activeRequests: 0,
    listeners: [],
    subscribe(callback) {
        this.listeners.push(callback);
    },
    unsubscribe(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    },
    show() {
        this.activeRequests++;
        this.notify();
    },
    hide() {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.notify();
    },
    notify() {
        this.listeners.forEach(l => l(this.activeRequests > 0));
    }
};

const LoadingOverlay = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleLoadingChange = (status) => setIsLoading(status);
        loadingEvent.subscribe(handleLoadingChange);
        return () => loadingEvent.unsubscribe(handleLoadingChange);
    }, []);

    if (!isLoading) return null;

    return (
        <div className="global-loading-overlay">
            <div className="loader-container">
                <div className="basic-spinner"></div>
                <div className="loading-text">Đang tải dữ liệu...</div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
