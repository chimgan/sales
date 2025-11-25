import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'kovtunovvladislav@gmail.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'password';
const ADMIN_SESSION_KEY = 'admin_authenticated';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const restoreAdminSession = async () => {
      if (sessionStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
        setIsAdminAuthenticated(false);
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        if (isMounted) {
          setIsAdminAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to restore admin Firebase session:', error);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        if (isMounted) {
          setIsAdminAuthenticated(false);
        }
      }
    };

    restoreAdminSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdminAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    } catch (error) {
      console.error('Failed to sign in admin via Firebase:', error);
      return false;
    }
  };

  const logout = async () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Failed to sign out admin from Firebase:', error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
