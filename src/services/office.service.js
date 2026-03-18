import api from './api';

const officeService = {
    getAllOffices: async () => {
        return await api.get('Office');
    },
    
    getOfficeById: async (id) => {
        return await api.get(`Office/${id}`);
    },

    createOffice: async (data) => {
        return await api.post('Office', data);
    },

    updateOffice: async (id, data) => {
        return await api.put(`Office/${id}`, data);
    },

    deleteOffice: async (id) => {
        return await api.delete(`Office/${id}`);
    },

    toggleActive: async (id) => {
        return await api.put(`Office/${id}/toggle-active`);
    }
};

export default officeService;
