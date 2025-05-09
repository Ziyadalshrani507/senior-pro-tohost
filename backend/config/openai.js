const axios = require('axios');

// Create a custom OpenRouter client that mimics the OpenAI interface
const openRouter = {
  createChatCompletion: async (options) => {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: options.model,
          messages: options.messages,
          max_tokens: options.max_tokens,
          temperature: options.temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://your-site.com', // Update with your actual site
            'X-Title': 'Saudi Arabia Tourism Platform',
            'Content-Type': 'application/json',
          },
        }
      );
      
      return {
        data: {
          choices: [
            {
              message: {
                content: response.data.choices[0].message.content
              }
            }
          ]
        }
      };
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw error;
    }
  }
};

module.exports = openRouter;


//CONFIGRATION TO INGRATE OPENAI API