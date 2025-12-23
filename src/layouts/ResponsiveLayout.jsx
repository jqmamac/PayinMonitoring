// layouts/ResponsiveLayout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import { MobileHeader } from './MobileHeader';

export const ResponsiveLayout = ({ children, currentView, setCurrentView, currentUser, onLogout, roles }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={onLogout}
        roles={roles}
      />
      
      <MobileHeader currentUser={currentUser} unreadCount={3} />
      
      <main className="lg:ml-64 pt-16 lg:pt-0 p-4 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};