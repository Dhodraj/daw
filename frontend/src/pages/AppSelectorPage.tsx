import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car,
  Navigation,
  LayoutDashboard,
  ChevronRight,
  Smartphone,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore, demoUsers } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

interface AppOption {
  id: string;
  title: string;
  description: string;
  icon: typeof Car;
  path: string;
  gradient: string;
  features: string[];
  role: UserRole;
}

const apps: AppOption[] = [
  {
    id: 'rider',
    title: 'Rider App',
    description: 'Book rides, track drivers, and manage your trips',
    icon: Car,
    path: '/rider',
    gradient: 'from-primary-500 to-primary-600',
    features: ['Book rides', 'Real-time tracking', 'Payment management', 'Ride history'],
    role: 'rider',
  },
  {
    id: 'driver',
    title: 'Driver App',
    description: 'Accept rides, navigate, and track your earnings',
    icon: Navigation,
    path: '/driver',
    gradient: 'from-emerald-500 to-teal-600',
    features: ['Accept requests', 'Navigation', 'Earnings dashboard', 'Trip history'],
    role: 'driver',
  },
  {
    id: 'ops',
    title: 'Operations Dashboard',
    description: 'Monitor system health, manage drivers, and view analytics',
    icon: LayoutDashboard,
    path: '/ops',
    gradient: 'from-violet-500 to-purple-600',
    features: ['System overview', 'Driver management', 'Surge pricing', 'Alerts'],
    role: 'ops',
  },
];

export default function AppSelectorPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleAppSelect = (app: AppOption) => {
    // Auto-login as the demo user for this role
    const demoUser = demoUsers[app.role];
    login(demoUser, `session-${app.role}-${Date.now()}`);
    navigate(app.path);
  };

  return (
    <div className={cn('min-h-screen', isDark ? 'dark' : '')}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">SwiftRide</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Multi-Tenant Platform</p>
              </div>
            </motion.div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                Choose Your Application
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                SwiftRide provides separate experiences for riders, drivers, and operations teams.
                Select your application below.
              </p>
            </motion.div>

            {/* App Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {apps.map((app, index) => {
                const Icon = app.icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleAppSelect(app)}
                      className="block w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 group"
                    >
                      {/* Gradient Header */}
                      <div className={cn(
                        'p-6 bg-gradient-to-r text-white',
                        app.gradient
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Icon className="w-7 h-7" />
                          </div>
                          <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-xl font-bold mt-4">{app.title}</h3>
                        <p className="text-sm text-white/80 mt-1">{app.description}</p>
                      </div>

                      {/* Features */}
                      <div className="p-6">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Features
                        </p>
                        <ul className="space-y-2">
                          {app.features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                            >
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="px-6 pb-6">
                        <div className={cn(
                          'w-full py-3 rounded-xl text-center font-medium transition-colors',
                          'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
                          'group-hover:bg-gradient-to-r group-hover:text-white',
                          app.gradient.replace('from-', 'group-hover:from-').replace('to-', 'group-hover:to-')
                        )}>
                          Open {app.title}
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Real-time Updates</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                SwiftRide v1.0 • Multi-Tenant Ride-Hailing Platform
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
