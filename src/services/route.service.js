import apiService from './api';

const routeService = {
    getRoutes: async () => {
        return await apiService.get('/Route');
    },

    getRouteById: async (id) => {
        return await apiService.get(`/Route/${id}`);
    },

    createRoute: async (routeData) => {
        return await apiService.post('/Route', routeData);
    },

    updateRoute: async (id, routeData) => {
        return await apiService.put(`/Route/${id}`, routeData);
    },

    deleteRoute: async (id) => {
        return await apiService.remove(`/Route/${id}`);
    }
};

export default routeService;
