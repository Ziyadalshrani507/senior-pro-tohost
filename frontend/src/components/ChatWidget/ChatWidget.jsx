import React, { useEffect } from 'react';
import './ChatWidget.css';

/**
 * ChatWidget component that integrates the Chatbase chatbot widget
 * This replaces the previous DeepSeek implementation with Chatbase
 */
const ChatWidget = () => {
  // On component mount, initialize the Chatbase widget
  useEffect(() => {
    // Make sure window and chatbaseConfig exist
    if (!window.chatbase) {
      // Configure Chatbase
      window.chatbaseConfig = {
        chatbotId: "XYO6VZr3RH1CTgejmNVYM",
        domain: "www.chatbase.co",
        forceShow: true,
        autoOpen: false
      };

      // Load the script programmatically
      const script = document.createElement('script');
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "XYO6VZr3RH1CTgejmNVYM";
      script.defer = true;
      script.async = true;
      
      // Fix CORS issues by handling the fetch options
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (url && typeof url === 'string' && url.includes('chatbase.co')) {
          options = options || {};
          options.credentials = 'omit';
          options.mode = 'cors';
        }
        return originalFetch.call(this, url, options);
      };

      // Add the script to the document
      document.body.appendChild(script);
      
      // Create styles to ensure visibility
      const style = document.createElement('style');
      style.textContent = `
        .chatbase-bubble, 
        .chatbase-container {
          z-index: 9999 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Clean up function
    return () => {
      // If we need to remove the chatbot when component unmounts
      const script = document.getElementById("XYO6VZr3RH1CTgejmNVYM");
      if (script) {
        script.remove();
      }
    };
  }, []);

  // This component doesn't render anything visible itself,
  // it just integrates the Chatbase widget
  return <div id="chatbase-container" className="chatbase-widget-container"></div>;
};

export default ChatWidget;