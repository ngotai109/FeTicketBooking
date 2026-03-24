/**
 * Common Utility Functions
 */

/**
 * Định dạng tiền tệ VND
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Xử lý dữ liệu trả về từ API (unify data structure)
 * @param {object} response 
 * @param {any} defaultValue 
 * @returns {any}
 */
export const handleApiResponse = (response, defaultValue = []) => {
    const data = response.data?.data || response.data || defaultValue;
    return Array.isArray(data) ? data : (data || defaultValue);
};

/**
 * Định dạng ngày tháng năm (DD/MM/YYYY)
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
};
