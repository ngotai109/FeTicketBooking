import apiService from './api';

const busTypeService = {
    getAllBusTypes: async () => {
        return await apiService.get('/BusType');
    },

    getActiveBusTypes: async () => {
        return await apiService.get('/BusType/active');
    },

    getBusTypeById: async (id) => {
        return await apiService.get(`/BusType/${id}`);
    },

    createBusType: async (busTypeData) => {
        return await apiService.post('/BusType', busTypeData);
    },

    updateBusType: async (id, busTypeData) => {
        return await apiService.put(`/BusType/${id}`, busTypeData);
    },

    deleteBusType: async (id) => {
        return await apiService.delete(`/BusType/${id}`);
    },

    toggleActive: async (id) => {
        return await apiService.patch(`/BusType/${id}/toggle-active`);
    }
};

export default busTypeService;
