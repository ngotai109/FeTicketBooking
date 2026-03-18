import api from './api';

const provinceService = {
    getAllProvinces: async () => {
        return await api.get('/Province/all');
    },
    getAllProvincesActive: async () => {
        return await api.get('Provinces')
    },
    getProvinceById: async (id) => {
        return await api.get(`/Province/${id}`);
    },

    createProvince: async (data) => {
        return await api.post('/Province', data);
    },

    updateProvince: async (id, data) => {
        return await api.put(`/Province/${id}`, data);
    },

    deleteProvince: async (id) => {
        return await api.delete(`/Province/${id}`);
    },

    toggleActive: async (id) => {
        return await api.put(`/Province/${id}/toggle-active`);
    }
};

export default provinceService;
