import apiService from './api';

const passengerService = {
    getAllPassengers: async () => {
        return await apiService.get('/Booking/passengers');
    },

    getPassengerById: async (id) => {
        return await apiService.get(`/User/${id}`);
    },

    toggleLock: async (id) => {
        return await apiService.patch(`/User/${id}/toggle-lock`);
    },

    deletePassenger: async (id) => {
        return await apiService.delete(`/User/${id}`);
    },
    
    getPassengerBookings: async (phone) => {
        return await apiService.get(`/Booking/passengers/${phone}/bookings`);
    }
};

export default passengerService;
