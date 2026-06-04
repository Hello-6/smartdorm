import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './database';
import authRouter from './routes/auth';
import dataRouter from './routes/data';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));

// 文档下载页面
const projectRoot = path.resolve(__dirname, '../..');
app.get('/docs', (_req, res) => {
  const docsDir = path.resolve(__dirname, '../..');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md') && f.startsWith('SmartDorm-'));
  const links = files.map(f => `<li><a href="/docs/${encodeURIComponent(f)}" download>${f}</a> (${(fs.statSync(path.join(docsDir, f)).size / 1024).toFixed(1)} KB)</li>`).join('\n');
  res.send(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>SmartDorm - 项目文件下载</title><style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:20px;background:#f8fafc;color:#334155}h1{color:#0d9488;border-bottom:2px solid #0d9488;padding-bottom:10px}.card{background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-top:20px}ul{list-style:none;padding:0}li{padding:10px 0;border-bottom:1px solid #e2e8f0}li:last-child{border-bottom:none}a{color:#0d9488;text-decoration:none;font-size:15px}a:hover{color:#0f766e;text-decoration:underline}.btn{display:inline-block;background:#0d9488;color:#fff!important;padding:10px 24px;border-radius:8px;font-weight:600;margin-top:16px}.btn:hover{background:#0f766e!important;text-decoration:none!important}.badge{display:inline-block;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:12px;margin-left:8px}.meta{color:#94a3b8;font-size:13px;margin-top:4px}</style></head><body><h1>📦 SmartDorm 项目文件</h1><div class="card"><h2>📄 项目文档</h2><p class="meta">点击文件名即可下载</p><ul>${links}</ul><hr style="margin:20px 0;border-color:#e2e8f0"><h2>🌐 访问系统</h2><p>直接打开系统：<a href="/" class="btn" style="display:inline-block;margin-top:8px">进入 SmartDorm 系统 →</a></p></div><div class="card"><h2>📋 说明</h2><p>所有文档为 Markdown 格式，可用 VS Code、Typora 等编辑器打开。</p><p>如需 Word 格式，可用在线工具转换。</p></div></body></html>`);
});
app.use('/docs', express.static(projectRoot, { index: false }));

initDatabase().then(() => {
  app.use('/api/auth', authRouter);
  app.use('/api', dataRouter);
  app.use('/api/admin', adminRouter);

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

export default app;
