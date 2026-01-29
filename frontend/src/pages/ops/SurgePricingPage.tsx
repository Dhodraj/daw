import { useState } from 'react';
import {
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SurgeZone {
  id: string;
  region: string;
  multiplier: number;
  demand: number;
  supply: number;
  status: 'active' | 'scheduled' | 'paused';
  startTime: string;
  endTime: string;
}

const surgeZones: SurgeZone[] = [];

export default function SurgePricingPage() {
  const [autoSurge, setAutoSurge] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Surge Pricing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Dynamic pricing controls and monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <span className="text-sm text-slate-600 dark:text-slate-400">Auto Surge</span>
            <button
              onClick={() => setAutoSurge(!autoSurge)}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                autoSurge ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                  autoSurge ? 'left-5' : 'left-1'
                )}
              />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6" />
            <span className="text-sm text-white/80">Active Surges</span>
          </div>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Avg Multiplier</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">--</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Peak Hours</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">--</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Zones</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">--</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">
              Automatic surge pricing is enabled
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Multipliers are calculated based on real-time demand/supply ratio. Manual overrides will be reset after 30 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Surge Zones Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            Surge Zones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Region
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Multiplier
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Demand / Supply
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Time Window
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {surgeZones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Zap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400">No surge zones configured</p>
                  </td>
                </tr>
              ) : surgeZones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {zone.region}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className={cn(
                        'w-4 h-4',
                        zone.multiplier >= 2 ? 'text-error-500' :
                        zone.multiplier >= 1.5 ? 'text-warning-500' : 'text-slate-400'
                      )} />
                      <span className={cn(
                        'font-bold',
                        zone.multiplier >= 2 ? 'text-error-500' :
                        zone.multiplier >= 1.5 ? 'text-warning-500' : 'text-slate-800 dark:text-slate-100'
                      )}>
                        {zone.multiplier}x
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 dark:text-slate-100">
                        {zone.demand}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {zone.supply}
                      </span>
                      {zone.demand > zone.supply * 2 && (
                        <AlertTriangle className="w-4 h-4 text-warning-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      zone.status === 'active' && 'bg-success-100 dark:bg-success-900/30 text-success-600',
                      zone.status === 'scheduled' && 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
                      zone.status === 'paused' && 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    )}>
                      {zone.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {zone.startTime} - {zone.endTime}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {zone.status === 'active' ? (
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Pause className="w-4 h-4 text-slate-500" />
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Play className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
