export interface Building {
  id: number;
  name: string;
  totalRooms: number;
}

export interface Room {
  id: number;
  buildingId: number;
  roomNo: string;
  floor: number;
}

export interface UtilityRecord {
  id: number;
  roomId: number;
  recordTime: string;
  usage: number;
  cost: number;
}

export interface AnomalyAlert {
  id: number;
  roomId: number;
  roomNo: string;
  buildingName: string;
  type: 'water' | 'electricity';
  severity: 'high' | 'mid' | 'low';
  description: string;
  detectedAt: string;
  status: 'pending' | 'resolved' | 'ignored';
}

export interface TimeRange {
  label: string;
  value: number;
}

export interface AlertFilterState {
  type: 'all' | 'water' | 'electricity';
  buildingId: number | null;
  severity: 'all' | 'high' | 'mid' | 'low';
  status: 'all' | 'pending' | 'resolved' | 'ignored';
}

export interface DashboardStats {
  totalWaterUsage: number;
  totalElectricityUsage: number;
  totalCost: number;
  anomalyCount: number;
  waterTrend: number;
  electricityTrend: number;
}
