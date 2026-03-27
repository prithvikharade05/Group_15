import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../api/axios';
import ChatMessage from './ChatMessage';

const WELCOME_MSG = {
  role: 'assistant',
  content: '👋 Hi! I\'m AlphaMind AI — your financial advisory assistant.\n\nAsk me about Indian stocks like TCS, Reliance, HDFC Bank, or topics like:\n• "How is INFY performing?"\n• "Should I invest in Reliance?"\n• "How to diversify my portfolio?"\n\nI\'m here to help with insights and analysis!',
  timestamp: new Date().toISOString(),
};

const ChatWindow = ({ isOpen, onClose }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Create session on first open
  const initSession = useCallback(async () => {
    if (sessionId) return;
    try {
      const res = await API.post('/api/chatbot/sessions/');
      setSessionId(res.data.session_id);
    } catch (err) {
      setError('Could not start chat session. Please try again.');
    }
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) {
      initSession();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, initSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || !sessionId) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const res = await API.post(`/api/chatbot/sessions/${sessionId}/messages/`, { message: text });
      const aiMsg = {
        role: 'assistant',
        content: res.data.response,
        timestamp: res.data.message?.timestamp || new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      right: 24,
      width: 380,
      maxWidth: 'calc(100vw - 48px)',
      height: 520,
      maxHeight: 'calc(100vh - 120px)',
      borderRadius: 24,
      background: '#0d0d1a',
      border: '1px solid rgba(124,58,237,0.3)',
      boxShadow: '0 8px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 9998,
      animation: 'chatSlideUp 0.25s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.2rem',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.2))',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 0 16px rgba(124,58,237,0.5)',
          }}>🤖</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }}>
              AlphaMind AI
            </div>
            <div style={{ color: '#a78bfa', fontSize: '0.7rem', fontWeight: 500 }}>
              ● Financial Advisor
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
        >✕</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(124,58,237,0.3) transparent',
      }}>
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              padding: '0.6rem 0.9rem',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '18px 18px 18px 4px',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#a78bfa',
                  animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            padding: '0.5rem 0.8rem', borderRadius: 10, marginBottom: '0.5rem',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', fontSize: '0.78rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: '0.6rem',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask about stocks, market trends..."
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            color: '#f1f5f9',
            fontSize: '0.85rem',
            padding: '0.6rem 0.9rem',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.5,
            maxHeight: 80,
            overflowY: 'auto',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim() || !sessionId}
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: input.trim() && !isLoading
              ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
              : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'all 0.2s',
            boxShadow: input.trim() && !isLoading ? '0 0 14px rgba(124,58,237,0.4)' : 'none',
            alignSelf: 'flex-end',
          }}
          title="Send (Enter)"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </div>

      {/* Inline keyframe CSS */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
