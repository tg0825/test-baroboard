"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      setCurrentDateTime(`${year}-${month}-${day} ${hours}:${minutes}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 팝업 페이지에서는 Footer 숨김 (모든 Hook 호출 후에 체크)
  if (pathname === '/dashboard-popup') {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-background-soft border-t border-border-light flex items-center justify-between px-4 md:px-6 z-[1001] backdrop-blur-sm bg-opacity-95">
      {/* 좌측 - 빈 공간 또는 추가 정보 */}
      <div className="text-xs text-text-muted">
        {/* 필요시 추가 정보 */}
      </div>

      {/* 우측 - 현재 날짜와 시간 */}
      <div className="text-xs text-text-secondary font-medium flex items-center gap-2">
        <span>{currentDateTime}</span>
      </div>
    </footer>
  );
};

export default Footer; 