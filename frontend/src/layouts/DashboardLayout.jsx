/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Bell,
  LogOut,
  ShieldCheck,
  CheckSquare,
  LineChart,
  X,
  Menu,
  Users
} from 'lucide-react';

import { SessionModal, LogoutConfirmationModal } from '../components/AuthModals';
import { ThemeToggle } from '../components/ThemeToggle';
import { NotificationPanel } from '../components/NotificationPanel';
import snsLogo from '../assets/logos/app-logo.png';

import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';
import { usePermissions } from '../hooks/usePermissions';

export default function DashboardLayout() {
  const { currentUser, logout, users } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth < 1024);
  const [logoPulse, setLogoPulse] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Session modal state
  const [sessionExpiryOpen, setSessionExpiryOpen] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(15);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // On desktop, keep expanded by default; only collapse if user manually did so
        // (We track this by checking if it was auto-collapsed)
      } else {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeUnreadNotifsCount = unreadCount;

  const handleSignOut = async () => {
    await logout();
    setLogoutConfirmOpen(false);
    navigate('/login');
  };

  const handleTabClick = (path) => {
    navigate(path);
    setIsNotifDropdownOpen(false);
    if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
  };

  const renderSidebarButton = (path, label, IconComponent) => {
    const isActive = location.pathname === path;

    if (isSidebarCollapsed) {
      return (
        <button
          key={path}
          onClick={() => handleTabClick(path)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer ${isActive ? 'bg-frost-gray text-charcoal border border-platinum-silver shadow-xs' : 'bg-transparent border border-transparent text-slate-gray hover:bg-mist-silver/30 hover:text-charcoal'}`}
        >
          <IconComponent className={`h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-charcoal' : 'text-steel-gray'}`} />
          <div className="absolute left-16.25 opacity-0 scale-90 -translate-x-2.5 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 z-50">
            <div className="bg-slate-900 border border-slate-800 text-white font-sans font-extrabold text-sm py-2.5 px-5 rounded-xl shadow-2xl tracking-wide whitespace-nowrap">{label}</div>
          </div>
        </button>
      );
    }

    return (
      <button
        key={path}
        onClick={() => handleTabClick(path)}
        className={`w-full p-3.5 rounded-xl flex items-center space-x-4 transition-all duration-300 border cursor-pointer ${isActive ? 'bg-frost-gray border-platinum-silver text-charcoal font-bold shadow-xs' : 'hover:bg-mist-silver/30 border-transparent text-slate-gray font-medium hover:text-charcoal'}`}
      >
        <IconComponent className={`h-5.5 w-5.5 shrink-0 ${isActive ? 'text-charcoal' : 'text-steel-gray'}`} />
        <span className="animate-fade-in whitespace-nowrap text-base">{label}</span>
      </button>
    );
  };

  if (!currentUser) return null;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/queue')) return 'Submissions Queue';
    if (path.includes('/evaluation')) return 'Evaluation Console';
    if (path.includes('/statistics')) return 'Institution Stats';
    if (path.includes('/assign-access')) return 'Assign Access';
    if (path.includes('/upload')) return 'Upload Manuscript';
    if (path.includes('/publications')) return 'My Publications';
    if (path.includes('/faculty-profiles') || path.includes('/admin/faculty')) return 'Faculty Profiles';
    if (path.includes('/developer/assign-role')) return 'Assign Role';
    if (path.includes('/profile')) return 'Profile';
    return 'RPMS System';
  };

  const isDark = theme === 'dark';

  return (
    <div className="flex-1 flex flex-col lg:flex-row relative h-screen w-full overflow-hidden bg-arctic-white">
      <SessionModal isOpen={sessionExpiryOpen} onClose={() => { }} onLogout={handleSignOut} timeLeft={sessionTimeLeft} />
      <LogoutConfirmationModal isOpen={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)} onConfirm={handleSignOut} />

      {!isSidebarCollapsed && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-30 lg:hidden animate-fade-in" onClick={() => setIsSidebarCollapsed(true)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 bg-ice-gray text-charcoal border-r border-platinum-silver flex flex-col justify-between select-none text-left shrink-0 transition-all duration-300 lg:relative lg:translate-x-0 lg:flex ${isSidebarCollapsed ? '-translate-x-full lg:w-20 px-2' : 'translate-x-0 w-70 sm:w-72 lg:w-64 xl:w-72 px-4 sm:px-5'} h-screen lg:h-auto py-5`}>
        <div className="space-y-6 w-full flex flex-col items-center">
          <div onClick={() => { setIsSidebarCollapsed(!isSidebarCollapsed); setLogoPulse(true); setTimeout(() => setLogoPulse(false), 250); }} className={`flex items-center justify-between w-full cursor-pointer select-none ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="flex items-center space-x-3">
              <img src={snsLogo} alt="SNS" className={`${isSidebarCollapsed ? 'h-10 w-10' : 'h-12 w-12'} rounded-xl object-contain shadow-xs shrink-0 bg-pure-white p-1 transition-all duration-300 ease-out hover:shadow-md ${logoPulse ? 'scale-125' : 'scale-100'}`} />
              {!isSidebarCollapsed && <h2 className="font-black font-serif tracking-tight text-xl leading-none text-charcoal">SNS RPMS</h2>}
            </div>
            {!isSidebarCollapsed && <button onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(true); }} className="lg:hidden p-2 rounded-lg hover:bg-mist-silver/50 text-slate-gray"><X className="h-6 w-6" /></button>}
          </div>

          <nav className={`space-y-2 font-semibold w-full ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
            {currentUser.role === 'Faculty' ? (
              <>
                {renderSidebarButton('/faculty/upload', 'Upload Manuscript', Upload)}
                {renderSidebarButton('/faculty/publications', 'My Publications', BookOpen)}

                {/* Temporary Admin nav items — shown only if granted */}
                {currentUser.isTemporaryAdmin && currentUser.granularPermissions?.pages?.length > 0 && (
                  <>
                    {/* Visual divider */}
                    <div className={`border-t border-platinum-silver my-2 ${isSidebarCollapsed ? 'w-8 mx-auto' : 'w-full'}`} />
                    {currentUser.granularPermissions.pages.includes('dashboard') && renderSidebarButton('/faculty/dashboard', 'Dashboard', LayoutDashboard)}
                    {currentUser.granularPermissions.pages.includes('faculty_profiles') && renderSidebarButton('/faculty/faculty-profiles', 'Faculty Profiles', Users)}
                    {currentUser.granularPermissions.pages.includes('queue') && renderSidebarButton('/faculty/queue', 'Submissions Queue', CheckSquare)}
                    {currentUser.granularPermissions.pages.includes('assign_access') && renderSidebarButton('/faculty/assign-access', 'Assign Access', ShieldCheck)}
                  </>
                )}
              </>
            ) : currentUser.role === 'Developer' ? (
              <>
                {renderSidebarButton('/developer/assign-role', 'Assign Role', ShieldCheck)}
              </>
            ) : (
              <>
                {renderSidebarButton('/admin/dashboard', 'Dashboard', LayoutDashboard)}
                {renderSidebarButton('/admin/faculty', 'Faculty Profiles', Users)}
                {renderSidebarButton('/admin/queue', 'Submissions Queue', CheckSquare)}
                {renderSidebarButton('/admin/upload', 'Upload Manuscript', Upload)}
                {renderSidebarButton('/admin/publications', 'My Publications', BookOpen)}
                {renderSidebarButton('/admin/assign-access', 'Assign Access', ShieldCheck)}
              </>
            )}
          </nav>
        </div>

        <div className={`pt-4 border-t border-platinum-silver w-full ${isSidebarCollapsed ? 'flex flex-col items-center space-y-3' : 'space-y-3'}`}>
          <div onClick={() => handleTabClick(currentUser.role === 'Admin' ? '/admin/profile' : currentUser.role === 'Developer' ? '/developer/profile' : '/faculty/profile')} className={`w-full p-2.5 rounded-xl flex items-center transition-all duration-300 cursor-pointer relative group ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} ${location.pathname.includes('/profile') ? 'bg-frost-gray text-charcoal border border-platinum-silver shadow-xs font-bold' : 'hover:bg-mist-silver/30 border border-transparent text-slate-gray hover:text-charcoal'}`}>
            <div className={`${isSidebarCollapsed ? 'h-9 w-9 text-base' : 'h-10 w-10 text-lg'} ${location.pathname.includes('/profile') ? 'bg-emerald-600 text-white' : 'bg-brushed-silver text-charcoal'} font-black flex items-center justify-center rounded-full shrink-0 transition-all shadow-xs`}>
              {currentUser.name.charAt(0) || 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate text-left max-w-37.5 animate-fade-in flex-1">
                <p className="font-extrabold text-sm text-charcoal leading-tight truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-gray font-mono tracking-wider font-extrabold uppercase mt-0.5 leading-none">{currentUser.role}</p>
              </div>
            )}
          </div>
          {isSidebarCollapsed ? (
            <button onClick={() => setLogoutConfirmOpen(true)} className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group text-red-600 hover:bg-red-50/50 hover:text-red-700 cursor-pointer"><LogOut className="h-5.5 w-5.5" /></button>
          ) : (
            <button onClick={() => setLogoutConfirmOpen(true)} className="w-full p-3.5 hover:bg-red-50/50 rounded-xl flex items-center text-red-600 hover:text-red-700 font-bold transition-all duration-300 cursor-pointer space-x-3"><LogOut className="h-5.5 w-5.5 shrink-0" /><span className="animate-fade-in text-base">Sign Out</span></button>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-arctic-white">
        <header className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-xs select-none sticky top-0 z-40 bg-pure-white border-b border-platinum-silver">
          <div className="flex items-center gap-3 text-left">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="lg:hidden p-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer bg-frost-gray border border-platinum-silver text-charcoal hover:bg-mist-silver/50"><Menu className="h-5 w-5 animate-ham-open" /></button>
            <h1 className="text-sm sm:text-base md:text-lg font-black font-serif leading-none tracking-tight text-charcoal">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            {currentUser.role !== 'Developer' && <NotificationPanel />}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 min-w-0 bg-arctic-white">
          <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-5 md:space-y-6 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
