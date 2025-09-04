"use client";

import { usePathname } from 'next/navigation';
import GNB from "@/components/GNB";
import FloatingChatbot from "@/components/FloatingChatbot";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    // 로그인 페이지: GNB, 챗봇, Footer 없이 렌더링
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

  // 다른 페이지: 기존 레이아웃 유지
  return (
    <AuthProvider>
      <div className="h-screen overflow-auto">
        <GNB />
        <div className="pt-21 pb-8 h-full">
          {children}
        </div>
        <FloatingChatbot />
        <Footer />
      </div>
    </AuthProvider>
  );
}
