import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext initAuth running...');
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext - token:', token, 'storedUser:', storedUser);
      
      if (token && storedUser) {
        try {
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          console.log('AuthContext - setting user from localStorage');
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthContext - error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('AuthContext - no stored auth data, setting unauthenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
      console.log('AuthContext - initAuth complete, loading set to false');
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    console.log('Login called with:', { userData, token });
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Authentication state updated');
    console.log('Current auth state:', { isAuthenticated: true, user: userData });
  };

  const logout = () => {
    console.log('Logout called - clearing all auth data');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Clear any other stored data
    localStorage.removeItem('linkedin_auth_success');
    localStorage.removeItem('facebook_auth_success');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
