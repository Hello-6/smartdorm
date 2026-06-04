# SmartDorm 部署到 Render.com 的步骤说明

> Surge.sh 只能托管静态 HTML/CSS/JS 文件，不能运行 Node.js 后端。所以用 **Render.com** 免费云服务部署完整的全栈应用。

---

## 第一步：注册 Render 账号

1. 打开 https://dashboard.render.com/register
2. 用 **GitHub 账号** 登录（推荐，可以直接连接仓库）
3. 选择 **Free 免费计划**

## 第二步：上传代码到 GitHub

需要在你的电脑上操作：

```bash
# 1. 如果没有 Git，先安装：https://git-scm.com/downloads

# 2. 在项目目录打开终端
cd D:\SmartDorm

# 3. 初始化 Git 仓库
git init
git add .
git commit -m "first commit"

# 4. 在 GitHub 上创建一个新仓库（不要勾选 README）
#    https://github.com/new

# 5. 关联并推送
git remote add origin https://github.com/你的用户名/smartdorm.git
git branch -M main
git push -u origin main
```

## 第三步：在 Render 部署

1. 登录 Render → Dashboard → **New +** → **Blueprint**
2. 连接你的 GitHub 仓库
3. Render 会自动识别 `render.yaml`，显示服务配置
4. 点击 **Apply**
5. 等待 5-10 分钟自动构建和部署

## 第四步：获取公网地址

部署完成后，Render 会自动分配一个地址：

```
https://smartdorm.onrender.com
```

**这个地址：**
- ✅ 24 小时在线（免费版 15 分钟无请求会休眠，再次访问时自动唤醒，需等 30 秒）
- ✅ 任意网络都能访问
- ✅ 无验证页面
- ✅ 地址固定不变化

> **免费版注意：** Render 免费服务 15 分钟无访问会自动休眠。有人访问时会自动唤醒（需等待约 30 秒）。如果需要 24/7 始终在线，可以升级到付费版（7美元/月）。

---

## 问题排查

### Q: 部署失败怎么办？
- 在 Render Dashboard → Events 查看构建日志
- 常见原因：端口配置错误、构建命令写错

### Q: 数据库数据能持久保存吗？
- Render 免费版的磁盘是临时存储，服务重启或休眠后数据可能丢失
- 建议部署后先登录系统，让系统初始化种子数据即可

### Q: 构建时间太长？
- 首次构建需要下载 Node.js 依赖包，约 3-5 分钟
- 后续部署会使用缓存，速度更快

### Q: 如果需要用 Surge 只部署前端？
虽然本文主要用 Render，但你也可以单独用 Surge 部署前端：

```bash
# 先构建前端
cd D:\SmartDorm
npm install
npm run build

# 安装 Surge
npm install -g surge

# 部署到 Surge
surge ./dist smartdorm.surge.sh
```

但前端单独部署后无法调用后端 API，只能展示静态界面。
