import React from 'react';
import './LoadingOverlay.css';

const Loading = ({ text = "Đang tải dữ liệu...", minHeight = "200px" }) => {
    return (
        <div className="local-loading-container" style={{ minHeight }}>
            <div className="loader-container">
                <div className="basic-spinner"></div>
                <div className="loading-text">{text}</div>
            </div>
        </div>
    );
};

export default Loading;
