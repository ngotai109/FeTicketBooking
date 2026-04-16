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
    getBookingById: async (id, config = {}) => {
        return await apiService.get(`/Booking/${id}`, config);
    },
    updateBookingStatus: async (id, status) => {
        return await apiService.patch(`/Booking/${id}/status?status=${status}`);
    },
    getTripSeats: async (tripId, config = {}) => {
        return await apiService.get(`/Trip/${tripId}/seats`, config);
    },
    lookupTicket: async (code, phone) => {
        return await apiService.get(`/Booking/lookup?code=${code}&phone=${phone}`);
    },
    requestCancellation: async (id, reason) => {
        return await apiService.post(`/Booking/${id}/request-cancellation`, { reason });
    },
    processCancellation: async (id, approve, adminNote) => {
        return await apiService.post(`/Booking/${id}/process-cancellation`, { approve, adminNote });
    },
    getMidTripRequests: async () => {
        return await apiService.get('/Booking/mid-trip-requests');
    },
    approveMidTripRequest: async (ticketId) => {
        return await apiService.post(`/Booking/mid-trip-requests/${ticketId}/approve`);
    },
    confirmMidTripDropOff: async (ticketId) => {
        return await apiService.post(`/Booking/mid-trip-requests/${ticketId}/confirm`);
    }
};

export default bookingService;
