import api from './api';

const wardService = {
    getAllWards: async () => {
        return await api.get('Ward/all');
    },
    getAllWardsActive: async () => {
        return await api.get('Ward');
    },
    getWardById: async (id) => {
        return await api.get(`Ward/${id}`);
    },

    getWardsByProvinceId: async (provinceId) => {
        return await api.get(`Ward/province/${provinceId}`);
    },

    createWard: async (data) => {
        return await api.post('Ward', data);
    },

    updateWard: async (id, data) => {
        return await api.put(`Ward/${id}`, data);
    },

    deleteWard: async (id) => {
        return await api.delete(`Ward/${id}`);
    },

    toggleActive: async (id) => {
        return await api.put(`Ward/${id}/toggle-active`);
    }
};

export default wardService;
