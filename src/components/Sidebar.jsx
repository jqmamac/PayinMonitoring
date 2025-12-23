import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, DollarSign, Users, UserCog, BarChart3, FileText, LogOut, Shield, UserCheck, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const Sidebar = ({ currentView, setCurrentView, currentUser, onLogout, roles }) => {
  const isGuest = currentUser.roleId === 'guest';
  // Use passed roles prop to find role name, default to User/Guest
  const userRoleObj = roles.find(r => r.id === currentUser.roleId);
  const roleName = isGuest ? 'Guest' : (userRoleObj?.name || 'User');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'payins', label: 'Payin Management', icon: DollarSign, show: !isGuest },
    { id: 'referrors', label: 'Referror Manager', icon: Users, show: !isGuest },
    { id: 'mentors', label: 'Mentor Manager', icon: UserCog, show: !isGuest },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: hasPermission(currentUser, PERMISSIONS.VIEW_ANALYTICS, roles) },
    { id: 'audit', label: 'Audit Trail', icon: FileText, show: hasPermission(currentUser, PERMISSIONS.VIEW_AUDIT, roles) },
    { id: 'users', label: 'User Manager', icon: UserCheck, show: hasPermission(currentUser, PERMISSIONS.USER_ADD, roles) || hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles) || hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles) },
    { id: 'roles', label: 'Role Manager', icon: Lock, show: hasPermission(currentUser, PERMISSIONS.ROLE_ADD, roles) || hasPermission(currentUser, PERMISSIONS.ROLE_EDIT, roles) || hasPermission(currentUser, PERMISSIONS.ROLE_DELETE, roles) },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-black border-r border-yellow-600/30 p-6 overflow-y-auto"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            PayinMonitor
          </span>
        </div>
        <div className="ml-11 text-sm text-gray-400 truncate">{currentUser.name}</div>
        <div className="ml-11 text-xs text-yellow-500 capitalize">{roleName}</div>
      </div>

      <nav className="space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-black font-semibold shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        {isGuest ? (
           <Button
           onClick={() => setCurrentView('login')}
           className="w-full bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-600/30 transition-all duration-300"
         >
           <LogIn className="w-4 h-4 mr-2" />
           Login
         </Button>
        ) : (
          <Button
            onClick={onLogout}
            className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;