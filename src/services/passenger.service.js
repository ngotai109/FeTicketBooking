import apiService from './api';

const passengerService = {
    getAllPassengers: async () => {
        // This endpoint would return unique users who have the "User" role or are stored from bookings
        return await apiService.get('/User/passengers');
    },

    getPassengerById: async (id) => {
        return await apiService.get(`/User/${id}`);
    },

    toggleLock: async (id) => {
        return await apiService.patch(`/User/${id}/toggle-lock`);
    },

    deletePassenger: async (id) => {
        return await apiService.delete(`/User/${id}`);
    }
};

export default passengerService;
