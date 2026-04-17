import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatBot.css';

const ChatBot = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
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

      // Add user message optimistically
      const userMsg = {
        role: 'user',
        content: message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Send to backend
      const response = await chatAPI.sendMessage(message, currentConversation);
      const { conversationId, aiResponse, metadata } = response.data.data;

      // Set current conversation if new
      if (!currentConversation) {
        setCurrentConversation(conversationId);
      }

      // Add AI response
      const assistantMsg = {
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
        metadata
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Refresh conversations list
      loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setSearchQuery('');
    setShowSearch(false);
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
    if (!searchQuery.trim()) return;

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

  return (
    <div className="chatbot-container">
      {/* Sidebar */}
      <div className="chatbot-sidebar">
        <div className="sidebar-header">
          <h3>Sales Assistant</h3>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={handleNewConversation}>
          ➕ New Chat
        </button>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">🔍</button>
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p className="empty-message">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`conversation-item ${currentConversation === conv.conversation_id ? 'active' : ''}`}
              >
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
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteConversation(conv.conversation_id)}
                  title="Delete conversation"
                >
                  🗑️
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
              <h2>Welcome, {user?.name}! 👋</h2>
              <p className="welcome-subtitle">Your Sales Assistant</p>
              <div className="feature-list">
                <div className="feature">
                  <span className="icon">📊</span>
                  <div>
                    <h4>Product Information</h4>
                    <p>Get details about your products and pricing</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="icon">💰</span>
                  <div>
                    <h4>Commission Calculations</h4>
                    <p>Understand your earnings and bonuses</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="icon">🎯</span>
                  <div>
                    <h4>Sales Strategies</h4>
                    <p>Get expert tips and sales techniques</p>
                  </div>
                </div>
                <div className="feature">
                  <span className="icon">🚀</span>
                  <div>
                    <h4>Performance Insights</h4>
                    <p>Analyze your sales data and performance</p>
                  </div>
                </div>
              </div>
              <p className="welcome-hint">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          <div className="messages-container">
            {error && (
              <div className="error-banner">
                ⚠️ {error}
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

        {/* Chat Input */}
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
