import { create } from 'zustand';
import type { AlertFilterState } from '@/data/types';

interface AppState {
  sidebarCollapsed: boolean;
  currentTimeRange: number;
  alertFilter: AlertFilterState;
  toggleSidebar: () => void;
  setTimeRange: (days: number) => void;
  setAlertFilter: (filter: Partial<AlertFilterState>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentTimeRange: 7,
  alertFilter: {
    type: 'all',
    buildingId: null,
    severity: 'all',
    status: 'all',
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTimeRange: (days) => set({ currentTimeRange: days }),
  setAlertFilter: (filter) => set((state) => ({
    alertFilter: { ...state.alertFilter, ...filter },
  })),
}));
