import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize default users if not present
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      const defaultUsers = [
        { id: '1', email: 'super@app.com', password: '123', role: 'super_admin', name: 'Super Admin' },
        { id: '2', email: 'admin@app.com', password: '123', role: 'admin', name: 'Admin User' }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Check for active session
    const session = localStorage.getItem('session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password; // Don't store password in session
      setUser(userData);
      localStorage.setItem('session', JSON.stringify(userData));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const loginAsGuest = () => {
    const guestUser = { 
      id: 'guest', 
      email: 'guest@app.com', 
      role: 'guest', 
      name: 'Guest User' 
    };
    setUser(guestUser);
    localStorage.setItem('session', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    
    switch (permission) {
      case 'create':
      case 'update':
        return user.role === 'admin';
      case 'delete':
      case 'manage_users':
        return false; // Only super_admin
      case 'view':
        return true; // Everyone including guest
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout, hasPermission, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};