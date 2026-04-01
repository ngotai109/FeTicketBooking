import apiService from './api';

const dashboardService = {
    getStats: async (month, year) => {
        return await apiService.get('/Dashboard/stats', {
            params: { month, year }
        });
    }
};

export default dashboardService;
