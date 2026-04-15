import React from 'react';
import './Modal.css';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer, 
    width = '500px', 
    maxWidth,
    zIndex = 1100,
    style = {},
    contentStyle = {},
    padding
}) => {
    if (!isOpen) return null;

    const modalContentStyle = {
        width,
        ...(maxWidth && { maxWidth }),
        ...(padding !== undefined && { padding }),
        ...contentStyle
    };

    return (
        <div className="admin-modal-overlay" style={{ zIndex, ...style }} onClick={onClose}>
            <div 
                className="admin-modal-content" 
                style={modalContentStyle} 
                onClick={e => e.stopPropagation()}
            >
                <div className="admin-modal-header">
                    <div className="admin-modal-title">{title}</div>
                    <button className="admin-modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="admin-modal-body" style={padding !== undefined ? { padding } : {}}>
                    {children}
                </div>
                {footer && (
                    <div className="admin-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
