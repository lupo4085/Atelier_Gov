# 阿特利尔联邦政府门户 — 使用说明

## 一、系统架构概述

本系统采用 **Firebase Auth + GitHub 存储** 的架构，完全免费运营。

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  用户浏览器   │────▶│  GitHub Pages (读取)  │     │  GitHub API (写入) │
│              │     │  静态JSON + 媒体文件   │     │  需要 PAT 令牌     │
└──────────────┘     └─────────────────────┘     └──────────────────┘
       │                                                   ▲
       │              ┌─────────────────────┐              │
       └─────────────▶│  Firebase Auth       │              │
                      │  仅负责登录/注册      │    管理员通过管理面板写入
                      └─────────────────────┘
```

**核心原则：**
- Firebase 只做一件事：账号密码管理（认证）
- 所有数据（内容、媒体、配置）存储在 GitHub 仓库中
- 公开页面通过 GitHub Pages URL 直接读取 JSON（无需任何令牌）
- 管理员通过 GitHub REST API 写入数据（需要 PAT 令牌）

---

## 二、首次部署步骤（从零开始）

### 2.1 Firebase 设置（5分钟）

1. 打开 https://console.firebase.google.com
2. 项目 `atelier-government` 应已存在（如果没有，创建新项目）
3. 确认 **Authentication** 已启用：
   - 左侧菜单 → Authentication → Sign-in method
   - 确保「电子邮件/密码」已启用
4. **不需要**启用 Firestore 或 Storage（已迁移到 GitHub）

### 2.2 GitHub 仓库设置（10分钟）

#### 2.2.1 推送代码到 GitHub

```bash
# 在项目目录下执行
cd C:\Users\Lupo\Desktop\Atelier_Gov

# 初始化并推送（如果还没有远程仓库）
git remote add origin https://github.com/lupo4085/Atelier_Gov.git
git branch -M main
git push -u origin main
```

#### 2.2.2 启用 GitHub Pages

1. 打开 https://github.com/lupo4085/Atelier_Gov/settings/pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main`，目录选择 `/ (root)`
4. 点击 Save
5. 等待 1-3 分钟，页面会显示你的 Pages URL：
   `https://lupo4085.github.io/Atelier_Gov`

#### 2.2.3 验证 GitHub Pages 是否生效

在浏览器中打开：
```
https://lupo4085.github.io/Atelier_Gov/content/index.json
```
应该能看到 `{"lastUpdated":"...","items":[]}` 的 JSON 内容。

### 2.3 生成 GitHub Personal Access Token (PAT)

**只有管理员需要此令牌，普通用户不需要。**

1. 打开 https://github.com/settings/tokens
2. 点击 `Generate new token` → `Generate new token (classic)`
3. 设置：
   - Note: `Atelier Gov Admin`
   - Expiration: 选择合适的有效期（建议 90 天或自定义更长时间）
   - Scopes: 勾选 `repo`（包含所有子权限）
4. 点击 `Generate token`
5. **立即复制令牌**（页面离开后无法再看到）
6. 令牌格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> **安全提示：** 不要在任何公开场合分享此令牌。令牌存储在浏览器 localStorage 中，注销时自动清除。

### 2.4 配置管理员账户

#### 2.4.1 获取你的 Firebase UID

1. 打开 https://console.firebase.google.com → 你的项目 → Authentication → Users
2. 找到你的账户，复制 `User UID` 列的值（类似 `abc123def456...`）

#### 2.4.2 编辑 config/users.json

用文本编辑器打开 `config/users.json`，将 `REPLACE_WITH_YOUR_FIREBASE_UID` 替换为你的真实 UID：

```json
{
  "description": "用户角色映射表。管理员手动添加 Firebase UID 和角色。",
  "users": [
    {
      "uid": "你的Firebase UID粘贴在这里",
      "email": "你的邮箱@example.com",
      "role": "super_admin",
      "displayName": "你的名字",
      "createdAt": "2026-03-15T00:00:00.000Z",
      "updatedAt": "2026-03-15T00:00:00.000Z"
    }
  ]
}
```

然后提交并推送：
```bash
git add config/users.json
git commit -m "配置管理员账户"
git push
```

---

## 三、日常使用

### 3.1 管理员：发布内容

1. 打开 `admin-dashboard.html`（本地双击或通过 GitHub Pages 访问）
2. 使用 Firebase 账号登录
3. **首次使用时**会弹出 GitHub Token 设置窗口：
   - 粘贴你在 2.3 步骤中生成的 PAT
   - 点击「保存」
   - Token 保存在浏览器 localStorage 中，下次不用重新输入
4. 在左侧导航点击「创建内容」
5. 填写标题、类型、内容等字段
6. 选择状态（草稿/直接发布/提交审核）
7. 点击「创建内容」

**发布流程：**
```
创建内容 → github-api.js 生成 JSON → GitHub API 提交到仓库
→ GitHub Pages 自动部署（1-3分钟延迟）→ 公开页面可访问
```

### 3.2 管理员：管理 GitHub Token

- **设置/更换 Token：** 管理面板左侧 → 系统 → GitHub Token
- **Token 过期后：** 重新生成 PAT（步骤 2.3），然后在管理面板更新
- **注销时：** Token 自动清除，下次登录需重新输入

### 3.3 管理员：管理用户角色

#### 通过管理面板（推荐）
管理面板提供了 `updateUserRole()` 函数，可以直接调用。

#### 手动编辑（更可靠）
1. 编辑 `config/users.json`，添加新用户条目：
```json
{
  "uid": "用户的Firebase UID",
  "email": "user@example.com",
  "role": "editor",
  "displayName": "用户名",
  "createdAt": "2026-03-15T00:00:00.000Z",
  "updatedAt": "2026-03-15T00:00:00.000Z"
}
```
2. 提交并推送到 GitHub

#### 角色层级（高 → 低）

| 角色 | 权限说明 |
|------|---------|
| `super_admin` | 所有权限，包括系统设置 |
| `admin` | 内容管理、用户管理、媒体上传 |
| `editor` | 内容增删改、发布、审核、分类/标签管理 |
| `author` | 创建和编辑内容、上传媒体 |
| `reviewer` | 审核内容 |
| `user` | 只读（默认角色） |

#### 自动角色分配
- 邮箱后缀为 `@atelier.gov.at` 的用户自动获得 `editor` 权限
- 其他邮箱默认为 `user` 权限
- `config/users.json` 中的手动分配优先级最高

### 3.4 普通用户：注册和浏览

1. 打开 `register.html`，使用邮箱注册
2. Firebase Auth 创建账号（这是唯一需要 Firebase 的步骤）
3. 角色自动判断，无需管理员操作
4. 浏览公开页面时，内容从 GitHub Pages 加载

### 3.5 公开页面：内容显示

- `news.html` 会自动从 GitHub Pages 加载最新内容
- 公开读取不需要任何令牌或认证
- 加载地址：`https://lupo4085.github.io/Atelier_Gov/content/index.json`
- 静态 HTML 内容作为 fallback 始终可用

---

## 四、文件结构说明

### 4.1 核心 JavaScript 文件

| 文件 | 作用 | 加载顺序 |
|------|------|---------|
| `firebase-config.js` | Firebase App + Auth 初始化 | 1 |
| `github-api.js` | GitHub REST API 封装（读写操作） | 2（仅管理页面需要） |
| `auth.js` | 登录/注册/角色检查 | 3 |
| `database.js` | 数据操作封装层（调用 github-api.js） | 4（仅管理页面需要） |

### 4.2 HTML 页面 SDK 加载规则

**所有页面**只加载 Firebase App + Auth：
```html
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="auth.js"></script>
```

**管理页面**额外加载 GitHub API 和数据库层：
```html
<script src="github-api.js"></script>
<script src="database.js"></script>
```

> **重要：** 不要加载 `firebase-firestore-compat.js` 或 `firebase-storage-compat.js`，它们已被移除。

### 4.3 数据目录

```
content/
├── index.json           ← 所有内容的索引（标题、类型、状态、摘要）
├── categories.json      ← 分类定义
├── tags.json            ← 标签定义
├── news/                ← 新闻文章（每篇一个 JSON 文件）
├── announcements/       ← 公告
├── policies/            ← 政策文件
├── service-updates/     ← 服务更新
├── travel-warnings/     ← 旅行警告
└── submissions/         ← 表单提交（联系表单等）

media/
├── index.json           ← 媒体文件索引
├── images/              ← 图片文件
└── documents/           ← PDF/Word 等文档

config/
├── users.json           ← 用户角色映射表
└── workflow-logs.json   ← 工作流审核日志
```

---

## 五、常见操作

### 5.1 添加新的管理员

```bash
# 1. 让用户先在 register.html 注册
# 2. 在 Firebase Console → Authentication → Users 找到 UID
# 3. 编辑 config/users.json，添加条目
# 4. 提交推送
git add config/users.json
git commit -m "添加管理员: xxx"
git push
```

### 5.2 内容未显示在公开页面

可能原因及解决方法：
1. **GitHub Pages 延迟**：提交后需等待 1-3 分钟部署
2. **内容未标记为 published**：检查 index.json 中该条目的 `published` 字段
3. **浏览器缓存**：强制刷新（Ctrl + Shift + R）
4. **GitHub Pages 未启用**：检查仓库 Settings → Pages

### 5.3 GitHub Token 过期

症状：管理面板操作时报 `401` 或 `Bad credentials` 错误。

解决：
1. 去 https://github.com/settings/tokens 生成新令牌
2. 在管理面板点击左侧「GitHub Token」
3. 输入新令牌并保存

### 5.4 两个管理员同时操作冲突

症状：报 `409 Conflict` 或 SHA 不匹配错误。

解决：刷新页面后重试。`github-api.js` 在写入前会获取最新 SHA，正常情况下不会冲突。但如果两人在几秒内同时修改同一个文件（如 index.json），后者会失败。

### 5.5 上传大文件失败

GitHub API 单文件限制 100MB（base64 编码后实际约 75MB）。建议：
- 图片压缩后上传（推荐 < 5MB）
- 大型文档考虑拆分或使用外部链接

---

## 六、数据备份与恢复

### 6.1 数据天然备份

由于所有数据存储在 Git 仓库中，每次内容变更都是一个 Git commit，天然具有完整的版本历史。

### 6.2 回滚到之前的版本

```bash
# 查看提交历史
git log --oneline

# 回滚到特定提交
git checkout <commit-hash> -- content/ config/ media/

# 或者回滚单个文件
git checkout <commit-hash> -- content/index.json

# 提交回滚
git add .
git commit -m "回滚到 <commit-hash>"
git push
```

### 6.3 本地完整备份

```bash
# 克隆完整仓库（包含所有历史）
git clone https://github.com/lupo4085/Atelier_Gov.git Atelier_Gov_backup
```

---

## 七、已弃用的文件

以下文件保留仅供参考，不再使用：
- `firestore.rules` — Firestore 安全规则（已迁移到 GitHub）
- `storage.rules` — Storage 安全规则（已迁移到 GitHub）
- `DEPLOYMENT.md` — 旧版部署指南（基于 Firestore/Storage）

---

## 八、费用说明

| 服务 | 费用 | 说明 |
|------|------|------|
| Firebase Auth | 免费 | 每月 10,000 次认证，远超需求 |
| GitHub 仓库 | 免费 | 公开仓库无限制 |
| GitHub Pages | 免费 | 每月 100GB 带宽，1GB 存储 |
| GitHub API | 免费 | 每小时 5,000 次请求（认证用户） |

**总计：$0/月**

---

## 九、安全注意事项

1. **GitHub PAT 安全**
   - 不要在代码中硬编码 PAT
   - 注销时 PAT 自动从 localStorage 清除
   - 定期更换 PAT（建议每 90 天）
   - 使用 fine-grained token 可以限制权限范围

2. **Firebase API Key**
   - `firebase-config.js` 中的 API Key 是公开的（这是正常的）
   - Firebase Auth 通过域名白名单保护
   - 在 Firebase Console → Authentication → Settings → Authorized domains 中添加你的域名

3. **角色安全**
   - `config/users.json` 存储在公开仓库中，角色信息可见
   - 关键操作（写入）需要 PAT，即使知道角色也无法越权
   - 如需更高安全性，考虑使用私有仓库

---

## 十、技术支持

遇到问题时的排查顺序：
1. 打开浏览器开发者工具（F12）→ Console 查看错误信息
2. 确认 GitHub Pages 是否正常访问
3. 确认 GitHub PAT 是否有效且未过期
4. 确认 Firebase Auth 是否正常（能否登录）
5. 检查 `config/users.json` 中的角色配置
