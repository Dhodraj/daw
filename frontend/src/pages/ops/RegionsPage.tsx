import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Search,
  Plus,
  Eye,
  MapPin,
  Users,
  Car,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Region {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  drivers: number;
  activeRides: number;
  demandLevel: 'low' | 'medium' | 'high';
  surgeMultiplier: number;
  coverage: string;
}

const regions: Region[] = [];

export default function RegionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = regions.filter((region) => {
    if (searchQuery) {
      return region.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getDemandColor = (level: Region['demandLevel']) => {
    switch (level) {
      case 'high':
        return 'text-error-500 bg-error-100 dark:bg-error-900/30';
      case 'medium':
        return 'text-warning-500 bg-warning-100 dark:bg-warning-900/30';
      case 'low':
        return 'text-success-500 bg-success-100 dark:bg-success-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Regions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage service areas and coverage zones
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
          <Plus className="w-4 h-4" />
          Add Region
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Map className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Interactive region map</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Click regions to edit coverage
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRegions.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400">No regions configured</p>
          </div>
        ) : filteredRegions.map((region, index) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {region.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {region.coverage}
                  </p>
                </div>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                region.status === 'active'
                  ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              )}>
                {region.status}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Drivers</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {region.drivers}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Active</span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {region.activeRides}
                </p>
              </div>
            </div>

            {/* Demand & Surge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Demand:</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  getDemandColor(region.demandLevel)
                )}>
                  {region.demandLevel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-warning-500" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {region.surgeMultiplier}x
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
