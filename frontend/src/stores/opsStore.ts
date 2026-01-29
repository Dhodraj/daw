import { create } from 'zustand';

export interface SystemMetrics {
  activeRides: number;
  onlineDrivers: number;
  totalDrivers: number;
  revenueToday: number;
  avgWaitTime: number;
  ridesPending: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: string;
}

export interface Region {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  drivers: number;
  activeRides: number;
  demandLevel: 'low' | 'medium' | 'high';
  surgeMultiplier: number;
}

export interface SurgeZone {
  id: string;
  region: string;
  multiplier: number;
  demand: number;
  supply: number;
  status: 'active' | 'scheduled' | 'paused';
}

interface OpsState {
  // Metrics
  metrics: SystemMetrics;
  isLoadingMetrics: boolean;

  // Alerts
  alerts: Alert[];
  unreadAlerts: number;

  // Regions
  regions: Region[];
  selectedRegion: Region | null;

  // Surge
  surgeZones: SurgeZone[];
  autoSurgeEnabled: boolean;

  // Filters
  dateRange: { start: Date; end: Date };

  // Actions
  setMetrics: (metrics: SystemMetrics) => void;
  setLoadingMetrics: (loading: boolean) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  dismissAlert: (id: string) => void;
  setRegions: (regions: Region[]) => void;
  selectRegion: (region: Region | null) => void;
  setSurgeZones: (zones: SurgeZone[]) => void;
  updateSurgeZone: (id: string, updates: Partial<SurgeZone>) => void;
  setAutoSurge: (enabled: boolean) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
}

const initialMetrics: SystemMetrics = {
  activeRides: 0,
  onlineDrivers: 0,
  totalDrivers: 0,
  revenueToday: 0,
  avgWaitTime: 0,
  ridesPending: 0,
};

export const useOpsStore = create<OpsState>((set, get) => ({
  metrics: initialMetrics,
  isLoadingMetrics: false,
  alerts: [],
  unreadAlerts: 0,
  regions: [],
  selectedRegion: null,
  surgeZones: [],
  autoSurgeEnabled: true,
  dateRange: {
    start: new Date(),
    end: new Date(),
  },

  setMetrics: (metrics) => set({ metrics }),

  setLoadingMetrics: (isLoadingMetrics) => set({ isLoadingMetrics }),

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadAlerts: alerts.filter((a) => !a.isRead).length,
    }),

  addAlert: (alert) => {
    const { alerts } = get();
    set({
      alerts: [alert, ...alerts],
      unreadAlerts: get().unreadAlerts + (alert.isRead ? 0 : 1),
    });
  },

  markAlertRead: (id) => {
    const { alerts } = get();
    const alert = alerts.find((a) => a.id === id);
    if (alert && !alert.isRead) {
      set({
        alerts: alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
        unreadAlerts: get().unreadAlerts - 1,
      });
    }
  },

  markAllAlertsRead: () => {
    const { alerts } = get();
    set({
      alerts: alerts.map((a) => ({ ...a, isRead: true })),
      unreadAlerts: 0,
    });
  },

  dismissAlert: (id) => {
    const { alerts } = get();
    const alert = alerts.find((a) => a.id === id);
    set({
      alerts: alerts.filter((a) => a.id !== id),
      unreadAlerts: alert && !alert.isRead ? get().unreadAlerts - 1 : get().unreadAlerts,
    });
  },

  setRegions: (regions) => set({ regions }),

  selectRegion: (region) => set({ selectedRegion: region }),

  setSurgeZones: (surgeZones) => set({ surgeZones }),

  updateSurgeZone: (id, updates) => {
    const { surgeZones } = get();
    set({
      surgeZones: surgeZones.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    });
  },

  setAutoSurge: (autoSurgeEnabled) => set({ autoSurgeEnabled }),

  setDateRange: (dateRange) => set({ dateRange }),
}));
