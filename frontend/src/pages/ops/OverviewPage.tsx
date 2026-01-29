import { motion } from 'framer-motion';
import {
  Car,
  Users,
  DollarSign,
  Activity,
  Clock,
  AlertTriangle,
  Database,
  Server,
  CreditCard,
  Bell,
  Map,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCard {
  label: string;
  value: string;
  icon: typeof Car;
  color: 'primary' | 'success' | 'warning' | 'violet';
}

const stats: StatCard[] = [
  { label: 'Active Rides', value: '--', icon: Car, color: 'primary' },
  { label: 'Online Drivers', value: '--', icon: Users, color: 'success' },
  { label: 'Revenue Today', value: '--', icon: DollarSign, color: 'violet' },
  { label: 'Avg Wait Time', value: '--', icon: Clock, color: 'warning' },
];

const systemServices = [
  { name: 'API Gateway', icon: Server },
  { name: 'Database', icon: Database },
  { name: 'Payment Service', icon: CreditCard },
  { name: 'Notification Service', icon: Bell },
  { name: 'Map Service', icon: Map },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          System Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics and system health
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  stat.color === 'primary' && 'bg-primary-100 dark:bg-primary-900/30',
                  stat.color === 'success' && 'bg-success-100 dark:bg-success-900/30',
                  stat.color === 'warning' && 'bg-warning-100 dark:bg-warning-900/30',
                  stat.color === 'violet' && 'bg-violet-100 dark:bg-violet-900/30'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    stat.color === 'primary' && 'text-primary-500',
                    stat.color === 'success' && 'text-success-500',
                    stat.color === 'warning' && 'text-warning-500',
                    stat.color === 'violet' && 'text-violet-500'
                  )} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Ride Activity
            </h3>
            <select className="text-sm bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300">
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="text-center">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No activity data available
              </p>
            </div>
          </div>
        </div>

        {/* Top Regions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Top Regions
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No region data available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Recent Alerts
            </h3>
            <button className="text-sm text-violet-500 hover:text-violet-600 font-medium">
              View All
            </button>
          </div>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent alerts
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            {systemServices.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {service.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    --
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
