import React from 'react';
import './Card.css';

const Card = ({ children, className = '', title = '', HeaderAction = null, footer = null, padding = '24px', onClick = null, interactive = false }) => {
    return (
        <div 
            className={`admin-card-base ${interactive ? 'interactive' : ''} ${className}`} 
            onClick={onClick}
            style={{ padding }}
        >
            {(title || HeaderAction) && (
                <div className="admin-card-header">
                    {title && <h3 className="admin-card-title">{title}</h3>}
                    {HeaderAction && <div className="admin-card-action">{HeaderAction}</div>}
                </div>
            )}
            {children}
            {footer && <div className="admin-card-footer">{footer}</div>}
        </div>
    );
};

export default Card;
