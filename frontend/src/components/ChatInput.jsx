import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const ChatInput = ({ onSendMessage, disabled = false, placeholder = 'Type a message...' }) => {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
      
      // Calculate rows for display
      const lineCount = input.split('\n').length;
      setRows(Math.min(lineCount, 5));
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      setRows(1);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (but not Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="chat-textarea"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="send-button"
          title="Send message (Enter)"
        >
          {disabled ? '⏳' : '📤'}
        </button>
      </div>
      <div className="input-hint">
        Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
      </div>
    </form>
  );
};

export default ChatInput;
