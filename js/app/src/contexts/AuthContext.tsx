import React, { createContext, useContext, useState, useEffect } from 'react';
import { userToken, userRegister } from '../api/services.gen';

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nwcString: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedToken && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await userToken({
        baseUrl: 'http://localhost:18888/api',
        body: {
          username: email,
          password: password,
        },
      });

      if (response.data && response.data.access_token) {
        setIsLoggedIn(true);
        setUserEmail(email);
        setToken(response.data.access_token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('token', response.data.access_token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, nwcString: string) => {
    try {
      const registerResponse = await userRegister({
        baseUrl: 'http://localhost:18888/api',
        body: {
          email: email,
          nwc_string: nwcString,
        },
      });

      if (registerResponse.data) {
        // After successful registration, log the user in
        await login(email, password);
      } else {
        throw new Error('Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setToken(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};