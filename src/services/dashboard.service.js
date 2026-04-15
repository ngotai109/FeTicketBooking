import apiService from './api';

const dashboardService = {
    getStats: async (month, year) => {
        return await apiService.get('/Dashboard/stats', {
            params: { month, year }
        });
    },

    exportRevenue: (month, year) => {
        // Đồng bộ với baseURL từ môi trường
        const baseUrl = import.meta.env.VITE_API_URL.endsWith('/') 
            ? import.meta.env.VITE_API_URL.slice(0, -1) 
            : import.meta.env.VITE_API_URL;
        window.open(`${baseUrl}/Dashboard/export-revenue?month=${month}&year=${year}`, '_blank');
    }
};

export default dashboardService;
