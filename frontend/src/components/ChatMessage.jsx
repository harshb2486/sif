import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ role, content, timestamp }) => {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatContent = (text) => {
    // Convert markdown-like formatting to JSX
    return text.split('\n').map((line, idx) => (
      <div key={idx} className="message-line">
        {line.startsWith('- ') ? (
          <span className="bullet">• {line.substring(2)}</span>
        ) : line.startsWith('**') && line.endsWith('**') ? (
          <strong>{line.substring(2, line.length - 2)}</strong>
        ) : (
          line
        )}
      </div>
    ));
  };

  return (
    <div className={`message-row ${role}`}>
      <div className={`message ${role}-message`}>
        <div className="message-avatar">
          {role === 'user' ? '👤' : '🤖'}
        </div>
        <div className="message-content">
          {formatContent(content)}
          <div className="message-time">{formatTime(timestamp)}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
