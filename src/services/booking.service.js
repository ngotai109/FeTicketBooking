import apiService from './api';

const bookingService = {
    createBooking: async (data) => {
        return await apiService.post('/Booking', data);
    },
    getAllBookings: async () => {
        return await apiService.get('/Booking');
    },
    getUserBookings: async (userId) => {
        return await apiService.get(`/Booking/user/${userId}`);
    },
    getBookingById: async (id) => {
        return await apiService.get(`/Booking/${id}`);
    },
    updateBookingStatus: async (id, status) => {
        return await apiService.patch(`/Booking/${id}/status?status=${status}`);
    },
    getTripSeats: async (tripId) => {
        return await apiService.get(`/Trip/${tripId}/seats`);
    }
};

export default bookingService;
