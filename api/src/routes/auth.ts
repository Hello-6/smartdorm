import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database';
import { JWT_SECRET, authenticateToken } from '../auth';

const router = Router();

router.post('/register', (req: Request, res: Response) => {
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

  const token = jwt.sign(
    { id: result.lastInsertRowid, username, role: 'user', buildingId: buildingId || null },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, username, role: 'user', buildingId: buildingId || null },
  });
});

router.post('/login', (req: Request, res: Response) => {
  const db = getDb();
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '用户名和密码不能为空' });
    return;
  }

  const user = db.get(
    'SELECT id, username, password, role, buildingId FROM users WHERE username = ?',
    username
  ) as { id: number; username: string; password: string; role: 'admin' | 'user'; buildingId: number | null } | undefined;

  if (!user) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, buildingId: user.buildingId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, buildingId: user.buildingId },
  });
});

router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  const db = getDb();
  const user = db.get(
    'SELECT id, username, role, buildingId, createdAt FROM users WHERE id = ?',
    req.user!.id
  );

  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }

  res.json({ user });
});

export default router;
