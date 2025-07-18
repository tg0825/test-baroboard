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
        className={`
          fixed z-[1000]
          ${isMobile ? 'bottom-8 right-4 w-14 h-14 text-xl' : 'bottom-12 right-5 w-15 h-15 text-2xl'}
          rounded-full bg-primary-main text-white border-none cursor-pointer
          shadow-button flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:bg-primary-dark hover:shadow-strong hover:scale-110
          mobile-touch
        `}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* 채팅창 */}
      {isOpen && (
        <div
          className={`
            fixed z-[999] bg-background-main shadow-strong overflow-hidden border border-border-light
            ${isMobile 
              ? 'bottom-24 left-4 right-4 h-[calc(100vh-120px)] max-h-[80vh] rounded-2xl' 
              : 'bottom-[110px] right-5 w-[400px] h-[600px] rounded-xl'
            }
          `}
        >
          <div className={`
            bg-primary-main text-white font-bold flex justify-between items-center
            ${isMobile ? 'px-4 py-5 text-lg' : 'px-4 py-4 text-base'}
          `}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span>AI 어시스턴트</span>
            </div>
            <button
              onClick={toggleChat}
              className={`
                bg-transparent border-none text-white cursor-pointer
                ${isMobile ? 'text-xl w-8 h-8' : 'text-lg w-7 h-7'}
                flex items-center justify-center rounded-full
                transition-colors duration-200 hover:bg-white hover:bg-opacity-20
                p-1
              `}
            >
              ✕
            </button>
          </div>
          
          {/* n8n chat이 렌더링될 컨테이너 */}
          <div
            ref={setChatContainer}
            className={`
              ${isMobile ? 'h-[calc(100%-76px)]' : 'h-[calc(100%-64px)]'}
              w-full bg-background-soft
            `}
          />
        </div>
      )}
    </>
  );
};

export default FloatingChatbot; 