import apiService from './api';

const authService = {
    login: async (email, password) => {
        const data = await apiService.post('Auth/login', { email, password });
        return data;
    },


    refreshToken: async (refreshToken) => {
        const data = await apiService.post('Auth/refresh_token', { refreshToken });
        return data;
    },


    revokeToken: async (refreshToken) => {
        const data = await apiService.post('Auth/revoke_token', { refreshToken });
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
    },
    changePassword: async (data) => {
        return await apiService.post('Auth/change-password', data);
    }
};

export default authService;
