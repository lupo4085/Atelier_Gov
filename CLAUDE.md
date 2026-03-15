# CLAUDE.md

本文件为 Claude Code 提供项目上下文。所有指令必须严格遵守。

## 项目概述

阿特利尔联邦政府门户网站（Atelier Federal Government），模拟政府门户的静态网站项目。内容以中文为主，部分英文标题。

**技术架构：Firebase Auth（仅认证）+ GitHub 仓库（数据存储）+ GitHub Pages（公开读取）**

## 目录结构

```
├── Bank_of_Atelier/          # 中央银行
├── Centeral_Gov_service/     # 联邦部委（司法、国防、教育、财政等 22 个页面）
├── Outside_Gov_service/      # 外部机构（电力公司、大学招生等）
├── gov_Notice/               # 公告与旅行警告
├── local_gov/                # 地方政府门户
├── nationalicon/             # 国徽图片 (nationicon.png)
├── css/                      # 公共 CSS（federal, local, notice, external, bank）
├── content/                  # 内容数据（JSON 文件）
│   ├── index.json            # 所有内容的索引
│   ├── categories.json       # 分类定义
│   ├── tags.json             # 标签定义
│   ├── news/                 # 新闻文章（每篇一个 JSON）
│   ├── announcements/        # 公告
│   ├── policies/             # 政策文件
│   ├── service-updates/      # 服务更新
│   ├── travel-warnings/      # 旅行警告
│   └── submissions/          # 表单提交
├── media/                    # 媒体文件
│   ├── index.json            # 媒体索引
│   ├── images/               # 图片
│   └── documents/            # 文档（PDF 等）
├── config/                   # 系统配置
│   ├── users.json            # 用户角色映射（Firebase UID → 角色）
│   └── workflow-logs.json    # 工作流审核日志
├── firebase-config.js        # Firebase 配置（仅 Auth）
├── github-api.js             # GitHub REST API 封装
├── auth.js                   # 认证 + 角色检查
├── database.js               # 数据操作封装层（调用 github-api.js）
├── admin-dashboard.html      # 完整管理仪表板
├── admin-panel.html          # 简易管理面板
├── index.html                # 主页
├── login.html / register.html # 登录/注册
├── news.html                 # 新闻页（支持动态加载）
├── USAGE_GUIDE.md            # 详细使用说明
└── CHANGELOG.md              # 迭代日志
```

## 开发命令

无构建系统、包管理器或测试套件。预览页面直接用浏览器打开 `.html` 文件。

## 核心架构

### 后端架构

```
用户浏览器 ──▶ GitHub Pages（公开读取 JSON/媒体，无需令牌）
     │
     ├──▶ Firebase Auth（仅登录/注册/认证状态）
     │
     └──▶ GitHub REST API（管理员写入，需要 PAT 令牌）
```

- **Firebase** 只负责账号密码管理，不使用 Firestore 或 Storage
- **数据存储** 全部在 GitHub 仓库的 `content/`、`media/`、`config/` 目录中
- **公开读取** 通过 GitHub Pages URL 直接 fetch JSON 文件
- **管理写入** 通过 GitHub REST API + Personal Access Token

### JavaScript 加载顺序

**所有页面**必须加载：
```html
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="auth.js"></script>
```

**管理页面**额外加载：
```html
<script src="github-api.js"></script>
<script src="database.js"></script>
```

**禁止加载**（已从项目中移除）：
- `firebase-firestore-compat.js`
- `firebase-storage-compat.js`

### 角色系统

层级（高→低）：`super_admin` > `admin` > `editor` > `author` > `reviewer` > `user`

角色判定优先级：
1. `config/users.json` 中手动分配的角色
2. 邮箱后缀 `@atelier.gov.at` → 自动 `editor`
3. 默认 `user`

### 关键配置常量（github-api.js）

```javascript
GITHUB_OWNER = 'lupo4085'
GITHUB_REPO  = 'Atelier_Gov'
GITHUB_BRANCH = 'main'
GITHUB_PAGES_BASE = 'https://lupo4085.github.io/Atelier_Gov'
```

## 前端设计规范

1. 每个页面使用 `<style>` 块 + CSS 自定义属性定义配色方案
2. `css/` 目录有按类别提取的公共 CSS，但现有页面仍保留内联样式
3. 统一视觉风格：深色 header + 橙色边框、卡片式布局、响应式设计、政府风格 footer
4. 内容语言：中文 (`lang="zh-CN"`)，部分英文标题
5. 国徽图片路径：`nationalicon/nationicon.png`（根目录页面）或 `../nationalicon/nationicon.png`（子目录页面）

## 开发规则

### 添加新部门页面
在对应子目录创建 `.html` 文件，从现有页面复制结构和 CSS 变量，修改内容和配色。

### 添加认证功能到页面
按上述「所有页面」脚本顺序加载，在 header 中添加 `<div class="auth-status"></div>`。

### 修改数据操作
扩展 `github-api.js` 中的函数。`database.js` 是兼容层，保持函数签名不变。

### 修改角色权限
编辑 `config/users.json`，提交推送到 GitHub。

## 限制与注意事项

- GitHub API 单文件上传限制 100MB（base64 编码后实际约 75MB）
- GitHub 仓库建议总大小 < 1GB
- GitHub Pages 部署有 1-3 分钟延迟
- 并发编辑 `index.json` 可能产生 SHA 冲突（需刷新重试）
- GitHub PAT 存储在 localStorage，注销时清除

## 迭代日志

**每次代码变更后，必须在 `CHANGELOG.md` 中记录：**
1. 日期和版本标识
2. 修改了哪些文件
3. 实现了什么功能
4. 架构层面的变化（如有）
5. 已知的未完成功能或遗留问题

详见 `CHANGELOG.md`。
