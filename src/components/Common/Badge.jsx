import React from 'react';
import './Badge.css';

const Badge = ({ children, type = 'info', className = '', style = {} }) => {
    return (
        <span 
            className={`admin-badge admin-badge-${type} ${className}`} 
            style={style}
        >
            {children}
        </span>
    );
};

export default Badge;
