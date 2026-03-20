import apiService from './api';

const busService = {
    getAllBuses: async () => {
        return await apiService.get('/Bus');
    },

    getBusById: async (id) => {
        return await apiService.get(`/Bus/${id}`);
    },

    createBus: async (busData) => {
        return await apiService.post('/Bus', busData);
    },

    updateBus: async (id, busData) => {
        return await apiService.put(`/Bus/${id}`, busData);
    },

    deleteBus: async (id) => {
        return await apiService.delete(`/Bus/${id}`);
    },

    toggleStatus: async (id) => {
        return await apiService.patch(`/Bus/${id}/toggle-status`);
    },

    getBusSeats: async (busId) => {
        return await apiService.get(`/Bus/${busId}/seats`);
    },

    updateSeat: async (seatId, seatData) => {
        return await apiService.put(`/Seats/${seatId}`, seatData);
    }
};

export default busService;
