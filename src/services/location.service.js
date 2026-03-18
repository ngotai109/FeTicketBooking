import apiService from './api';

const locationService = {
    getLocations: async () => {
        return await apiService.get('/Location');
    },

    getLocationById: async (id) => {
        return await apiService.get(`/Location/${id}`);
    },

    createLocation: async (locationData) => {
        return await apiService.post('/Location', locationData);
    },

    updateLocation: async (id, locationData) => {
        return await apiService.put(`/Location/${id}`, locationData);
    },

    deleteLocation: async (id) => {
        return await apiService.delete(`/Location/${id}`);
    }
};

export default locationService;
