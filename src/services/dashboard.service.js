import apiService from './api';

const dashboardService = {
    getStats: async (month, year) => {
        return await apiService.get('/Dashboard/stats', {
            params: { month, year }
        });
    },

    exportRevenue: (month, year) => {
        // Đồng bộ với baseURL trong api.js (Cổng 7000)
        const baseUrl = 'https://localhost:7000/api';
        window.open(`${baseUrl}/Dashboard/export-revenue?month=${month}&year=${year}`, '_blank');
    }
};

export default dashboardService;
