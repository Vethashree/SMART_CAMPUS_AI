import React, { createContext, useContext, useState } from 'react';

export interface User {
  name: string;
  role: 'student' | 'faculty' | 'admin';
  id: string;
}

interface SessionContextValue {
  currentUser: User;
  isLoggedIn: boolean;
  showAIChat: boolean;
  setShowAIChat: (open: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
}

const GUEST: User = { name: 'Guest', role: 'student', id: 'GUEST' };

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(GUEST);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setCurrentUser(GUEST);
    setIsLoggedIn(false);
    setShowAIChat(false);
  };

  return (
    <SessionContext.Provider
      value={{ currentUser, isLoggedIn, showAIChat, setShowAIChat, login, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
