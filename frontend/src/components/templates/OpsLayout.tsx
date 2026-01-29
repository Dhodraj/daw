import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  Car,
  Users,
  Map,
  TrendingUp,
  CreditCard,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/utils/cn';

export function OpsLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();

  // Close mobile sidebar on route change (deferred to avoid cascading renders)
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsMobileSidebarOpen(false), 0);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  const navLinks = [
    { to: '/ops/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/ops/rides', label: 'Rides', icon: Car },
    { to: '/ops/drivers', label: 'Drivers', icon: Users },
    { to: '/ops/regions', label: 'Regions', icon: Map },
    { to: '/ops/surge-pricing', label: 'Surge Pricing', icon: TrendingUp },
    { to: '/ops/payments', label: 'Payments', icon: CreditCard },
    { to: '/ops/alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className={cn('h-screen flex', isDark ? 'dark' : '')}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarCollapsed ? 80 : 256,
        }}
        className={cn(
          'fixed lg:relative z-50 h-full bg-slate-900 dark:bg-slate-800 flex flex-col transition-all duration-300',
          'lg:translate-x-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 dark:border-slate-700">
          <Link to="/ops" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-lg font-bold text-white whitespace-nowrap">SwiftRide</h1>
                  <p className="text-xs text-slate-400 whitespace-nowrap">Operations</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to ||
              (link.to === '/ops/overview' && location.pathname === '/ops');
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                title={isSidebarCollapsed ? link.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {link.to === '/ops/alerts' && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 dark:border-slate-700 space-y-1">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            {isDark ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'text-red-400 hover:bg-red-500/10 hover:text-red-300'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Exit Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 dark:bg-slate-900">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            {isMobileSidebarOpen ? (
              <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* Page Title - Could be dynamic based on route */}
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Operations Dashboard
            </h2>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
