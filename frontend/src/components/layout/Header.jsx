import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services';
import { getInitials, formatRelativeTime } from '../../utils/format';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getNotifications({ limit: 6 });
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy-100 bg-paper/90 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-navy-600 hover:bg-navy-50 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block">
        <p className="text-sm text-navy-400">Welcome back,</p>
        <p className="font-display text-base font-medium text-ink-900">{user?.firstName} {user?.lastName}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2.5 text-navy-600 hover:bg-navy-50"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-rust-500" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl2 border border-navy-100 bg-white shadow-card-hover animate-fade-up">
              <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
                <p className="font-display font-semibold text-ink-900">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700">
                    <Check className="h-3.5 w-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-navy-400">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={`border-b border-navy-50 px-4 py-3 ${!n.isRead ? 'bg-navy-50/50' : ''}`}>
                      <p className="text-sm font-medium text-ink-900">{n.title}</p>
                      <p className="mt-0.5 text-xs text-navy-500">{n.message}</p>
                      <p className="mt-1 text-[11px] text-navy-300">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1.5 pr-2.5 hover:bg-navy-50">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-paper">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-navy-400" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl2 border border-navy-100 bg-white py-1.5 shadow-card-hover animate-fade-up">
              <button onClick={() => { navigate('/settings'); setProfileOpen(false); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-800 hover:bg-navy-50">
                <User className="h-4 w-4" /> My Profile
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rust-500 hover:bg-rust-50">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
