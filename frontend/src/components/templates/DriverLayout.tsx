import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  Wifi,
  WifiOff,
  Menu,
  X,
  Moon,
  Sun,
  Power,
  Bell,
  DollarSign,
  Clock,
  User,
  Navigation,
} from 'lucide-react';
import socketService from '@/services/socket';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore, demoUsers } from '@/stores/authStore';
import { cn } from '@/utils/cn';

export function DriverLayout() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeStore();
  const { user, setUser, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Auto-login demo driver if not authenticated or wrong role (for demo purposes)
  // Wait for hydration to complete before setting user to avoid race conditions
  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== 'driver')) {
      setUser(demoUsers.driver);
    }
  }, [_hasHydrated, user, setUser]);

  useEffect(() => {
    socketService.connect();

    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 2000);

    return () => {
      clearInterval(interval);
      socketService.disconnect();
    };
  }, []);

  // Close mobile menu on route change (deferred to avoid cascading renders)
  useEffect(() => {
    const timeoutId = setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  const navLinks = [
    { to: '/driver/status', label: 'Status', icon: Power },
    { to: '/driver/requests', label: 'Requests', icon: Bell },
    { to: '/driver/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/driver/history', label: 'History', icon: Clock },
  ];

  return (
    <div className={cn('h-screen flex flex-col', isDark ? 'dark' : '')}>
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800">
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

        {/* Header - Driver-specific dark theme */}
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl z-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 pointer-events-none" />
          <div className="relative px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              {/* Logo */}
              <Link to="/driver">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">SwiftRide</h1>
                    <p className="text-xs text-white/70 font-medium">Driver</p>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4">
                <nav className="flex items-center gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to ||
                      (link.to === '/driver/status' && location.pathname === '/driver');
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <ConnectionStatus isConnected={isConnected} />
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                <Link
                  to="/driver/login"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mt-4 pt-4 border-t border-white/10"
                >
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <ConnectionStatus isConnected={isConnected} />
                    <div className="flex items-center gap-2">
                      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                      <Link
                        to="/driver/login"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <User className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
        isConnected ? 'bg-white/20 text-emerald-100' : 'bg-error-500/20 text-error-100'
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Online</span>
          <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-300" />
      ) : (
        <Moon className="w-5 h-5 text-white" />
      )}
    </button>
  );
}
