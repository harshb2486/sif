import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import {
  RiRobot2Line,
  RiAddLine,
  RiCloseLine,
  RiMessage3Line
} from 'react-icons/ri';
import './FloatingChatBot.css';

const FloatingChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const canUseAssistant =
    !!user &&
    ['company_admin', 'sales'].includes(user.role) &&
    (user.role !== 'sales' || !!user.is_verified) &&
    !!(user.companyId || user.company_id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (canUseAssistant && isOpen && !currentConversation) {
      loadLastConversation();
    }
  }, [isOpen, canUseAssistant, currentConversation]);

  const loadLastConversation = async () => {
    try {
      const response = await chatAPI.getConversations(1);
      const conversations = response.data.data.conversations || [];
      if (conversations.length > 0) {
        const lastConv = conversations[0];
        setCurrentConversation(lastConv.conversation_id);
        const messagesResponse = await chatAPI.getConversation(lastConv.conversation_id);
        setMessages(messagesResponse.data.data.messages || []);
      }
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Could not load chat history');
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
      const { conversationId, aiResponse } = response.data.data;

      if (!currentConversation) {
        setCurrentConversation(conversationId);
      }

      const assistantMsg = {
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  if (!canUseAssistant) return null;

  return (
    <div className="floating-chatbot">
      {/* Floating Button */}
      <button
        className="floating-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        title="Sales Assistant"
      >
        {isOpen ? <RiCloseLine /> : <RiRobot2Line />}
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="floating-chat-widget">
          {/* Header */}
          <div className="widget-header">
            <div className="widget-header-title">
              <RiRobot2Line />
              <h4>Sales Assistant</h4>
            </div>
            <div className="header-actions">
              {messages.length > 0 && (
                <button
                  className="icon-btn"
                  onClick={handleNewChat}
                  title="New chat"
                >
                  <RiAddLine />
                </button>
              )}
              <button
                className="icon-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <RiCloseLine />
              </button>
            </div>
          </div>

          {/* Messages */}
          {messages.length === 0 && !error ? (
            <div className="widget-welcome">
              <div className="welcome-icon">
                <RiMessage3Line />
              </div>
              <h5>Hi, {user?.name}!</h5>
              <p>Ask me about products, pricing, or sales strategies</p>
            </div>
          ) : (
            <div className="widget-messages">
              {error && (
                <div className="error-msg">
                  {error}
                </div>
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

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            placeholder="Ask me..."
          />
        </div>
      )}
    </div>
  );
};

export default FloatingChatBot;
