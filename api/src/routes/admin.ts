import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { authenticateToken, requireAdmin } from '../auth';
import bcrypt from 'bcryptjs';

const router = Router();

router.use(authenticateToken, requireAdmin);

// === 用户管理 ===
router.get('/users', (req: Request, res: Response) => {
  const db = getDb();
  const users = db.all('SELECT u.id, u.username, u.role, u.buildingId, b.name as buildingName, u.createdAt FROM users u LEFT JOIN buildings b ON u.buildingId = b.id ORDER BY u.id');
  res.json(users);
});

router.post('/users', (req: Request, res: Response) => {
  const db = getDb();
  const { username, password, buildingId } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }
  const existing = db.get('SELECT id FROM users WHERE username = ?', username);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.insert(
    'INSERT INTO users (username, password, role, buildingId) VALUES (?, ?, ?, ?)',
    username, hashedPassword, 'user', buildingId || null
  );
  db.save();
  res.status(201).json({ id: result.lastInsertRowid, username, role: 'user', buildingId: buildingId || null });
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const db = getDb();
  const userId = parseInt(req.params.id);
  const user = db.get('SELECT id, role FROM users WHERE id = ?', userId);
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  if (user.role === 'admin') {
    res.status(403).json({ error: '不能删除管理员账号' });
    return;
  }
  db.run('DELETE FROM users WHERE id = ?', userId);
  db.save();
  res.json({ message: '用户已删除' });
});

router.put('/users/:id', (req: Request, res: Response) => {
  const db = getDb();
  const userId = parseInt(req.params.id);
  const { username, buildingId } = req.body;
  const existing = db.get('SELECT id FROM users WHERE username = ? AND id != ?', username, userId);
  if (existing) {
    res.status(409).json({ error: '用户名已存在' });
    return;
  }
  db.run('UPDATE users SET username = ?, buildingId = ? WHERE id = ?', username, buildingId || null, userId);
  db.save();
  res.json({ message: '用户已更新' });
});

// === 楼栋管理 ===
router.post('/buildings', (req: Request, res: Response) => {
  const db = getDb();
  const { name, totalRooms } = req.body;
  if (!name || !totalRooms) {
    res.status(400).json({ error: '楼栋名称和房间数不能为空' });
    return;
  }
  const result = db.insert('INSERT INTO buildings (name, totalRooms) VALUES (?, ?)', name, totalRooms);
  db.save();
  res.status(201).json({ id: result.lastInsertRowid, name, totalRooms });
});

router.put('/buildings/:id', (req: Request, res: Response) => {
  const db = getDb();
  const buildingId = parseInt(req.params.id);
  const { name, totalRooms } = req.body;
  const building = db.get('SELECT * FROM buildings WHERE id = ?', buildingId);
  if (!building) {
    res.status(404).json({ error: '楼栋不存在' });
    return;
  }
  db.run('UPDATE buildings SET name = ?, totalRooms = ? WHERE id = ?', name, totalRooms, buildingId);
  db.save();
  res.json({ message: '楼栋已更新' });
});

router.delete('/buildings/:id', (req: Request, res: Response) => {
  const db = getDb();
  const buildingId = parseInt(req.params.id);
  db.run('DELETE FROM rooms WHERE buildingId = ?', buildingId);
  db.run('DELETE FROM anomaly_alerts WHERE roomId IN (SELECT id FROM rooms WHERE buildingId = ?)', buildingId);
  db.run('DELETE FROM water_records WHERE roomId IN (SELECT id FROM rooms WHERE buildingId = ?)', buildingId);
  db.run('DELETE FROM electricity_records WHERE roomId IN (SELECT id FROM rooms WHERE buildingId = ?)', buildingId);
  db.run('DELETE FROM buildings WHERE id = ?', buildingId);
  db.save();
  res.json({ message: '楼栋已删除' });
});

// === 房间管理 ===
router.get('/rooms', (req: Request, res: Response) => {
  const db = getDb();
  const buildingId = req.query.buildingId;
  let rooms;
  if (buildingId) {
    rooms = db.all('SELECT r.*, b.name as buildingName FROM rooms r JOIN buildings b ON r.buildingId = b.id WHERE r.buildingId = ? ORDER BY r.roomNo', parseInt(buildingId as string));
  } else {
    rooms = db.all('SELECT r.*, b.name as buildingName FROM rooms r JOIN buildings b ON r.buildingId = b.id ORDER BY r.id');
  }
  res.json(rooms);
});

router.post('/rooms', (req: Request, res: Response) => {
  const db = getDb();
  const { buildingId, roomNo, floor } = req.body;
  if (!buildingId || !roomNo) {
    res.status(400).json({ error: '楼栋和房间号不能为空' });
    return;
  }
  const result = db.insert('INSERT INTO rooms (buildingId, roomNo, floor) VALUES (?, ?, ?)', buildingId, roomNo, floor || 1);
  db.save();
  res.status(201).json({ id: result.lastInsertRowid, buildingId, roomNo, floor: floor || 1 });
});

router.put('/rooms/:id', (req: Request, res: Response) => {
  const db = getDb();
  const roomId = parseInt(req.params.id);
  const { roomNo, floor, buildingId } = req.body;
  db.run('UPDATE rooms SET roomNo = ?, floor = ?, buildingId = ? WHERE id = ?', roomNo, floor, buildingId, roomId);
  db.save();
  res.json({ message: '房间已更新' });
});

router.delete('/rooms/:id', (req: Request, res: Response) => {
  const db = getDb();
  const roomId = parseInt(req.params.id);
  db.run('DELETE FROM anomaly_alerts WHERE roomId = ?', roomId);
  db.run('DELETE FROM water_records WHERE roomId = ?', roomId);
  db.run('DELETE FROM electricity_records WHERE roomId = ?', roomId);
  db.run('DELETE FROM rooms WHERE id = ?', roomId);
  db.save();
  res.json({ message: '房间已删除' });
});

// === 水电记录管理 ===
router.get('/records/water', (req: Request, res: Response) => {
  const db = getDb();
  const { roomId, limit } = req.query;
  if (roomId) {
    const records = db.all(
      'SELECT w.*, r.roomNo, b.name as buildingName FROM water_records w JOIN rooms r ON w.roomId = r.id JOIN buildings b ON r.buildingId = b.id WHERE w.roomId = ? ORDER BY w.recordTime DESC LIMIT ?',
      parseInt(roomId as string), parseInt(limit as string) || 30
    );
    res.json(records);
  } else {
    const records = db.all('SELECT w.*, r.roomNo, b.name as buildingName FROM water_records w JOIN rooms r ON w.roomId = r.id JOIN buildings b ON r.buildingId = b.id ORDER BY w.recordTime DESC LIMIT 100');
    res.json(records);
  }
});

router.get('/records/electricity', (req: Request, res: Response) => {
  const db = getDb();
  const { roomId, limit } = req.query;
  if (roomId) {
    const records = db.all(
      'SELECT e.*, r.roomNo, b.name as buildingName FROM electricity_records e JOIN rooms r ON e.roomId = r.id JOIN buildings b ON r.buildingId = b.id WHERE e.roomId = ? ORDER BY e.recordTime DESC LIMIT ?',
      parseInt(roomId as string), parseInt(limit as string) || 30
    );
    res.json(records);
  } else {
    const records = db.all('SELECT e.*, r.roomNo, b.name as buildingName FROM electricity_records e JOIN rooms r ON e.roomId = r.id JOIN buildings b ON r.buildingId = b.id ORDER BY e.recordTime DESC LIMIT 100');
    res.json(records);
  }
});

router.delete('/records/:type/:id', (req: Request, res: Response) => {
  const db = getDb();
  const recordType = req.params.type;
  const recordId = parseInt(req.params.id);
  const table = recordType === 'water' ? 'water_records' : 'electricity_records';
  db.run(`DELETE FROM ${table} WHERE id = ?`, recordId);
  db.save();
  res.json({ message: '记录已删除' });
});

// === 告警管理 ===
router.get('/alerts/all', (req: Request, res: Response) => {
  const db = getDb();
  const alerts = db.all('SELECT * FROM anomaly_alerts ORDER BY detectedAt DESC');
  res.json(alerts);
});

router.delete('/alerts/:id', (req: Request, res: Response) => {
  const db = getDb();
  const alertId = parseInt(req.params.id);
  db.run('DELETE FROM anomaly_alerts WHERE id = ?', alertId);
  db.save();
  res.json({ message: '告警已删除' });
});

export default router;
