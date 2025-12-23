// components/MobileHeader.jsx
import React from 'react';
import { Shield, Bell, User } from 'lucide-react';

export const MobileHeader = ({ currentUser, unreadCount }) => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-sm border-b border-yellow-600/30 px-4 flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-2 rounded-lg">
          <Shield className="w-5 h-5 text-black" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          PM
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2">
          <Bell className="w-5 h-5 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          <span className="text-sm text-gray-300 truncate max-w-20">
            {currentUser.name.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};