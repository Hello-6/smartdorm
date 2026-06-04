import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'dormitory.db');

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

class Database {
  private db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this.db = db;
  }

  run(sql: string, ...params: any[]): void {
    this.db.run(sql, params);
  }

  exec(sql: string): any {
    return this.db.exec(sql);
  }

  get(sql: string, ...params: any[]): any {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return undefined;
  }

  all(sql: string, ...params: any[]): any[] {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  insert(sql: string, ...params: any[]): { lastInsertRowid: number; changes: number } {
    this.db.run(sql, params);
    const result = this.get('SELECT last_insert_rowid() as id, changes() as changes')!;
    return { lastInsertRowid: result.id, changes: result.changes };
  }

  save(): void {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

let db: Database;

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  let sqlJsDb: SqlJsDatabase;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlJsDb = new SQL.Database(fileBuffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  sqlJsDb.run('PRAGMA foreign_keys = ON');

  sqlJsDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      buildingId INTEGER,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      totalRooms INTEGER NOT NULL DEFAULT 60
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buildingId INTEGER NOT NULL,
      roomNo TEXT NOT NULL,
      floor INTEGER NOT NULL,
      FOREIGN KEY (buildingId) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS water_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      recordTime TEXT NOT NULL,
      usage REAL NOT NULL,
      cost REAL NOT NULL,
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS electricity_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      recordTime TEXT NOT NULL,
      usage REAL NOT NULL,
      cost REAL NOT NULL,
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS anomaly_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      roomNo TEXT NOT NULL,
      buildingName TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('water', 'electricity')),
      severity TEXT NOT NULL CHECK(severity IN ('high', 'mid', 'low')),
      description TEXT NOT NULL,
      detectedAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'resolved', 'ignored')),
      FOREIGN KEY (roomId) REFERENCES rooms(id)
    );
  `);

  db = new Database(sqlJsDb);

  const userCount = db.get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0) {
    return db;
  }

  const buildingNames = [
    { name: '三达A栋', totalRooms: 48 },
    { name: '三达B栋', totalRooms: 48 },
    { name: '三达C栋', totalRooms: 48 },
  ];

  for (const b of buildingNames) {
    db.insert('INSERT INTO buildings (name, totalRooms) VALUES (?, ?)', b.name, b.totalRooms);
  }

  const buildings = db.all('SELECT * FROM buildings');

  for (const building of buildings) {
    const floors = Math.ceil(building.totalRooms / 8);
    let roomIndex = 1;
    for (let f = 1; f <= floors && roomIndex <= building.totalRooms; f++) {
      for (let r = 1; r <= 8 && roomIndex <= building.totalRooms; r++) {
        const roomNum = 101 + (f - 1) * 100 + (r - 1) * 2 + 1;
        const roomNo = `${roomNum}`;
        db.insert('INSERT INTO rooms (buildingId, roomNo, floor) VALUES (?, ?, ?)', building.id, roomNo, f);
        roomIndex++;
      }
    }
  }

  const rooms = db.all('SELECT * FROM rooms');

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

      db.insert(
        'INSERT INTO water_records (roomId, recordTime, usage, cost) VALUES (?, ?, ?, ?)',
        room.id,
        dateStr,
        Math.round(waterUsage * 100) / 100,
        Math.round(waterUsage * 3.5 * 100) / 100
      );

      db.insert(
        'INSERT INTO electricity_records (roomId, recordTime, usage, cost) VALUES (?, ?, ?, ?)',
        room.id,
        dateStr,
        Math.round(electricUsage * 100) / 100,
        Math.round(electricUsage * 0.6 * 100) / 100
      );

      if (waterUsage > baseWater * 2.0) {
        const building = buildings.find((b: any) => b.id === room.buildingId)!;
        const severity: 'high' | 'mid' = waterUsage > baseWater * 2.5 ? 'high' : 'mid';
        db.insert(
          'INSERT INTO anomaly_alerts (roomId, roomNo, buildingName, type, severity, description, detectedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          room.id,
          room.roomNo,
          building.name,
          'water',
          severity,
          severity === 'high'
            ? `${room.roomNo} 用水量异常突增（${waterUsage.toFixed(2)}吨），远超日常水平`
            : `${room.roomNo} 用水量偏高（${waterUsage.toFixed(2)}吨），需关注`,
          dateStr,
          'pending'
        );
      }

      if (electricUsage > baseElectric * 2.0) {
        const building = buildings.find((b: any) => b.id === room.buildingId)!;
        const severity: 'high' | 'mid' = electricUsage > baseElectric * 2.5 ? 'high' : 'mid';
        db.insert(
          'INSERT INTO anomaly_alerts (roomId, roomNo, buildingName, type, severity, description, detectedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          room.id,
          room.roomNo,
          building.name,
          'electricity',
          severity,
          severity === 'high'
            ? `${room.roomNo} 用电量异常突增（${electricUsage.toFixed(2)}度），远超日常水平`
            : `${room.roomNo} 用电量偏高（${electricUsage.toFixed(2)}度），需关注`,
          dateStr,
          'pending'
        );
      }
    }
  }

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  db.run('DELETE FROM anomaly_alerts WHERE detectedAt < ?', sevenDaysAgo.toISOString());

  const hashedAdminPassword = bcrypt.hashSync('123456', 10);

  db.insert(
    'INSERT INTO users (username, password, role, buildingId) VALUES (?, ?, ?, ?)',
    'adm', hashedAdminPassword, 'admin', null
  );

  db.save();
  return db;
}

export function getDb(): Database {
  return db;
}


