import React from 'react';
import './Pagination.css';

const Pagination = ({ 
    currentPage, 
    totalItems, 
    pageSize = 10, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="pagination">
            <div className="pagination-info">
                Hiển thị bản ghi từ <span>{(currentPage - 1) * pageSize + 1}</span> đến <span>{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span>{totalItems}</span>
            </div>
            <div className="pagination-controls">
                <button 
                    className="pagination-btn pagination-nav-btn"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Trước
                </button>
                
                {renderPageNumbers()}
                
                <button 
                    className="pagination-btn pagination-nav-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Sau
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
