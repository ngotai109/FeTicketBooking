import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, width = '500px', zIndex = 1100 }) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay" style={{ zIndex }} onClick={onClose}>
            <div 
                className="admin-modal-content" 
                style={{ width }} 
                onClick={e => e.stopPropagation()}
            >
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">{title}</h2>
                    <button className="admin-modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="admin-modal-body">
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
