import apiService from './api';

const driverService = {
    getAllDrivers: async () => {
        return await apiService.get('/Driver');
    },

    getDriverById: async (id) => {
        return await apiService.get(`/Driver/${id}`);
    },

    createDriver: async (data) => {
        return await apiService.post('/Driver', data);
    },

    updateDriver: async (id, data) => {
        return await apiService.put(`/Driver/${id}`, data);
    },

    deleteDriver: async (id) => {
        return await apiService.delete(`/Driver/${id}`);
    },

    getMySchedule: async () => {
        return await apiService.get('/Driver/my-schedule');
    },

    getTripPassengers: async (tripId) => {
        return await apiService.get(`/Driver/my-trips/${tripId}/passengers`);
    }
};

export default driverService;
