import apiService from './api';

const driverService = {
    getAllDrivers: async () => {
        return await apiService.get('/Driver');
    },

    getDriverById: async (id) => {
        return await apiService.get(`/Driver/${id}`);
    },

    createDriver: async (data) => {
        return await apiService.post('/Driver', data);
    },

    updateDriver: async (id, data) => {
        return await apiService.put(`/Driver/${id}`, data);
    },

    deleteDriver: async (id) => {
        return await apiService.delete(`/Driver/${id}`);
    },

    getMySchedule: async () => {
        return await apiService.get('/Driver/my-schedule');
    },

    getTripPassengers: async (tripId) => {
        return await apiService.get(`/Driver/my-trips/${tripId}/passengers`);
    },

    toggleBoard: async (ticketId) => {
        return await apiService.patch(`/Driver/tickets/${ticketId}/toggle-board`);
    },

    toggleDropOff: async (ticketId) => {
        return await apiService.patch(`/Driver/tickets/${ticketId}/toggle-dropoff`);
    },

    requestMidTripDropOff: async (ticketId, data) => {
        return await apiService.post(`/Driver/tickets/${ticketId}/request-mid-trip-dropoff`, data);
    },

    submitLeaveRequest: async (data) => {
        return await apiService.post('/Driver/leave-requests', data);
    },
    getMyLeaveRequests: async () => {
        return await apiService.get('/Driver/leave-requests');
    },
    getAllLeaveRequests: async () => {
        return await apiService.get('/Driver/all-leave-requests');
    },
    processLeaveRequest: async (requestId, payload) => {
        return await apiService.post(`/Driver/leave-requests/${requestId}/process`, payload);
    }
};

export default driverService;
