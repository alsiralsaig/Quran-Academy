import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

interface NotificationCenterProps {
  onTabChange?: (tab: 'workspace' | 'quran' | 'azkar') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onTabChange }) => {
  const {
    activeRole,
    currentUser,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications relevant to active user/role
  const userNotifications = notifications.filter((n) => {
    if (n.recipientRole === 'all') return true;
    if (n.recipientRole === activeRole) {
      if (n.recipientId) return n.recipientId === currentUser.id;
      return true;
    }
    return false;
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const filteredNotifications = userNotifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleItemClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.linkTab && onTabChange) {
      onTabChange(notif.linkTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 transition-all focus:outline-none"
        title="التنبيهات والإشعارات"
      >
        <Bell className="w-5 h-5 text-amber-300" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-emerald-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <h4 className="font-extrabold text-sm font-serif">مركز التنبيهات والرسائل</h4>
              {unreadCount > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-emerald-200 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-header Filter Tabs */}
          <div className="bg-slate-50 border-b border-slate-100 p-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                الكل ({userNotifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  filter === 'unread' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-500'
                }`}
              >
                غير المقروءة ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold">لا توجد تنبيهات حالية</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-4 transition-all cursor-pointer space-y-1 ${
                    !notif.isRead ? 'bg-amber-50/60 font-bold border-r-4 border-amber-500' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {notif.type === 'info' && <Info className="w-4 h-4 text-teal-600 shrink-0" />}
                      <h5 className="font-extrabold text-slate-900 text-xs">{notif.title}</h5>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{notif.createdAt}</span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed pr-6">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {userNotifications.length > 0 && (
            <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <button
                onClick={clearNotifications}
                className="text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح التنبيهات
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
