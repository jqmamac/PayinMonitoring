import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { ref, onValue, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import PayinManager from '@/components/PayinManager';
import ReferrorManager from '@/components/ReferrorManager';
import MentorManager from '@/components/MentorManager';
import UserManager from '@/components/UserManager';
import RoleManager from '@/components/RoleManager';
import Analytics from '@/components/Analytics';
import AuditTrail from '@/components/AuditTrail';
import Sidebar from '@/components/Sidebar';
import { DEFAULT_ROLES, DEFAULT_USERS, hasPermission, PERMISSIONS } from '@/lib/permissions';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load Roles Globally for Permissions
  useEffect(() => {
    const rolesRef = ref(db, 'roles');
    const unsubscribe = onValue(rolesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedRoles = Object.values(data);
        setRoles(loadedRoles);
      } else {
        // Seed default roles if empty
        DEFAULT_ROLES.forEach(role => {
           set(ref(db, `roles/${role.id}`), role);
        });
      }
    });

    // Seed default users if empty (Basic check)
    const usersRef = ref(db, 'users');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) {
        DEFAULT_USERS.forEach(user => {
          set(ref(db, `users/${user.id}`), user);
        });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeUsers();
    };
  }, []);

  // Auth Init
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Re-hydrate permission if possible (in a real app we'd fetch fresh user data here)
      setCurrentUser(parsedUser);
    } else {
      const guestUser = { id: 'guest', name: 'Guest', roleId: 'guest' };
      setCurrentUser(guestUser);
    }
    setIsLoading(false);
  }, []);

  // Update permissions on currentUser whenever roles change
  useEffect(() => {
    if (currentUser && roles.length > 0) {
      const userRole = roles.find(r => r.id === currentUser.roleId);
      if (userRole) {
        setCurrentUser(prev => ({ ...prev, permissions: userRole.permissions }));
      }
    }
  }, [roles, currentUser?.roleId]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentView('dashboard');
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.name}!`,
    });
  };

  const handleLogout = () => {
    const guestUser = { id: 'guest', name: 'Guest', roleId: 'guest' };
    setCurrentUser(guestUser);
    localStorage.removeItem('currentUser');
    setCurrentView('dashboard');
    toast({
      title: "Logged Out",
      description: "You are now viewing as Guest.",
    });
  };

  const renderContent = () => {
    if (currentView === 'login') {
      return <LoginPage onLogin={handleLogin} />;
    }

    if (currentView === 'users' && !hasPermission(currentUser, PERMISSIONS.USER_ADD, roles) && !hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles) && !hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles)) {
       return <Dashboard currentUser={currentUser} />;
    }
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'payins':
        return <PayinManager currentUser={currentUser} roles={roles} />;
      case 'referrors':
        return <ReferrorManager currentUser={currentUser} roles={roles} />;
      case 'mentors':
        return <MentorManager currentUser={currentUser} roles={roles} />;
      case 'users':
        return <UserManager currentUser={currentUser} roles={roles} />;
      case 'roles':
        return <RoleManager currentUser={currentUser} roles={roles} />;
      case 'analytics':
        return hasPermission(currentUser, PERMISSIONS.VIEW_ANALYTICS, roles) ? <Analytics currentUser={currentUser} /> : <Dashboard currentUser={currentUser} />;
      case 'audit':
        return hasPermission(currentUser, PERMISSIONS.VIEW_AUDIT, roles) ? <AuditTrail currentUser={currentUser} roles={roles} /> : <Dashboard currentUser={currentUser} />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  if (isLoading || !currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-yellow-900">
      <Helmet>
        <title>Payin Monitoring System - Gold & Black Edition</title>
        <meta name="description" content="Advanced payin monitoring system" />
      </Helmet>
      
      <div className="flex">
        {currentView !== 'login' && (
          <Sidebar 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            currentUser={currentUser}
            onLogout={handleLogout}
            roles={roles}
          />
        )}
        
        <main className={`flex-1 p-8 ${currentView !== 'login' ? 'ml-64' : ''}`}>
          {renderContent()}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;