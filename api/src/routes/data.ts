import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { authenticateToken } from '../auth';

const router = Router();

router.get('/buildings/public', (req: Request, res: Response) => {
  const db = getDb();
  const buildings = db.all('SELECT id, name, totalRooms FROM buildings');
  res.json(buildings);
});

router.use(authenticateToken);

function getBuildingIds(user: { role: string; buildingId: number | null }): number[] {
  const db = getDb();
  if (user.role === 'admin') {
    const buildings = db.all('SELECT id FROM buildings');
    return buildings.map((b: any) => b.id);
  }
  return user.buildingId ? [user.buildingId] : [];
}

function buildPlaceholders(ids: number[]): string {
  return ids.map(() => '?').join(',');
}

router.get('/stats', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  const placeholders = buildPlaceholders(buildingIds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  const totalWaterRow = db.get(`
    SELECT COALESCE(SUM(w.usage), 0) as totalUsage, COALESCE(SUM(w.cost), 0) as totalCost
    FROM water_records w
    JOIN rooms r ON w.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND w.recordTime >= ?
  `, ...buildingIds, monthStartStr);

  const totalElectricRow = db.get(`
    SELECT COALESCE(SUM(e.usage), 0) as totalUsage, COALESCE(SUM(e.cost), 0) as totalCost
    FROM electricity_records e
    JOIN rooms r ON e.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND e.recordTime >= ?
  `, ...buildingIds, monthStartStr);

  const anomalyCount = db.get(`
    SELECT COUNT(*) as count FROM anomaly_alerts a
    JOIN rooms r ON a.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND a.status = 'pending'
  `, ...buildingIds);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const prevWeekStart = new Date(sevenDaysAgo);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const thisWeekWater = db.get(`
    SELECT COALESCE(SUM(w.usage), 0) as total
    FROM water_records w
    JOIN rooms r ON w.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND w.recordTime >= ? AND w.recordTime < ?
  `, ...buildingIds, sevenDaysAgo.toISOString(), today.toISOString());

  const prevWeekWater = db.get(`
    SELECT COALESCE(SUM(w.usage), 0) as total
    FROM water_records w
    JOIN rooms r ON w.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND w.recordTime >= ? AND w.recordTime < ?
  `, ...buildingIds, prevWeekStart.toISOString(), sevenDaysAgo.toISOString());

  const waterTrend = prevWeekWater.total > 0
    ? ((thisWeekWater.total - prevWeekWater.total) / prevWeekWater.total) * 100
    : 0;

  const thisWeekElectric = db.get(`
    SELECT COALESCE(SUM(e.usage), 0) as total
    FROM electricity_records e
    JOIN rooms r ON e.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND e.recordTime >= ? AND e.recordTime < ?
  `, ...buildingIds, sevenDaysAgo.toISOString(), today.toISOString());

  const prevWeekElectric = db.get(`
    SELECT COALESCE(SUM(e.usage), 0) as total
    FROM electricity_records e
    JOIN rooms r ON e.roomId = r.id
    WHERE r.buildingId IN (${placeholders}) AND e.recordTime >= ? AND e.recordTime < ?
  `, ...buildingIds, prevWeekStart.toISOString(), sevenDaysAgo.toISOString());

  const electricityTrend = prevWeekElectric.total > 0
    ? ((thisWeekElectric.total - prevWeekElectric.total) / prevWeekElectric.total) * 100
    : 0;

  res.json({
    totalWaterUsage: Math.round(totalWaterRow.totalUsage * 100) / 100,
    totalElectricityUsage: Math.round(totalElectricRow.totalUsage * 100) / 100,
    totalCost: Math.round((totalWaterRow.totalCost + totalElectricRow.totalCost) * 100) / 100,
    anomalyCount: anomalyCount.count,
    waterTrend: Math.round(waterTrend * 100) / 100,
    electricityTrend: Math.round(electricityTrend * 100) / 100,
  });
});

router.get('/trend', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  const placeholders = buildPlaceholders(buildingIds);
  const days = parseInt(req.query.days as string) || 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: { date: string; water: number; electricity: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayWater = db.get(`
      SELECT COALESCE(SUM(w.usage), 0) as total
      FROM water_records w
      JOIN rooms r ON w.roomId = r.id
      WHERE r.buildingId IN (${placeholders}) AND w.recordTime LIKE ?
    `, ...buildingIds, `${dateStr}%`);

    const dayElectric = db.get(`
      SELECT COALESCE(SUM(e.usage), 0) as total
      FROM electricity_records e
      JOIN rooms r ON e.roomId = r.id
      WHERE r.buildingId IN (${placeholders}) AND e.recordTime LIKE ?
    `, ...buildingIds, `${dateStr}%`);

    result.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      water: Math.round(dayWater.total * 100) / 100,
      electricity: Math.round(dayElectric.total * 100) / 100,
    });
  }

  res.json(result);
});

router.get('/buildings/compare', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  const placeholders = buildPlaceholders(buildingIds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  const buildings = db.all(`SELECT * FROM buildings WHERE id IN (${placeholders})`, ...buildingIds);

  const result = buildings.map((building: any) => {
    const rooms = db.all('SELECT id FROM rooms WHERE buildingId = ?', building.id);
    const roomIds = rooms.map((r: any) => r.id);
    if (roomIds.length === 0) {
      return { name: building.name, water: 0, electricity: 0 };
    }
    const roomPlaceholders = buildPlaceholders(roomIds);

    const waterTotal = db.get(`
      SELECT COALESCE(SUM(usage), 0) as total
      FROM water_records
      WHERE roomId IN (${roomPlaceholders}) AND recordTime >= ?
    `, ...roomIds, monthStartStr);

    const electricTotal = db.get(`
      SELECT COALESCE(SUM(usage), 0) as total
      FROM electricity_records
      WHERE roomId IN (${roomPlaceholders}) AND recordTime >= ?
    `, ...roomIds, monthStartStr);

    return {
      name: building.name,
      water: Math.round(waterTotal.total * 100) / 100,
      electricity: Math.round(electricTotal.total * 100) / 100,
    };
  });

  res.json(result);
});

router.get('/buildings', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  const placeholders = buildPlaceholders(buildingIds);
  const buildings = db.all(`SELECT id, name, totalRooms FROM buildings WHERE id IN (${placeholders})`, ...buildingIds);
  res.json(buildings);
});

router.get('/user-bill', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  if (buildingIds.length === 0 || req.user!.role === 'admin') {
    res.json({ building: null, rooms: [] });
    return;
  }
  const buildingId = buildingIds[0];
  const building = db.get('SELECT * FROM buildings WHERE id = ?', buildingId);
  if (!building) {
    res.json({ building: null, rooms: [] });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearStartStr = yearStart.toISOString();

  const rooms = db.all('SELECT id, roomNo, floor FROM rooms WHERE buildingId = ? ORDER BY roomNo', buildingId);
  const roomIds = rooms.map((r: any) => r.id);
  const placeholders = buildPlaceholders(roomIds);

  const waterRecords = roomIds.length > 0
    ? db.all(`SELECT roomId, SUM(usage) as totalUsage, SUM(cost) as totalCost FROM water_records WHERE roomId IN (${placeholders}) AND recordTime >= ? GROUP BY roomId`, ...roomIds, monthStartStr)
    : [];

  const electricityRecords = roomIds.length > 0
    ? db.all(`SELECT roomId, SUM(usage) as totalUsage, SUM(cost) as totalCost FROM electricity_records WHERE roomId IN (${placeholders}) AND recordTime >= ? GROUP BY roomId`, ...roomIds, monthStartStr)
    : [];

  const waterMap: Record<number, { usage: number; cost: number }> = {};
  for (const r of waterRecords) {
    waterMap[r.roomId] = { usage: Math.round(r.totalUsage * 100) / 100, cost: Math.round(r.totalCost * 100) / 100 };
  }

  const electricMap: Record<number, { usage: number; cost: number }> = {};
  for (const r of electricityRecords) {
    electricMap[r.roomId] = { usage: Math.round(r.totalUsage * 100) / 100, cost: Math.round(r.totalCost * 100) / 100 };
  }

  const roomBills = rooms.map((room: any) => ({
    roomNo: room.roomNo,
    floor: room.floor,
    water: waterMap[room.id] || { usage: 0, cost: 0 },
    electricity: electricMap[room.id] || { usage: 0, cost: 0 },
    totalCost: (waterMap[room.id]?.cost || 0) + (electricMap[room.id]?.cost || 0),
  }));

  const totalWaterUsage = Math.round(roomBills.reduce((s: number, r: any) => s + r.water.usage, 0) * 100) / 100;
  const totalElectricUsage = Math.round(roomBills.reduce((s: number, r: any) => s + r.electricity.usage, 0) * 100) / 100;
  const totalWaterCost = Math.round(roomBills.reduce((s: number, r: any) => s + r.water.cost, 0) * 100) / 100;
  const totalElectricCost = Math.round(roomBills.reduce((s: number, r: any) => s + r.electricity.cost, 0) * 100) / 100;

  const yearlyWater: { month: number; usage: number; cost: number }[] = [];
  const yearlyElectric: { month: number; usage: number; cost: number }[] = [];

  for (let m = 0; m <= today.getMonth(); m++) {
    const mStart = new Date(today.getFullYear(), m, 1);
    const mEnd = new Date(today.getFullYear(), m + 1, 1);
    const mStartStr = mStart.toISOString();
    const mEndStr = mEnd.toISOString();

    const mWater = db.get(`SELECT COALESCE(SUM(usage), 0) as usage, COALESCE(SUM(cost), 0) as cost FROM water_records WHERE roomId IN (${placeholders}) AND recordTime >= ? AND recordTime < ?`, ...roomIds, mStartStr, mEndStr);
    const mElectric = db.get(`SELECT COALESCE(SUM(usage), 0) as usage, COALESCE(SUM(cost), 0) as cost FROM electricity_records WHERE roomId IN (${placeholders}) AND recordTime >= ? AND recordTime < ?`, ...roomIds, mStartStr, mEndStr);

    yearlyWater.push({ month: m + 1, usage: Math.round(mWater.usage * 100) / 100, cost: Math.round(mWater.cost * 100) / 100 });
    yearlyElectric.push({ month: m + 1, usage: Math.round(mElectric.usage * 100) / 100, cost: Math.round(mElectric.cost * 100) / 100 });
  }

  const roomYearly = rooms.map((room: any) => {
    const roomYearlyWater: { month: number; usage: number }[] = [];
    const roomYearlyElectric: { month: number; usage: number }[] = [];
    for (let m = 0; m <= today.getMonth(); m++) {
      const mStart = new Date(today.getFullYear(), m, 1);
      const mEnd = new Date(today.getFullYear(), m + 1, 1);
      const mStartStr = mStart.toISOString();
      const mEndStr = mEnd.toISOString();
      const mw = db.get('SELECT COALESCE(SUM(usage), 0) as usage FROM water_records WHERE roomId = ? AND recordTime >= ? AND recordTime < ?', room.id, mStartStr, mEndStr);
      const me = db.get('SELECT COALESCE(SUM(usage), 0) as usage FROM electricity_records WHERE roomId = ? AND recordTime >= ? AND recordTime < ?', room.id, mStartStr, mEndStr);
      roomYearlyWater.push({ month: m + 1, usage: Math.round(mw.usage * 100) / 100 });
      roomYearlyElectric.push({ month: m + 1, usage: Math.round(me.usage * 100) / 100 });
    }
    return {
      roomNo: room.roomNo,
      floor: room.floor,
      water: roomBills.find((rb: any) => rb.roomNo === room.roomNo)?.water || { usage: 0, cost: 0 },
      electricity: roomBills.find((rb: any) => rb.roomNo === room.roomNo)?.electricity || { usage: 0, cost: 0 },
      totalCost: (roomBills.find((rb: any) => rb.roomNo === room.roomNo)?.totalCost || 0),
      yearlyWater: roomYearlyWater,
      yearlyElectric: roomYearlyElectric,
    };
  });

  res.json({
    building: { id: building.id, name: building.name },
    rooms: roomYearly,
    totalWaterUsage,
    totalElectricUsage,
    totalWaterCost,
    totalElectricCost,
    totalCost: Math.round((totalWaterCost + totalElectricCost) * 100) / 100,
    yearlyWater,
    yearlyElectric,
  });
});

router.post('/user/pay', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  if (buildingIds.length === 0 || req.user!.role === 'admin') {
    res.status(400).json({ error: '无权操作' });
    return;
  }
  const buildingId = buildingIds[0];
  db.run('UPDATE buildings SET name = name WHERE id = ?', buildingId);
  db.save();
  res.json({ message: '缴费成功', paidAt: new Date().toISOString() });
});

router.get('/buildings/:id/detail', (req: Request, res: Response) => {
  const db = getDb();
  const buildingId = parseInt(req.params.id);
  const buildingIds = getBuildingIds(req.user!);

  if (!buildingIds.includes(buildingId) && req.user!.role !== 'admin') {
    res.status(403).json({ error: '无权访问该楼栋数据' });
    return;
  }

  const building = db.get('SELECT * FROM buildings WHERE id = ?', buildingId);
  if (!building) {
    res.status(404).json({ error: '楼栋不存在' });
    return;
  }

  const rooms = db.all('SELECT * FROM rooms WHERE buildingId = ?', buildingId);

  const roomIds = rooms.map((r: any) => r.id);
  const roomPlaceholders = buildPlaceholders(roomIds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  const waterRecords = roomIds.length > 0
    ? db.all(`SELECT * FROM water_records WHERE roomId IN (${roomPlaceholders}) AND recordTime >= ?`, ...roomIds, monthStartStr)
    : [];

  const electricityRecords = roomIds.length > 0
    ? db.all(`SELECT * FROM electricity_records WHERE roomId IN (${roomPlaceholders}) AND recordTime >= ?`, ...roomIds, monthStartStr)
    : [];

  res.json({ building, rooms, waterRecords, electricityRecords });
});

router.get('/alerts', (req: Request, res: Response) => {
  const db = getDb();
  const buildingIds = getBuildingIds(req.user!);
  const placeholders = buildPlaceholders(buildingIds);

  let sql = `
    SELECT a.* FROM anomaly_alerts a
    JOIN rooms r ON a.roomId = r.id
    WHERE r.buildingId IN (${placeholders})
  `;
  const params: any[] = [...buildingIds];

  const { type, buildingId, severity, status } = req.query;

  if (type && type !== 'all') {
    sql += ' AND a.type = ?';
    params.push(type);
  }
  if (buildingId) {
    sql += ' AND r.buildingId = ?';
    params.push(parseInt(buildingId as string));
  }
  if (severity && severity !== 'all') {
    sql += ' AND a.severity = ?';
    params.push(severity);
  }
  if (status && status !== 'all') {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.detectedAt DESC';

  const alerts = db.all(sql, ...params);
  res.json(alerts);
});

router.put('/alerts/:id/status', (req: Request, res: Response) => {
  const db = getDb();
  const alertId = parseInt(req.params.id);
  const { status: newStatus } = req.body;

  if (!newStatus || !['pending', 'resolved', 'ignored'].includes(newStatus)) {
    res.status(400).json({ error: '无效的状态值' });
    return;
  }

  const alert = db.get('SELECT * FROM anomaly_alerts WHERE id = ?', alertId);
  if (!alert) {
    res.status(404).json({ error: '告警不存在' });
    return;
  }

  db.run('UPDATE anomaly_alerts SET status = ? WHERE id = ?', newStatus, alertId);
  res.json({ message: '状态更新成功' });
});

export default router;
