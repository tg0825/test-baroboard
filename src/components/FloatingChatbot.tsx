"use client";

import React, { useState, useEffect } from 'react';
import { createChat } from '@n8n/chat';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatContainer, setChatContainer] = useState<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isOpen && chatContainer) {
      // n8n chat 초기화
      createChat({
        webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/chat',
        webhookConfig: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        target: chatContainer,
        mode: 'window',
        loadPreviousSession: true,
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        metadata: {},
        showWelcomeScreen: true,
      });
    }
  }, [isOpen, chatContainer]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 떠있는 챗봇 버튼 */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '20px',
          right: isMobile ? '16px' : '20px',
          width: isMobile ? '56px' : '60px',
          height: isMobile ? '56px' : '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
          fontSize: isMobile ? '20px' : '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = '#0056b3';
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#007bff';
          }
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 채팅창 */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '80px' : '90px',
            right: isMobile ? '16px' : '20px',
            left: isMobile ? '16px' : 'auto',
            width: isMobile ? 'calc(100vw - 32px)' : '400px',
            height: isMobile ? 'calc(100vh - 120px)' : '600px',
            maxHeight: isMobile ? '80vh' : '600px',
            backgroundColor: 'white',
            borderRadius: isMobile ? '16px' : '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 999,
            overflow: 'hidden',
            border: '1px solid #e1e5e9',
          }}
        >
          <div
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: isMobile ? '20px 16px' : '16px',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: isMobile ? '18px' : '16px',
            }}
          >
            <span>AI 어시스턴트</span>
            <button
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: isMobile ? '20px' : '18px',
                cursor: 'pointer',
                padding: '0',
                width: isMobile ? '32px' : '24px',
                height: isMobile ? '32px' : '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              ✕
            </button>
          </div>
          
          {/* n8n chat이 렌더링될 컨테이너 */}
          <div
            ref={setChatContainer}
            style={{
              height: isMobile ? 'calc(100% - 76px)' : 'calc(100% - 64px)',
              width: '100%',
            }}
          />
        </div>
      )}
    </>
  );
};

export default FloatingChatbot; 