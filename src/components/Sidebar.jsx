// src/components/Sidebar.jsx - Clean version without login/logout button
import React from 'react';
import { 
  LayoutDashboard, DollarSign, Users, UserCog, BarChart3, 
  FileText, UserCheck, Lock
} from 'lucide-react';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const Sidebar = ({ 
  currentView, 
  setCurrentView, 
  currentUser, 
  roles, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const isGuest = currentUser.roleId === 'guest';
  const userRoleObj = roles.find(r => r.id === currentUser.roleId);
  const roleName = isGuest ? 'Guest' : (userRoleObj?.name || 'User');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true, shortLabel: 'Dash' },
    { id: 'payins', label: 'Payins', icon: DollarSign, show: !isGuest, shortLabel: '$' },
    { id: 'referrors', label: 'Referrors', icon: Users, show: !isGuest, shortLabel: 'Ref' },
    { id: 'mentors', label: 'Mentors', icon: UserCog, show: !isGuest, shortLabel: 'Ment' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: hasPermission(currentUser, PERMISSIONS.VIEW_ANALYTICS, roles), shortLabel: 'Stats' },
    { id: 'audit', label: 'Audit', icon: FileText, show: hasPermission(currentUser, PERMISSIONS.VIEW_AUDIT, roles), shortLabel: 'Audit' },
    { 
      id: 'users', 
      label: 'Users', 
      icon: UserCheck, 
      show: hasPermission(currentUser, PERMISSIONS.USER_ADD, roles) || 
            hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles) || 
            hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles),
      shortLabel: 'Users'
    },
    { 
      id: 'roles', 
      label: 'Roles', 
      icon: Lock, 
      show: hasPermission(currentUser, PERMISSIONS.ROLE_ADD, roles) || 
            hasPermission(currentUser, PERMISSIONS.ROLE_EDIT, roles) || 
            hasPermission(currentUser, PERMISSIONS.ROLE_DELETE, roles),
      shortLabel: 'Roles'
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-black border-r border-yellow-600/30 overflow-y-auto">
      <div className="p-4 h-full flex flex-col">
        {/* User info at top (smaller) */}
        {!isCollapsed && (
          <div className="mb-6 pt-2">
            <div className="text-sm font-medium text-gray-300 truncate">{currentUser.name}</div>
            <div className="text-xs text-yellow-500 capitalize">{roleName}</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-black font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed items */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-gray-700 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer - No login/logout button */}
        <div className="mt-auto pt-4 text-center">
          {isCollapsed ? (
            <div className="text-xs text-gray-500">
              PM
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              PayinMonitor v1.0
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;