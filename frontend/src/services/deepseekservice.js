import axios from 'axios';

const API_URL = '/api/deepseek/v1/query'; // Use the proxy URL
const API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY; // Use the environment variable for the API key

export const queryDeepSeek = async (query) => {
  try {
    console.log('Sending query to DeepSeek:', query); // Debug log
    const response = await axios.post(API_URL, { query }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Received response from DeepSeek:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error querying DeepSeek API:', error);
    throw error;
  }
};