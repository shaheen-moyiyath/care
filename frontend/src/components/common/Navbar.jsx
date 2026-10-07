import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Calendar,
  User,
  Bell,
  LogOut,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'patient') {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/patient/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        const unread = (res.data.notifications || []).filter(n => !n.Is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, Is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'doctor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor ({user?.specialization || 'Specialist'})
          </span>
        );
      case 'patient':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <UserCheck className="w-3.5 h-3.5" /> Patient
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  Care<span className="text-teal-600">Connect</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                  Patient Appointment System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <>
                    <Link
                      to="/patient/dashboard"
                      className={`text-sm font-medium transition-colors ${
                        location.pathname.startsWith('/patient') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Patient Portal
                    </Link>
                    <Link
                      to="/patient/doctors"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Find Doctors
                    </Link>
                  </>
                )}

                {user?.role === 'doctor' && (
                  <Link
                    to="/doctor/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/doctor') ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Doctor Console
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') ? 'text-purple-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admin Control Center
                  </Link>
                )}

                {/* Notifications Bell for Patient */}
                {user?.role === 'patient' && (
                  <div className="relative">
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-teal-600" />
                            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-slate-500 text-xs">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.slice(0, 6).map((notif) => (
                              <div
                                key={notif.Not_id}
                                className={`px-4 py-3 text-xs hover:bg-slate-50 transition-colors ${
                                  !notif.Is_read ? 'bg-teal-50/40' : ''
                                }`}
                              >
                                <p className="text-slate-800 font-medium">{notif.Msg}</p>
                                <div className="flex items-center gap-2 text-slate-400 mt-1 text-[11px]">
                                  <Clock className="w-3 h-3" />
                                  <span>{notif.Date} at {notif.Time?.slice(0, 5)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Profile info & Logout */}
                <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
                    <div>{getRoleBadge(user?.role)}</div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/20 transition-all hover:shadow-md"
                >
                  Register as Patient
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && getRoleBadge(user?.role)}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'patient' && (
                <Link
                  to="/patient/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50"
                >
                  Patient Dashboard
                </Link>
              )}
              {user?.role === 'doctor' && (
                <Link
                  to="/doctor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  Doctor Console
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-600 hover:bg-purple-50"
                >
                  Admin Center
                </Link>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">{user?.name}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 font-semibold bg-rose-50 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg font-medium shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
