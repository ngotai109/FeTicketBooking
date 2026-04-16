import axios from 'axios';
import { toast } from 'react-toastify';
import { loadingEvent } from '../components/Common/LoadingOverlay';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};


api.interceptors.request.use(
    (config) => {
        if (!config.skipLoading) {
            loadingEvent.show(); // Trigger global loading
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        loadingEvent.hide();
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        if (!response.config.skipLoading) {
            loadingEvent.hide(); // Hide global loading
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Chỉ refresh token nếu là lỗi 401 và KHÔNG PHẢI request login
        if (error.response && error.response.status === 401 && !originalRequest.url?.includes('login') && !originalRequest._retry) {
            
            // Hide for the original failed request
            if (!originalRequest.skipLoading) {
                loadingEvent.hide();
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }
            try {
                const response = await axios.post(`${api.defaults.baseURL}Auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                processQueue(null, accessToken);

                return api(originalRequest);

            } catch (err) {
                processQueue(err, null);
                handleLogout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        if (!error.config?.skipLoading) {
            loadingEvent.hide(); // Hide global loading on other errors
        }
        return Promise.reject(error);
    }
);

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
    window.location.href = '/login';
}

export default api;
