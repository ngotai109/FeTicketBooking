import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder, style, minWidth = '180px' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Tìm label tương ứng với value (hỗ trợ cả lồng nhau)
    const findLabel = (opts, val) => {
        for (const opt of opts) {
            if (opt.value === val) return opt.label;
            if (opt.type === 'group' && opt.items) {
                const found = findLabel(opt.items, val);
                if (found) return found;
            }
        }
        return null;
    };

    const label = findLabel(options, value) || (placeholder || 'Chọn...');

    // Đóng khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div 
            className="custom-select-container" 
            ref={containerRef} 
            style={{ ...style, minWidth }}
        >
            <div 
                className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
                onClick={handleToggle}
            >
                <div className="custom-select-label">{label}</div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"></path>
                </svg>
            </div>

            {isOpen && (
                <div className="custom-select-dropdown">
                    <div className="custom-select-options">
                        {options.map((option, index) => {
                            if (option.type === 'group') {
                                return (
                                    <div key={index} className="custom-select-group">
                                        <div className="custom-select-group-title">{option.label}</div>
                                        {option.items.map((subOpt, subIndex) => (
                                            <div 
                                                key={`${index}-${subIndex}`} 
                                                className={`custom-select-option ${subOpt.value === value ? 'selected' : ''}`}
                                                onClick={() => handleSelect(subOpt)}
                                                style={{ paddingLeft: '24px' }}
                                            >
                                                {subOpt.label}
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div 
                                    key={index} 
                                    className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
