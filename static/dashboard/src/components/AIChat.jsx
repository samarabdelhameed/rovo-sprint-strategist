import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, API_ENDPOINTS } from '../config/api';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Zap,
  Terminal,
  Cpu,
  Maximize2,
  Settings,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Activity,
  Info,
  AlertCircle,
  Copy,
  Share2,
  X
} from 'lucide-react';

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
      content: "Hello! I'm Rovo, your intelligent sprint strategist. I've been monitoring your Jira project and identified several areas where we can optimize performance and mitigate risks.\n\nHow can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        'Current sprint performance analysis',
        'Identify biggest project risks',
        'Improve team velocity',
        'Sprint success prediction'
      ]
    };

    setMessages([welcomeMessage]);
    setIsConnected(true);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
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
      const data = await apiRequest(API_ENDPOINTS.aiChat, {
        method: 'POST',
        body: JSON.stringify({ message: messageText, context: 'sprint_analysis' })
      });

      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.response || 'I encountered an issue processing that. Could you rephrase your query?',
          timestamp: new Date(),
          suggestions: data.suggestions || []
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I am currently having trouble reaching the neural engine. Please check your connection or try again later.',
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

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: 'Chat session reset. I am ready for fresh analysis.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 300);
  };

  const formatMessage = (content) => {
    // Convert markdown-like formatting to styled spans
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j} className="text-accent italic">{part.slice(1, -1)}</em>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} className="bg-dark-900/50 px-1.5 py-0.5 rounded text-accent font-mono text-sm">{part.slice(1, -1)}</code>;
          }
          return part;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-h-[900px] glass-card overflow-hidden border-accent/10 relative">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/5 bg-dark-800/40 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent border border-accent/20 shadow-glow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-dark-800 shadow-md ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-text-primary flex items-center gap-2">
              Rovo Neural Core
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Context-Aware Sprint Analyst</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2.5 hover:bg-dark-700/50 rounded-xl text-text-muted hover:text-danger transition-all duration-300"
            title="Reset Environment"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-dark-700/50 rounded-xl text-text-muted hover:text-white transition-all duration-300">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide bg-dark-900/20">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 border transition-transform duration-500 hover:rotate-12 ${message.type === 'user'
                  ? 'bg-dark-700/50 border-dark-600 text-text-muted'
                  : 'bg-accent/10 border-accent/20 text-accent'
                  }`}>
                  {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`space-y-3 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xl ${message.type === 'user'
                    ? 'bg-accent shadow-glow-sm shadow-accent/20 text-white rounded-tr-none'
                    : 'bg-dark-800/80 border border-white/5 text-text-primary rounded-tl-none backdrop-blur-sm'
                    }`}>
                    <div className="text-sm md:text-base leading-relaxed">
                      {formatMessage(message.content)}
                    </div>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => sendMessage(suggestion)}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-dark-700 bg-dark-800/50 text-text-muted hover:text-accent hover:border-accent/40 transition-all uppercase tracking-wider flex items-center gap-2"
                        >
                          <Activity className="w-3 h-3" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] opacity-60 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.type === 'ai' && !message.isError && <ShieldCheck className="w-3 h-3 text-success/50" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-4 items-center">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-dark-800/80 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-4 md:p-6 bg-dark-800/60 border-t border-white/5 backdrop-blur-xl">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <textarea
            ref={inputRef}
            rows="1"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Inquire about current sprint trajectory..."
            className="w-full bg-dark-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-20 text-text-primary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-muted/40 resize-none min-h-[64px]"
          />
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || !isConnected}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${inputMessage.trim()
                ? 'bg-accent text-white shadow-glow-sm hover:scale-105 active:scale-95'
                : 'bg-dark-700/50 text-text-muted cursor-not-allowed opacity-50'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.25em] opacity-40">
          <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Neural Engine Active</span>
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Real-time Telemetry</span>
          <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5" /> Full Entity Scope</span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;