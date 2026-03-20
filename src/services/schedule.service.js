import apiService from './api';

const scheduleService = {
    getAllSchedules: async () => {
        return await apiService.get('/Schedule');
    },

    getScheduleById: async (id) => {
        return await apiService.get(`/Schedule/${id}`);
    },

    createSchedule: async (data) => {
        return await apiService.post('/Schedule', data);
    },

    updateSchedule: async (id, data) => {
        return await apiService.put(`/Schedule/${id}`, data);
    },

    deleteSchedule: async (id) => {
        return await apiService.delete(`/Schedule/${id}`);
    },
    
    // API Auto-Generate Trips
    generateTrips: async (payload) => {
        // payload: { fromDate: '2026-04-01', toDate: '2026-04-30' }
        return await apiService.post('/Schedule/GenerateTrips', payload);
    }
};

export default scheduleService;
