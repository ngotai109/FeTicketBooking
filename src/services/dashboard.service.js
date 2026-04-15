import apiService from './api';

const dashboardService = {
    getStats: async (month, year) => {
        return await apiService.get('/Dashboard/stats', {
            params: { month, year }
        });
    },

    exportRevenue: (month, year) => {
        // Đồng bộ với baseURL từ môi trường hoặc mặc định localhost
        const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7000/api/';
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        window.open(`${baseUrl}/Dashboard/export-revenue?month=${month}&year=${year}`, '_blank');
    }
};

export default dashboardService;
