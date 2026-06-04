import type { Building, Room, UtilityRecord, AnomalyAlert, DashboardStats } from './types';

const buildings: Building[] = [
  { id: 1, name: '三达A栋', totalRooms: 48 },
  { id: 2, name: '三达B栋', totalRooms: 48 },
  { id: 3, name: '三达C栋', totalRooms: 48 },
];

function generateRooms(): Room[] {
  const rooms: Room[] = [];
  let id = 1;
  for (const building of buildings) {
    const floors = building.totalRooms / 8;
    for (let i = 1; i <= building.totalRooms; i++) {
      const floor = Math.ceil(i / 8);
      const roomNum = 101 + (floor - 1) * 100 + ((i - 1) % 8) * 2 + 1;
      rooms.push({
        id,
        buildingId: building.id,
        roomNo: `${roomNum}`,
        floor,
      });
      id++;
    }
  }
  return rooms;
}

const rooms = generateRooms();

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateRecords(): { waterRecords: UtilityRecord[]; electricityRecords: UtilityRecord[]; alerts: AnomalyAlert[] } {
  const waterRecords: UtilityRecord[] = [];
  const electricityRecords: UtilityRecord[] = [];
  const alerts: AnomalyAlert[] = [];
  let waterId = 1;
  let electricId = 1;
  let alertId = 1;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString();

    for (const room of rooms) {
      const seedBase = room.id * 1000 + dayOffset;
      const baseWater = 0.3 + seededRandom(seedBase) * 0.5;
      const baseElectric = 1.5 + seededRandom(seedBase + 500) * 3.0;

      let waterUsage = baseWater;
      let electricUsage = baseElectric;

      if (seededRandom(seedBase + 1000) > 0.97) {
        waterUsage = baseWater * (2.5 + seededRandom(seedBase + 1001) * 2.0);
      }
      if (seededRandom(seedBase + 2000) > 0.96) {
        electricUsage = baseElectric * (2.5 + seededRandom(seedBase + 2001) * 2.0);
      }

      waterRecords.push({
        id: waterId++,
        roomId: room.id,
        recordTime: dateStr,
        usage: Math.round(waterUsage * 100) / 100,
        cost: Math.round(waterUsage * 3.5 * 100) / 100,
      });

      electricityRecords.push({
        id: electricId++,
        roomId: room.id,
        recordTime: dateStr,
        usage: Math.round(electricUsage * 100) / 100,
        cost: Math.round(electricUsage * 0.6 * 100) / 100,
      });

      if (waterUsage > baseWater * 2.0) {
        const building = buildings.find(b => b.id === room.buildingId)!;
        const severity = waterUsage > baseWater * 2.5 ? 'high' : 'mid';
        alerts.push({
          id: alertId++,
          roomId: room.id,
          roomNo: room.roomNo,
          buildingName: building.name,
          type: 'water',
          severity,
          description: severity === 'high'
            ? `${room.roomNo} 用水量异常突增（${waterUsage.toFixed(2)}吨），远超日常水平`
            : `${room.roomNo} 用水量偏高（${waterUsage.toFixed(2)}吨），需关注`,
          detectedAt: dateStr,
          status: 'pending',
        });
      }

      if (electricUsage > baseElectric * 2.0) {
        const building = buildings.find(b => b.id === room.buildingId)!;
        const severity = electricUsage > baseElectric * 2.5 ? 'high' : 'mid';
        alerts.push({
          id: alertId++,
          roomId: room.id,
          roomNo: room.roomNo,
          buildingName: building.name,
          type: 'electricity',
          severity,
          description: severity === 'high'
            ? `${room.roomNo} 用电量异常突增（${electricUsage.toFixed(2)}度），远超日常水平`
            : `${room.roomNo} 用电量偏高（${electricUsage.toFixed(2)}度），需关注`,
          detectedAt: dateStr,
          status: 'pending',
        });
      }
    }
  }

  const recentAlerts = alerts.filter(a => {
    const alertDate = new Date(a.detectedAt);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return alertDate >= sevenDaysAgo;
  });

  return { waterRecords, electricityRecords, alerts: recentAlerts };
}

const { waterRecords, electricityRecords, alerts } = generateRecords();

export function getBuildings(): Building[] {
  return buildings;
}

export function getRooms(): Room[] {
  return rooms;
}

export function getRoomsByBuilding(buildingId: number): Room[] {
  return rooms.filter(r => r.buildingId === buildingId);
}

export function getWaterRecords(): UtilityRecord[] {
  return waterRecords;
}

export function getElectricityRecords(): UtilityRecord[] {
  return electricityRecords;
}

export function getRecordsByRoom(roomId: number): { water: UtilityRecord[]; electricity: UtilityRecord[] } {
  return {
    water: waterRecords.filter(r => r.roomId === roomId).slice(-7),
    electricity: electricityRecords.filter(r => r.roomId === roomId).slice(-7),
  };
}

export function getAlerts(): AnomalyAlert[] {
  return alerts;
}

export function getDashboardStats(): DashboardStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthWater = waterRecords.filter(r => new Date(r.recordTime) >= monthStart);
  const monthElectric = electricityRecords.filter(r => new Date(r.recordTime) >= monthStart);

  const totalWaterUsage = Math.round(monthWater.reduce((s, r) => s + r.usage, 0) * 100) / 100;
  const totalElectricityUsage = Math.round(monthElectric.reduce((s, r) => s + r.usage, 0) * 100) / 100;
  const totalCost = Math.round(monthWater.reduce((s, r) => s + r.cost, 0) + monthElectric.reduce((s, r) => s + r.cost, 0));

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const prevWeekStart = new Date(sevenDaysAgo);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const thisWeekWater = waterRecords.filter(r => {
    const d = new Date(r.recordTime);
    return d >= sevenDaysAgo && d < today;
  });
  const prevWeekWater = waterRecords.filter(r => {
    const d = new Date(r.recordTime);
    return d >= prevWeekStart && d < sevenDaysAgo;
  });
  const thisWeekTotal = thisWeekWater.reduce((s, r) => s + r.usage, 0);
  const prevWeekTotal = prevWeekWater.reduce((s, r) => s + r.usage, 0);
  const waterTrend = prevWeekTotal > 0 ? ((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100 : 0;

  const thisWeekElectric = electricityRecords.filter(r => {
    const d = new Date(r.recordTime);
    return d >= sevenDaysAgo && d < today;
  });
  const prevWeekElectric = electricityRecords.filter(r => {
    const d = new Date(r.recordTime);
    return d >= prevWeekStart && d < sevenDaysAgo;
  });
  const thisWeekElectricTotal = thisWeekElectric.reduce((s, r) => s + r.usage, 0);
  const prevWeekElectricTotal = prevWeekElectric.reduce((s, r) => s + r.usage, 0);
  const electricityTrend = prevWeekElectricTotal > 0 ? ((thisWeekElectricTotal - prevWeekElectricTotal) / prevWeekElectricTotal) * 100 : 0;

  return {
    totalWaterUsage,
    totalElectricityUsage,
    totalCost,
    anomalyCount: alerts.filter(a => a.status === 'pending').length,
    waterTrend: Math.round(waterTrend * 100) / 100,
    electricityTrend: Math.round(electricityTrend * 100) / 100,
  };
}

export function getTrendData(days: number): { date: string; water: number; electricity: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: { date: string; water: number; electricity: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayWater = waterRecords
      .filter(r => new Date(r.recordTime).toISOString().split('T')[0] === dateStr)
      .reduce((s, r) => s + r.usage, 0);
    const dayElectric = electricityRecords
      .filter(r => new Date(r.recordTime).toISOString().split('T')[0] === dateStr)
      .reduce((s, r) => s + r.usage, 0);

    result.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      water: Math.round(dayWater * 100) / 100,
      electricity: Math.round(dayElectric * 100) / 100,
    });
  }
  return result;
}

export function getBuildingCompareData(): { name: string; water: number; electricity: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return buildings.map(building => {
    const buildingRooms = rooms.filter(r => r.buildingId === building.id);
    const roomIds = buildingRooms.map(r => r.id);

    const buildingWater = waterRecords
      .filter(r => roomIds.includes(r.roomId) && new Date(r.recordTime) >= monthStart)
      .reduce((s, r) => s + r.usage, 0);
    const buildingElectric = electricityRecords
      .filter(r => roomIds.includes(r.roomId) && new Date(r.recordTime) >= monthStart)
      .reduce((s, r) => s + r.usage, 0);

    return {
      name: building.name,
      water: Math.round(buildingWater * 100) / 100,
      electricity: Math.round(buildingElectric * 100) / 100,
    };
  });
}

export function getBuildingDetail(buildingId: number): {
  rooms: Room[];
  waterRecords: UtilityRecord[];
  electricityRecords: UtilityRecord[];
} {
  const buildingRooms = rooms.filter(r => r.buildingId === buildingId);
  const roomIds = buildingRooms.map(r => r.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    rooms: buildingRooms,
    waterRecords: waterRecords.filter(r => roomIds.includes(r.roomId) && new Date(r.recordTime) >= monthStart),
    electricityRecords: electricityRecords.filter(r => roomIds.includes(r.roomId) && new Date(r.recordTime) >= monthStart),
  };
}

export const timeRanges = [
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
  { label: '近30天', value: 30 },
];
