"use client";

import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      setCurrentDate(`${year}-${month}-${day}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-background-soft border-t border-border-light flex items-center justify-between px-4 md:px-6 z-[1001] backdrop-blur-sm bg-opacity-95">
      {/* 좌측 - 빈 공간 또는 추가 정보 */}
      <div className="text-xs text-text-muted">
        {/* 필요시 추가 정보 */}
      </div>

      {/* 우측 - 현재 날짜 */}
      <div className="text-xs text-text-secondary font-medium">
        {currentDate}
      </div>
    </footer>
  );
};

export default Footer; 