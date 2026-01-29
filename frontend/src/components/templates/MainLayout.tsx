import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  Car,
  Wifi,
  WifiOff,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import socketService from '@/services/socket';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/utils/cn';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();

  // Connect to WebSocket on mount
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

  return (
    <div className={cn('h-screen flex flex-col', isDark ? 'dark' : '')}>
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? '#1e293b' : '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        {/* Header */}
        <header className="header-gradient text-white shadow-xl z-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/20 pointer-events-none" />
          <div className="relative px-4 py-4 lg:px-8">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              {/* Logo */}
              <Link to="/">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">SwiftRide</h1>
                    <p className="text-xs text-white/70 font-medium">Premium Ride Experience</p>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4">
                <NavLinks />
                <ConnectionStatus isConnected={isConnected} />
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
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
                  <div className="flex flex-col gap-3">
                    <NavLinks mobile />
                    <div className="flex items-center justify-between">
                      <ConnectionStatus isConnected={isConnected} />
                      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const location = useLocation();

  const links = [
    { to: '/book', label: 'Book Ride' },
    { to: '/history', label: 'History' },
  ];

  return (
    <nav className={cn(mobile ? 'flex flex-col gap-2' : 'flex items-center gap-2')}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            location.pathname === link.to
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
        isConnected
          ? 'bg-success-500/20 text-success-100'
          : 'bg-error-500/20 text-error-100'
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Live</span>
          <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
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
