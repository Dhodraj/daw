import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Settings,
  Clock,
  Eye,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'success'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (showUnreadOnly && alert.isRead) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-error-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20';
      case 'warning':
        return 'border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20';
      case 'info':
        return 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20';
      case 'success':
        return 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-8 h-8 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Alerts
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {unreadCount} unread notifications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark All Read
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'critical', 'warning', 'info', 'success'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filter === f
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Unread only</span>
          </label>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No alerts to show</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  getAlertStyles(alert.type),
                  !alert.isRead && 'ring-2 ring-violet-500/20'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            'font-semibold text-slate-800 dark:text-slate-100',
                            !alert.isRead && 'font-bold'
                          )}>
                            {alert.title}
                          </h3>
                          {!alert.isRead && (
                            <span className="w-2 h-2 bg-violet-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full">
                          {alert.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {filteredAlerts.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-2 text-violet-500 hover:text-violet-600 font-medium">
            Load older alerts
          </button>
        </div>
      )}
    </div>
  );
}
