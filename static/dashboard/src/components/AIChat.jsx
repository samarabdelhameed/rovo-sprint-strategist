import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize chat with welcome message
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m Rovo, your smart sprint management assistant. I can help you with:\n\n🔍 Analyzing current sprint performance\n📊 Understanding data and metrics\n💡 Suggesting solutions to problems\n⚡ Applying recommendations\n📈 Predicting sprint outcomes\n\nWhat would you like to know?',
      timestamp: new Date(),
      suggestions: [
        'How does the current sprint performance look?',
        'What are the biggest risks we\'re facing?',
        'Suggest solutions to improve velocity',
        'Will we succeed in finishing the sprint on time?'
      ]
    };
    
    setMessages([welcomeMessage]);
    setIsConnected(true);
    
    // Focus on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          context: 'sprint_analysis'
        })
      });

      const data = await response.json();
      
      // Simulate typing delay
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response || 'Sorry, a connection error occurred. Please try again.',
          timestamp: new Date(),
          suggestions: data.suggestions || []
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'Sorry, I cannot connect to the service right now. Please try again later.',
          timestamp: new Date(),
          isError: true
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      const welcomeMessage = {
        id: 1,
        type: 'ai',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 300);
  };

  const formatMessage = (content) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <div className="chat-title">
          <div className="ai-avatar">🤖</div>
          <div className="title-info">
            <h2>Rovo AI Assistant</h2>
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="chat-actions">
          <button className="action-btn" onClick={clearChat} title="Clear Chat">
            🗑️
          </button>
          <button className="action-btn" title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'ai' ? '🤖' : '👤'}
            </div>
            
            <div className="message-content">
              <div 
                className={`message-bubble ${message.isError ? 'error' : ''}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('ar-EG', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="message-suggestions">
                  <p className="suggestions-label">Suggestions:</p>
                  <div className="suggestions-grid">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-btn"
                        onClick={() => useSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">Rovo is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="quick-actions">
          <button 
            className="quick-action"
            onClick={() => useSuggestion('What is the current sprint status?')}
          >
            📊 Sprint Status
          </button>
          <button 
            className="quick-action"
            onClick={() => useSuggestion('What are the urgent recommendations?')}
          >
            ⚡ Urgent Recommendations
          </button>
          <button 
            className="quick-action"
            onClick={() => useSuggestion('Risk Analysis')}
          >
            ⚠️ Risk Analysis
          </button>
        </div>

        <div className="chat-input">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Rovo anything about the sprint..."
            rows="1"
            disabled={!isConnected}
          />
          
          <button 
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || !isConnected}
          >
            <span className="send-icon">📤</span>
          </button>
        </div>

        <div className="input-footer">
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;