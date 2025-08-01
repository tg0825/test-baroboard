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
    const initializeAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const email = localStorage.getItem('userEmail');
        const session = localStorage.getItem('userSession');
        
        if (isLoggedIn && email) {
          setUser({
            email,
            isLoggedIn: true,
            session: session || undefined,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (email: string, session?: string) => {
    const userData = {
      email,
      isLoggedIn: true,
      session,
    };
    
    setUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    
    if (session) {
      localStorage.setItem('userSession', session);
    }
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