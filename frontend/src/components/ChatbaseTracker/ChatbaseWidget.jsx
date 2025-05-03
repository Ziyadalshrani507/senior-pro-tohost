import React, { useEffect } from 'react';

/**
 * ChatbaseWidget - Component that initializes and renders the Chatbase chatbot
 * This component handles both initialization and visibility of the chatbot
 */
const ChatbaseWidget = () => {
  useEffect(() => {
    // Clean up any previous initializations
    const cleanup = () => {
      // Remove any previous chatbase scripts
      const oldScripts = document.querySelectorAll('script[src*="chatbase.co/embed"]');
      oldScripts.forEach(script => script.remove());
    };

    // Initialize Chatbase widget
    const initChatbase = () => {
      cleanup();

      // Create global chatbase config
      window.chatbaseConfig = {
        chatbotId: "XYO6VZr3RH1CTgejmNVYM",
        domain: "www.chatbase.co",
        forceShow: true,
        autoOpen: false,
        // Very important to avoid CORS errors
        fetchOptions: {
          credentials: 'omit',
          mode: 'cors'
        }
      };

      // Create and append Chatbase script
      const script = document.createElement('script');
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "XYO6VZr3RH1CTgejmNVYM";
      script.async = true;
      script.onload = () => {
        console.log("Chatbase script loaded successfully");
        
        // Force visibility after loading
        setTimeout(() => {
          const chatElements = document.querySelectorAll('.chatbase-bubble, .chatbase-widget');
          chatElements.forEach(el => {
            if (el) {
              el.style.display = 'block';
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.zIndex = '9999';
            }
          });
          console.log("Applied styles to make chatbot visible");
        }, 1000);
      };

      document.body.appendChild(script);
    };

    // Start initialization process
    initChatbase();

    // Clean up on unmount
    return cleanup;
  }, []);

  // This component doesn't render anything visible by itself
  // The chatbot UI is injected directly into the DOM by the Chatbase script
  return null;
};

export default ChatbaseWidget;