import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load to persist session
    const storedUser = localStorage.getItem('betSmartUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (email && password) {
                // Mock user data
                const fakeUser: User = {
                    name: email.split('@')[0], // Use part of email as name for demo
                    email,
                    isVip: false
                };
                setUser(fakeUser);
                localStorage.setItem('betSmartUser', JSON.stringify(fakeUser));
                resolve();
            } else {
                reject(new Error("Invalid credentials"));
            }
        }, 1000);
    });
  };

  const register = async (name: string, email: string, password: string) => {
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
             // Mock logging to satisfy TS unused parameter check
             console.log(`Registering user ${name} (${email}) with password length: ${password.length}`);
             
             const fakeUser: User = {
                name,
                email,
                isVip: false
            };
            setUser(fakeUser);
            localStorage.setItem('betSmartUser', JSON.stringify(fakeUser));
            resolve();
        }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('betSmartUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};