import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Logistics Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, isDragging: false, hasMoved: false });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the widget is open, and the click was outside the widget container, close it
      if (isOpen && widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Use mousedown instead of click to catch it before focus changes
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      // Use the configured api.js which automatically attaches the JWT token
      const response = await api.get(`/ai/chat?message=${encodeURIComponent(userMessage)}`);
      
      // Since Spring AI returns raw text, and api.js expects JSON, we need to handle it.
      // Actually, if it's text, axios parses it as data.
      const data = response.data;
      setMessages(prev => [...prev, { text: data, isBot: true }]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server right now. Please try again later.", isBot: true, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointerDown = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return; // Only left click

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    dragStart.current = {
      x: clientX,
      y: clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      isDragging: true,
      hasMoved: false
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
    document.addEventListener('touchmove', handlePointerMove, { passive: false });
    document.addEventListener('touchend', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragStart.current.isDragging) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragStart.current.hasMoved = true;
    }

    setOffset({
      x: dragStart.current.offsetX + deltaX,
      y: dragStart.current.offsetY + deltaY
    });
  };

  const handlePointerUp = () => {
    dragStart.current.isDragging = false;
    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('mouseup', handlePointerUp);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
  };

  const handleToggle = () => {
    if (dragStart.current.hasMoved) {
      dragStart.current.hasMoved = false;
      return;
    }
    setIsOpen(true);
  };

  // Styles
  const styles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      userSelect: dragStart.current.isDragging ? 'none' : 'auto'
    },
    button: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: 'var(--color-primary, #2563eb)',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      transition: 'transform 0.2s'
    },
    chatWindow: {
      position: 'absolute',
      bottom: '80px',
      right: '0',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    },
    header: {
      backgroundColor: 'var(--color-primary, #2563eb)',
      color: 'white',
      padding: '16px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'grab'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '20px'
    },
    messageContainer: {
      flex: 1,
      padding: '16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: '#f9fafb'
    },
    message: (isBot) => ({
      maxWidth: '80%',
      padding: '10px 14px',
      borderRadius: '12px',
      alignSelf: isBot ? 'flex-start' : 'flex-end',
      backgroundColor: isBot ? 'white' : 'var(--color-primary, #2563eb)',
      color: isBot ? '#1f2937' : 'white',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: isBot ? '1px solid #e5e7eb' : 'none',
      lineHeight: '1.4'
    }),
    inputForm: {
      display: 'flex',
      padding: '12px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white'
    },
    input: {
      flex: 1,
      padding: '10px 14px',
      border: '1px solid #d1d5db',
      borderRadius: '20px',
      outline: 'none',
      marginRight: '8px',
      fontSize: '14px'
    },
    sendBtn: {
      backgroundColor: 'var(--color-primary, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isLoading ? 0.7 : 1
    },
    tooltip: {
      position: 'absolute',
      right: '75px',
      bottom: '10px',
      backgroundColor: 'white',
      padding: '10px 16px',
      borderRadius: '20px',
      borderBottomRightRadius: '0px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'opacity 0.3s'
    }
  };

  return (
    <div style={styles.container} ref={widgetRef}>
      {!isOpen ? (
        <div 
          onMouseDown={handlePointerDown} 
          onTouchStart={handlePointerDown}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <div 
            style={styles.tooltip} 
            onClick={handleToggle}
            onMouseOver={(e) => !dragStart.current.isDragging && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={(e) => !dragStart.current.isDragging && (e.currentTarget.style.transform = 'scale(1)')}
          >
            👋 Hi! May I help you?
          </div>
          <button 
            style={styles.button} 
            onClick={handleToggle}
            onMouseOver={(e) => !dragStart.current.isDragging && (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => !dragStart.current.isDragging && (e.currentTarget.style.transform = 'scale(1)')}
          >
            💬
          </button>
        </div>
      ) : (
        <div style={styles.chatWindow}>
          <div 
            style={styles.header}
            onMouseDown={handlePointerDown} 
            onTouchStart={handlePointerDown}
          >
            <span>Logistics AI Assistant</span>
            <button 
              style={styles.closeBtn} 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            >✕</button>
          </div>
          
          <div style={styles.messageContainer}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{...styles.message(msg.isBot), ...(msg.isError ? {color: '#ef4444'} : {})}}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div style={styles.message(true)}>
                <span style={{ animation: 'pulse 1.5s infinite' }}>Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form style={styles.inputForm} onSubmit={handleSend}>
            <input 
              style={styles.input}
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button style={styles.sendBtn} type="submit" disabled={isLoading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
