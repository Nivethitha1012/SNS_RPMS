import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Trash2, X, BellDot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export const NotificationPanel = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const isDark = theme === 'dark';

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (currentUser?.role === 'Admin') {
      navigate('/admin/queue');
    } else {
      navigate('/faculty/publications');
    }
  };

  const formatTimestamp = (isoString) => {
    const d = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl transition-all duration-300 relative border flex items-center justify-center cursor-pointer bg-frost-gray border-platinum-silver text-steel-gray hover:bg-mist-silver/60 hover:text-charcoal"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-bell-ring' : ''}`} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 border rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right bg-pure-white border-platinum-silver"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-platinum-silver flex justify-between items-center">
              <h3 className="font-bold text-sm text-charcoal">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-red-600 bg-red-50 hover:bg-red-100"
                    title="Clear all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg transition-colors sm:hidden text-steel-gray hover:text-charcoal hover:bg-mist-silver/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-platinum-silver flex gap-4 transition-all duration-300 relative group cursor-pointer ${
                        !notif.read ? 'bg-blue-50/40' : 'hover:bg-mist-silver/30'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 ${notif.read ? 'text-steel-gray' : 'text-blue-500'}`}>
                        {notif.read ? <Bell className="h-5 w-5" /> : <BellDot className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-charcoal' : 'text-slate-gray'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-2 text-steel-gray">
                          {notif.message}
                        </p>
                        <p className={`text-[10px] font-medium mt-2 ${!notif.read ? 'text-blue-500' : 'text-steel-gray'}`}>
                          {formatTimestamp(notif.timestamp)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center flex flex-col items-center text-steel-gray"
                  >
                    <Bell className="h-10 w-10 mb-3 text-brushed-silver" />
                    <p className="text-sm font-medium">No notifications</p>
                    <p className="text-xs mt-1">You're all caught up!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
