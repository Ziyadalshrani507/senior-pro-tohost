const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export const queryDeepSeek = async (query) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
};