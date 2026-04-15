import apiService from './api';

const paymentService = {
    createVNPayPayment: async (paymentData) => {
        // paymentData: { orderId, fullName, amount, description }
        return await apiService.post('/Payment/vnpay', paymentData);
    },
    
    executeVNPayCallback: async (queryParams) => {
        return await apiService.get(`/Payment/vnpay-callback${queryParams}`);
    },

    createPayOSPayment: async (bookingId) => {
        return await apiService.post('/Payment/payos', { bookingId });
    }
};

export default paymentService;
