import apiService from './api';

const busService = {
    getAllBuses: async () => {
        return await apiService.get('/Vehicle');
    },

    getBusById: async (id) => {
        return await apiService.get(`/Vehicle/${id}`);
    },

    createBus: async (busData) => {
        return await apiService.post('/Vehicle', busData);
    },

    updateBus: async (id, busData) => {
        return await apiService.put(`/Vehicle/${id}`, busData);
    },

    deleteBus: async (id) => {
        return await apiService.delete(`/Vehicle/${id}`);
    },

    toggleStatus: async (id, status) => {
        return await apiService.patch(`/Vehicle/${id}/toggle-active?status=${status}`);
    },

    getBusSeats: async (busId) => {
        return await apiService.get(`/Vehicle/${busId}/seats`);
    },

    updateSeat: async (seatId, seatData) => {
        return await apiService.put(`/Seats/${seatId}`, seatData);
    }
};

export default busService;
