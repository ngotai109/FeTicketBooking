import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', message = 'Đang tải dữ liệu...' }) => {
    return (
        <div className="spinner-container">
            <div className={`spinner-ring ${size} ${color}`}>
                <div></div><div></div><div></div><div></div>
            </div>
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
