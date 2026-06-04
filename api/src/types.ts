export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  buildingId: number | null;
  createdAt: string;
}

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

export interface DashboardStats {
  totalWaterUsage: number;
  totalElectricityUsage: number;
  totalCost: number;
  anomalyCount: number;
  waterTrend: number;
  electricityTrend: number;
}
