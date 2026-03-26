import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const ChatWidget = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only render for authenticated users
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Chat Window */}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        title="AlphaMind AI Chat"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #dc2626, #991b1b)'
            : 'linear-gradient(135deg, #7c3aed, #2563eb)',
          border: '2px solid rgba(255,255,255,0.15)',
          boxShadow: isOpen
            ? '0 0 0 4px rgba(220,38,38,0.2), 0 8px 30px rgba(0,0,0,0.5)'
            : '0 0 0 4px rgba(124,58,237,0.25), 0 8px 30px rgba(124,58,237,0.4)',
          color: '#fff',
          fontSize: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: isOpen ? 'rotate(45deg) scale(1.05)' : 'rotate(0deg) scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen
            ? 'rotate(45deg) scale(1.12)'
            : 'scale(1.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen
            ? 'rotate(45deg) scale(1.05)'
            : 'scale(1)';
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </>
  );
};

export default ChatWidget;
