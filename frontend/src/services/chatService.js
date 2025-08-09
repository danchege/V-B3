import { api } from '../utils/api';

export const sendMessage = async (matchId, text) => {
  try {
    // Ensure we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await api.post('/chat', { 
      matchId, 
      text 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

export const getMessages = async (matchId) => {
  try {
    console.log('Attempting to fetch messages for match:', matchId);
    
    // Ensure we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      const error = new Error('No authentication token found');
      console.error('Authentication error:', error);
      throw error;
    }
    
    console.log('Sending request to /chat/' + matchId);
    const response = await api.get(`/chat/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Messages fetched successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching messages:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};
