import apiService from './api';

const tripService = {
    getAllTrips: async (queryParams = '') => {
        return await apiService.get(`/Trip/monitoring${queryParams}`);
    },

    getTripById: async (id) => {
        return await apiService.get(`/Trip/${id}`);
    },
    
    // Auto-Generate Trips
    generateTrips: async (payload) => {
        return await apiService.post('/Trip/Generate', payload);
    },

    updateTrip: async (id, data) => {
        return await apiService.put(`/Trip/${id}`, data);
    },

    // Lấy danh sách ghế của chuyến (TripSeats)
    getTripSeats: async (tripId) => {
        return await apiService.get(`/Trip/${tripId}/Seats`);
    },

    // Quản lý vé cho 1 chuyến cụ thể
    updateSeatStatus: async (tripId, seatId, statusData) => {
        return await apiService.put(`/Trip/${tripId}/Seats/${seatId}/Status`, statusData);
    },

    quickBook: async (data) => {
        return await apiService.post('/Trip/quick-book', data);
    }
};

export default tripService;
