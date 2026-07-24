import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import {
  RiRobot2Line,
  RiAddLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiBarChartBoxLine,
  RiCoinsLine,
  RiFocus3Line,
  RiRocketLine,
  RiAlertLine
} from 'react-icons/ri';
import './ChatBot.css';

const ChatBot = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadConversationMessages(currentConversation);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations(20);
      setConversations(response.data.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversation(conversationId);
      setMessages(response.data.data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      setError(null);
      setLoading(true);

      const userMsg = {
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      const response = await chatAPI.sendMessage(message, currentConversation);
      const { conversationId, aiResponse, metadata } = response.data.data;

      if (!currentConversation) {
        setCurrentConversation(conversationId);
      }

      const assistantMsg = {
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
        metadata
      };
      setMessages(prev => [...prev, assistantMsg]);

      loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setSearchQuery('');
    setError(null);
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatAPI.deleteConversation(conversationId);
        if (currentConversation === conversationId) {
          handleNewConversation();
        }
        loadConversations();
      } catch (err) {
        setError('Failed to delete conversation');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations();
      return;
    }

    try {
      setLoading(true);
      const response = await chatAPI.searchConversations(searchQuery);
      setConversations(response.data.data.results || []);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: RiBarChartBoxLine, title: 'Product Information', description: 'Get details about your products and pricing' },
    { icon: RiCoinsLine, title: 'Commission Calculations', description: 'Understand your earnings and bonuses' },
    { icon: RiFocus3Line, title: 'Sales Strategies', description: 'Get expert tips and sales techniques' },
    { icon: RiRocketLine, title: 'Performance Insights', description: 'Analyze your sales data and performance' }
  ];

  return (
    <div className="chatbot-container">
      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <RiRobot2Line />
          <h3>Sales Assistant</h3>
        </div>

        <button className="new-chat-btn" onClick={handleNewConversation}>
          <RiAddLine /> New Chat
        </button>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn"><RiSearchLine /></button>
        </div>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="empty-message">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`conversation-item ${currentConversation === conv.conversation_id ? 'active' : ''}`}
              >
                <div className="conversation-item-main">
                  <div
                    className="conv-title"
                    onClick={() => setCurrentConversation(conv.conversation_id)}
                    title={conv.title}
                  >
                    {conv.title}
                  </div>
                  <div className="conv-meta">
                    {conv.total_messages} msgs • {conv.total_tokens} tokens
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteConversation(conv.conversation_id)}
                  title="Delete conversation"
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chatbot-main">
        {!currentConversation && messages.length === 0 ? (
          <div className="welcome-container">
            <div className="welcome-content">
              <div className="welcome-icon">
                <RiRobot2Line />
              </div>
              <h2>Welcome, {user?.name}!</h2>
              <p className="welcome-subtitle">Your Sales Assistant</p>
              <div className="feature-list">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div className="feature" key={feature.title}>
                      <span className="icon"><Icon /></span>
                      <div>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="welcome-hint">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {error && (
              <div className="error-banner">
                <RiAlertLine /> {error}
              </div>
            )}

            {messages.length === 0 && currentConversation && (
              <div className="loading">Loading conversation...</div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                role={msg.role}
                content={msg.content}
                timestamp={msg.created_at}
              />
            ))}

            {loading && (
              <div className="message-row assistant">
                <div className="message bot-message">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading}
          placeholder="Ask me about products, commissions, or sales strategies..."
        />
      </div>
    </div>
  );
};

export default ChatBot;
