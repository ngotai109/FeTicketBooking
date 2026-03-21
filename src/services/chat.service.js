import api from './api';

const chatService = {
    askChatbot: async (history) => {
        try {
            const response = await api.post('Chat/ask', { history });
            return response.data;
        } catch (error) {
            console.error('Error in chatbot service:', error);
            throw error;
        }
    }
};

export default chatService;
