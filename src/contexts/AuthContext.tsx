"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  isLoggedIn: boolean;
  session?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, session?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩 시 localStorage에서 사용자 정보 복원
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const email = localStorage.getItem('userEmail');
      const session = localStorage.getItem('userSession');
      
      console.log('🔐 Auth initialization - isLoggedIn:', isLoggedIn, 'Email:', email);
      
      if (isLoggedIn && email) {
        setUser({
          email,
          isLoggedIn: true,
          session: session || undefined,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('🚨 Auth initialization error:', error);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, session?: string) => {
    console.log('🔐 AuthContext - login called with:', { email, session });
    
    // localStorage 먼저 업데이트
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    if (session) {
      localStorage.setItem('userSession', session);
    }
    
    const userData = {
      email,
      isLoggedIn: true,
      session,
    };
    
    // 상태 업데이트
    setUser(userData);
    
    console.log('✅ AuthContext - login completed:', userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userSession');
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};