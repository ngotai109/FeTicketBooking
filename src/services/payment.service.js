import apiService from './api';

const paymentService = {
    createVNPayPayment: async (paymentData) => {
        // paymentData: { orderId, fullName, amount, description }
        return await apiService.post('/Payment/vnpay', paymentData);
    },
    
    executeVNPayCallback: async (queryParams) => {
        return await apiService.get(`/Payment/vnpay-callback${queryParams}`);
    },

    createPayOSPayment: async (data) => {
        return await apiService.post('/Payment/payos', data);
    },

    checkPayOSStatus: async (data) => {
        // data: { bookingId, orderCode }
        return await apiService.post('/Payment/payos-check', data, { skipLoading: true });
    }
};

export default paymentService;
