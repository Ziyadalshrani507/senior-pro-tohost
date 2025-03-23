import React, { useState } from 'react';
import { queryDeepSeek } from '../../services/deepseekservice'; // Correct import path
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { type: 'user', text: input };
      setMessages([...messages, userMessage]);
      setInput('');

      try {
        console.log('Sending query to DeepSeek:', input); // Debug log
        const response = await queryDeepSeek(input);
        console.log('Received response from DeepSeek:', response); // Debug log
        const botMessage = { type: 'bot', text: response.answer };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error querying DeepSeek API:', error); // Debug log
        const errorMessage = { type: 'bot', text: 'Sorry, something went wrong. Please try again later.' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
      <div className="chat-icon" onClick={toggleChat}>
        💬
      </div>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Ask Me Anything</span>
            <button className="close-btn" onClick={toggleChat}>X</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.type}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSend}>🚀</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;