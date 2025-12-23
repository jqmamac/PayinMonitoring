// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Shield, ChevronLeft, LogOut, LogIn } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// Inline media query hook
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
  };
};

const MainLayout = ({ children, currentView, setCurrentView, currentUser, onLogout, roles }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  // Auto-close mobile menu on desktop & adjust sidebar
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
    
    // Auto-collapse sidebar on tablet
    if (isTablet) {
      setIsSidebarCollapsed(true);
    } else if (isDesktop) {
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isTablet, isDesktop]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Close sidebar when clicking a menu item on mobile
  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Toggle sidebar collapse
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle user actions
  const handleUserAction = (action) => {
    if (action === 'logout') {
      onLogout();
    } else if (action === 'login') {
      setCurrentView('login');
    }
    setIsUserMenuOpen(false);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const isGuest = currentUser.roleId === 'guest';
  const userRoleObj = roles.find(r => r.id === currentUser.roleId);
  const roleName = isGuest ? 'Guest' : (userRoleObj?.name || 'User');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-yellow-900/20 text-gray-100">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-yellow-600/30 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors touch-target"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Menu className="w-6 h-6 text-yellow-400" />
                )}
              </button>
            )}

            {/* Desktop Collapse Toggle */}
            {!isMobile && (
              <button
                onClick={handleToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors touch-target"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft className={`w-6 h-6 text-yellow-400 transition-transform ${
                  isSidebarCollapsed ? 'rotate-180' : ''
                }`} />
              </button>
            )}

            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {isMobile ? 'PM' : 'PayinMonitor'}
              </span>
            </div>

            {/* Page Title (Desktop) */}
            {!isMobile && (
              <div className="ml-6">
                <h1 className="text-lg font-semibold capitalize">
                  {currentView.replace(/([A-Z])/g, ' $1').trim()}
                </h1>
              </div>
            )}
          </div>

          {/* Right Section - User Menu Only */}
          <div className="user-menu-container relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors touch-target"
              aria-label="User menu"
            >
              {!isMobile && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium truncate max-w-[120px] text-gray-300">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-yellow-500 capitalize">
                    {roleName}
                  </span>
                </div>
              )}
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border-2 border-yellow-600/30">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            </button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg shadow-lg z-50 py-2"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-800">
                    <div className="text-sm font-medium text-gray-300">{currentUser.name}</div>
                    <div className="text-xs text-yellow-500 capitalize">{roleName}</div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {isGuest ? (
                      <button
                        onClick={() => handleUserAction('login')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            handleSetCurrentView('dashboard');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => handleUserAction('logout')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-all duration-300
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        ${!isMobile ? (isSidebarCollapsed ? 'w-20' : 'w-64') : 'w-64'}
      `}>
        <Sidebar
          currentView={currentView}
          setCurrentView={handleSetCurrentView}
          currentUser={currentUser}
          roles={roles}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20"
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`
        pt-16 min-h-screen transition-all duration-300
        ${isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-20' : 'ml-64')}
      `}>
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
          {/* Mobile Page Header */}
          {isMobile && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2 text-gray-100 capitalize">
                {currentView.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
              <div className="text-sm text-gray-400">
                Welcome back, {currentUser.name.split(' ')[0]}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-800/50 p-4 sm:p-6 animate-fade-in-mobile">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;