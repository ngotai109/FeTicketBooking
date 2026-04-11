import apiService from './api';

const tripService = {
    getAllTrips: async (queryParams = '') => {
        return await apiService.get(`/Trip/monitoring${queryParams}`);
    },

    getTripById: async (id) => {
        return await apiService.get(`/Trip/${id}`);
    },

    createTrip: async (payload) => {
        return await apiService.post('/Trip', payload);
    },

    // Auto-Generate Trips
    generateTrips: async (payload) => {
        return await apiService.post('/Trip/generate', payload);
    },

    updateTrip: async (id, data) => {
        return await apiService.put(`/Trip/${id}`, data);
    },

    assignDriver: async (id, driverId) => {
        return await apiService.patch(`/Trip/${id}/driver?driverId=${driverId}`);
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
    },

    deleteTrip: async (id) => {
        return await apiService.delete(`/Trip/${id}`);
    },

    searchTrips: async (data) => {
        // Convert date format from YYYY-MM-DD to YYYY/MM/DD
        const formattedDate = data.date ? data.date.replace(/-/g, '/') : data.date;
        return await apiService.get(`/Trip/search?departure=${data.departure}&destination=${data.destination}&date=${formattedDate}`);
    }
};

export default tripService;
