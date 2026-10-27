import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarClock,
  Clock,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  UserCheck,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, logout } from '../store/authSlice';
import { fetchNotifications, markAllNotificationsRead } from '../store/hrmSlice';
import { ASSETS } from '../constants/assets';
import { ResilientImage } from './ResilientImage';

const PAGE_LABELS: Record<string, string> = {
  '/workspace/dashboard': 'Dashboard',
  '/workspace/profile': 'Employee Profile',
  '/workspace/attendance': 'Attendance Management',
  '/workspace/leaves': 'Leave Management',
  '/workspace/trainings': 'Training Programs',
  '/workspace/people': 'Employees & Managers',
  '/workspace/announcements': 'Announcements',
  '/workspace/reports': 'Reports & Testing',
};

export function WorkspaceLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const { notifications } = useAppSelector((s) => s.hrm);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentBreadcrumb = PAGE_LABELS[location.pathname] || 'Workspace';

  const navItems = [
    {
      to: '/workspace/dashboard',
      label:
        user.role === 'hr'
          ? 'HR Dashboard'
          : user.role === 'manager'
            ? 'Manager Dashboard'
            : 'Employee Dashboard',
      icon: LayoutDashboard,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/profile',
      label: 'Employee Profile',
      icon: UserCircle2,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/leaves',
      label: 'Leave Management',
      icon: CalendarClock,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/trainings',
      label: 'Training Programs',
      icon: BookOpen,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/people',
      label: user.role === 'hr' ? 'Employees & Managers' : 'Team Members',
      icon: Users,
      roles: ['manager', 'hr'],
    },
    {
      to: '/workspace/announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      to: '/workspace/reports',
      label: 'Reports & Testing',
      icon: FileBarChart2,
      roles: ['manager', 'hr'],
    },
  ].filter((item) => item.roles.includes(user.role));

  const roleLabel =
    user.role === 'hr' ? 'HR Personnel' : user.role === 'manager' ? 'Manager' : 'Employee';

  const handleQuickSwitch = async (demoEmail: string) => {
    setSwitchingRole(true);
    await dispatch(loginUser({ email: demoEmail, password: 'HrmPass@123' }));
    setSwitchingRole(false);
    navigate('/workspace/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-20">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            HRM System
          </Link>
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            {roleLabel}
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Demo Role Switcher + Account Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Switch Role Console</p>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                disabled={switchingRole}
                onClick={() => handleQuickSwitch('arjun.patel@hrmportal.io')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  user.role === 'employee'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                disabled={switchingRole}
                onClick={() => handleQuickSwitch('marcus.chen@hrmportal.io')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  user.role === 'manager'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                disabled={switchingRole}
                onClick={() => handleQuickSwitch('claire.vance@hrmportal.io')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  user.role === 'hr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HR
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <ResilientImage
                src={ASSETS.avatars[user.avatarKey]}
                alt={user.name}
                fallbackType="avatar"
                initials={user.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.department}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col border-r border-slate-200 z-50">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200">
              <span className="font-display text-base font-bold text-slate-900">HRM System</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline whitespace-nowrap">HRM System</span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">{currentBreadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="font-mono tabular-nums font-semibold text-blue-700">
                    ({unreadCount})
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Notifications ({notifications.length})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => dispatch(markAllNotificationsRead())}
                        className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 text-left ${n.read ? 'bg-white' : 'bg-blue-50/40'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {n.title}
                            </p>
                            <span className="text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                              {n.createdAt.slice(5, 10)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/workspace/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-[1360px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
