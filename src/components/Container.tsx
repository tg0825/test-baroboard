"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Graph from './Graph';

interface ContainerProps {
  selectedData: { [key: string]: unknown } | null;
}

const Container = ({ selectedData }: ContainerProps) => {
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

  return (
    <div className="flex-1 h-full flex justify-center">
      <div className="w-full max-w-[1024px] h-full">
        {selectedData ? (
          <Graph data={selectedData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center justify-center">
              <Image 
                src="/logo-bb.png" 
                alt="Baro Board" 
                width={isMobile ? 192 : 256}
                height={isMobile ? 192 : 256}
                className="object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Container; 