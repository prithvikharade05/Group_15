import React from 'react';

const ChatMessage = ({ role, content, timestamp }) => {
  const isUser = role === 'user';
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '0.75rem',
      }}
    >
      {/* Role label */}
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: isUser ? '#a78bfa' : '#94a3b8',
        marginBottom: '0.25rem',
        paddingLeft: isUser ? 0 : '0.25rem',
        paddingRight: isUser ? '0.25rem' : 0,
      }}>
        {isUser ? 'You' : '🤖 AlphaMind AI'}
      </span>

      {/* Bubble */}
      <div style={{
        maxWidth: '85%',
        padding: '0.65rem 0.9rem',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
          : 'rgba(255,255,255,0.07)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.10)',
        color: '#f1f5f9',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        boxShadow: isUser
          ? '0 2px 12px rgba(124,58,237,0.35)'
          : '0 1px 6px rgba(0,0,0,0.3)',
      }}>
        {content}
      </div>

      {/* Timestamp */}
      {time && (
        <span style={{
          fontSize: '0.6rem',
          color: '#475569',
          marginTop: '0.2rem',
          paddingLeft: isUser ? 0 : '0.3rem',
          paddingRight: isUser ? '0.3rem' : 0,
        }}>
          {time}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;
