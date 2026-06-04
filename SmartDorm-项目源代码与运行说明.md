# 智慧公寓能耗管理系统（SmartDorm）项目源代码与运行说明

---

## 1. 项目概述

SmartDorm 是一套基于 Web 的公寓水电能耗监控与管理系统，采用前后端分离架构。前端使用 React 18 + TypeScript + Vite 6，后端使用 Express.js 4 + SQLite 数据库。

---

## 2. 项目目录结构

```
SmartDorm/                          # 项目根目录
├── index.html                      # 前端入口 HTML
├── package.json                    # 前端依赖配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 构建配置
├── tailwind.config.js              # Tailwind CSS 配置
├── postcss.config.js               # PostCSS 配置
├── render.yaml                     # Render 云部署配置
├── DEPLOY.md                       # 云部署操作指南
│
├── src/                            # 前端源代码
│   ├── main.tsx                    # 前端入口文件
│   ├── App.tsx                     # 路由配置
│   ├── index.css                   # 全局样式
│   │
│   ├── components/                 # 公共组件
│   │   ├── Layout.tsx              # 管理员布局（侧边栏+汉堡菜单）
│   │   ├── UserLayout.tsx          # 普通用户布局
│   │   ├── ProtectedRoute.tsx      # 路由守卫
│   │   ├── StatCard.tsx            # 统计卡片
│   │   ├── TrendChart.tsx          # 趋势折线图
│   │   ├── BuildingCompare.tsx     # 楼栋对比柱状图
│   │   ├── DonutChart.tsx          # 环形图
│   │   ├── RoomTable.tsx           # 房间明细表格
│   │   ├── AlertList.tsx           # 告警列表
│   │   ├── AlertFilter.tsx         # 告警筛选栏
│   │   └── AnomalyBanner.tsx       # 异常滚动横幅
│   │
│   ├── pages/                      # 页面组件
│   │   ├── Login.tsx               # 登录页
│   │   ├── Register.tsx            # 注册页
│   │   ├── Dashboard.tsx           # 数据概览仪表板
│   │   ├── DormitoryDetail.tsx     # 楼栋详情
│   │   ├── AlertCenter.tsx         # 告警中心
│   │   │
│   │   └── admin/                  # 管理员页面
│   │       ├── UserManage.tsx      # 用户管理
│   │       ├── BuildingManage.tsx   # 楼栋管理
│   │       ├── RoomManage.tsx      # 房间管理
│   │       ├── RecordManage.tsx    # 数据管理
│   │       └── AlertManage.tsx     # 告警管理
│   │
│   ├── store/                      # 状态管理
│   │   ├── useAuthStore.ts         # 认证状态
│   │   └── useAppStore.ts          # 应用状态
│   │
│   ├── lib/                        # 工具库
│   │   └── api.ts                  # API 客户端封装
│   │
│   └── data/                       # 数据层
│       ├── types.ts                # 类型定义
│       └── mockData.ts             # 模拟数据
│
├── api/                            # 后端源代码
│   ├── package.json                # 后端依赖配置
│   ├── tsconfig.json               # TypeScript 配置
│   │
│   └── src/                        # 后端源码
│       ├── index.ts                # 服务入口（Express 服务器）
│       ├── database.ts             # 数据库初始化与查询封装
│       ├── auth.ts                 # JWT 认证中间件
│       │
│       └── routes/                 # API 路由
│           ├── auth.ts             # 认证路由（注册/登录）
│           ├── data.ts             # 数据路由（仪表板/楼栋/告警）
│           └── admin.ts            # 管理员路由（CRUD 操作）
│
├── dist/                           # 前端构建产物（自动生成）
│
└── *.md                            # 项目文档
    ├── SmartDorm-需求规格说明书.md
    ├── SmartDorm-软件设计说明书.md
    ├── SmartDorm-测试用例与测试报告.md
    ├── SmartDorm-用户使用说明书.md
    └── SmartDorm-软件工程标准与方法参考说明.md
```

---

## 3. 运行环境要求

| 环境 | 最低要求 |
|------|----------|
| 操作系统 | Windows 10 / macOS 12 / Linux |
| Node.js | **18.0 或更高版本** |
| npm | **9.0 或更高版本**（随 Node.js 安装） |
| 浏览器 | Chrome 90+ / Edge 90+ / Firefox 90+ |
| 内存 | ≥ 4GB |
| 磁盘空间 | ≥ 500MB |

---

## 4. 依赖安装

### 4.1 安装 Node.js

如果没有安装 Node.js，请前往官网下载安装：
- https://nodejs.org/ （下载 LTS 长期支持版本）

安装完成后打开终端验证：

```bash
node --version   # 应显示 v18.x.x 或更高
npm --version    # 应显示 9.x.x 或更高
```

### 4.2 安装前端依赖

在项目根目录打开终端：

```bash
cd SmartDorm                # 进入项目根目录
npm install                  # 安装前端依赖
```

安装完成后会生成 `node_modules` 目录。

> **加速安装：** 如果下载慢，可以临时切换为国内镜像源：
> ```bash
> npm config set registry https://registry.npmmirror.com
> npm install
> npm config set registry https://registry.npmjs.org  # 安装后恢复默认源
> ```

### 4.3 安装后端依赖

```bash
cd SmartDorm/api             # 进入后端目录
npm install                  # 安装后端依赖
```

### 4.4 安装内网穿透工具（可选，用于公网访问）

```bash
npm install -g tunnelmole    # 全局安装 tunnelmole
```

---

## 5. 数据库初始化

系统**无需手动初始化数据库**，数据库会自动完成以下步骤：

1. 首次启动后端服务时，自动检查是否存在 `api/dormitory.db` 文件
2. 如果文件不存在或损坏，自动创建数据库并执行以下操作：
   - 创建 6 张数据表（users、buildings、rooms、water_records、electricity_records、anomaly_alerts）
   - 插入 3 栋楼（三达A栋、三达B栋、三达C栋，各 48 间房）
   - 插入 144 间房
   - 生成过去 30 天的每日水电模拟数据（含随机波动和异常）
   - 创建管理员账号和测试用户
3. 如果数据库文件已存在且正常，直接使用

**手动重置数据库：**
```bash
cd SmartDorm/api
del dormitory.db             # Windows
# rm dormitory.db            # macOS / Linux
npm run dev                  # 重启服务后自动重新初始化
```

---

## 6. 启动方式

### 6.1 完整启动（前后端一起运行）

**步骤 1：构建前端**

```bash
cd SmartDorm                 # 项目根目录
npm run build                # 构建前端 → 输出到 dist/ 目录
```

构建成功会显示：
```
✓ built in X.XXs
```

**步骤 2：启动后端服务**

```bash
cd SmartDorm/api             # 进入后端目录
npm run dev                  # 启动服务器
```

启动成功会显示：
```
Server is running on http://localhost:3001
```

**步骤 3：打开系统**

浏览器访问 **http://localhost:3001**

> 后端 `index.ts` 中配置了静态文件服务，会自动托管前端构建产物 `dist/` 目录，所以访问 `http://localhost:3001` 即可同时加载前后端。

### 6.2 开发模式启动（前后端分离，支持热更新）

**终端 1：启动后端**

```bash
cd SmartDorm/api
npm run dev
```

**终端 2：启动前端开发服务器**

```bash
cd SmartDorm
npm run dev
```

前端开发服务器会在 `http://localhost:5173` 启动，并自动代理 `/api` 请求到后端 `http://localhost:3001`。

### 6.3 公网访问（使用内网穿透）

让其他设备（手机、同学的电脑）也能访问你的系统：

```bash
tmole 3001
```

终端会输出一个公网地址，例如：
```
https://xxxxxx-ip-xxx-xxx-xxx-xxx.tunnelmole.net
```

**特点：**
- 手机/电脑直接打开，无需验证页面
- 任意网络都能访问（不限制同一 WiFi）
- 电脑关闭终端后该地址失效

---

## 7. 测试账号

系统首次启动后自带以下测试账号：

### 7.1 管理员账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| **adm** | **123456** | 管理员 | 全部功能权限，可查看和管理所有数据 |

### 7.2 普通用户账号

| 用户名 | 密码 | 角色 | 所属楼栋 |
|--------|------|------|----------|
| **张三** | **123456** | 普通用户 | 三达A栋 |
| **李四** | **123456** | 普通用户 | 三达B栋 |
| **王五** | **123456** | 普通用户 | 三达C栋 |

### 7.3 注册新账号

普通用户也可以在登录页面点击"立即注册"，自行注册账号。注册时需要选择自己所在的楼栋。

---

## 8. 测试系统功能

### 8.1 管理员功能测试流程

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开 http://localhost:3001 | 显示登录页面 |
| 2 | 输入用户名 `adm`，密码 `123456`，点击登录 | 跳转到仪表板首页 |
| 3 | 查看首页 | 显示 4 个统计卡片 + 趋势图 + 楼栋对比图 |
| 4 | 切换趋势图时间范围（7天/15天/30天） | 图表数据对应刷新 |
| 5 | 侧边栏点击"楼栋详情" | 显示房间表格和环形图，可切换楼栋 |
| 6 | 侧边栏点击"告警中心" | 显示告警列表，可筛选和更新状态 |
| 7 | 侧边栏进入"管理功能"分组各页面 | 可执行用户/楼栋/房间/数据/告警的 CRUD |

### 8.2 普通用户功能测试流程

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 重新打开登录页面或退出当前账号 | 显示登录页面 |
| 2 | 输入用户名 `张三`，密码 `123456`，点击登录 | 跳转到用户仪表板 |
| 3 | 查看首页 | 显示水电用量卡片、待缴费金额、年度趋势 |
| 4 | 点击"立即缴费" | 弹出缴费窗口，可完成模拟支付流程 |

---

## 9. 注意事项

### 9.1 端口占用

如果启动时提示端口 3001 被占用：

```bash
# 查看 3001 端口占用情况
netstat -ano | findstr :3001     # Windows
lsof -i :3001                    # macOS / Linux

# 结束占用进程（将 PID 替换为实际进程号）
taskkill /PID 1234 /F            # Windows
kill -9 1234                     # macOS / Linux
```

或者修改后端端口号：编辑 `api/src/index.ts`，将 `PORT` 改为其他值。

### 9.2 数据库文件

- 数据库文件路径：`api/dormitory.db`
- 首次启动自动创建，无需手动配置
- 如需重置数据，删除该文件后重启即可
- **建议定期备份**该文件以防数据丢失

### 9.3 前端构建

- 每次修改前端代码后，需要重新执行 `npm run build` 构建
- 或者使用开发模式（`npm run dev` 在 5173 端口），支持热更新
- 如果访问页面白屏，先确认 `dist/` 目录是否存在且有内容

### 9.4 公网访问

- tunnelmole 免费版地址每次重启会变化
- 电脑关机后公网地址失效
- 如需 24 小时在线，建议租用云服务器部署

### 9.5 数据库锁问题

sql.js 是单线程操作，高并发场景可能出现数据库锁。本系统为课设规模，正常使用不受影响。

### 9.6 技术栈版本

| 技术 | 版本 |
|------|------|
| React | ^18.3.1 |
| Vite | ^6.3.5 |
| Tailwind CSS | ^3.4.17 |
| Express | ^4.18.2 |
| sql.js | ^1.10.0 |
| jsonwebtoken | ^9.0.2 |
| bcryptjs | ^2.4.3 |
| ECharts | ^6.1.0 |
| TypeScript | ~5.8.3 |

---

## 10. 常见问题

### Q1: `npm install` 报错

**原因：** 网络问题或 Node.js 版本过低。
**解决：** 升级 Node.js 到 18+，或使用国内镜像源。

### Q2: 登录时提示"用户名或密码错误"

**原因：** 数据库未正确初始化。
**解决：** 删除 `api/dormitory.db` 后重启服务。

### Q3: 页面白屏/加载不出来

**原因：** `dist/` 目录不存在或未构建。
**解决：** 在项目根目录执行 `npm run build`。

### Q4: 手机访问不了

**原因：** 本地地址（localhost）只能在当前电脑访问。
**解决：** 使用 `tmole 3001` 生成公网地址，或用同一局域网 IP 访问。

---

*文档版本：v1.0*
*编制日期：2026年6月4日*
*项目名称：智慧公寓能耗管理系统（SmartDorm）*
