# 阿特利尔联邦政府门户 — 上线部署与使用指南

## 一、系统架构概述

本系统采用 **Firebase Auth + GitHub 存储** 的纯前端架构，完全免费运营。

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  用户浏览器   │────▶│  GitHub Pages (读取)  │     │  GitHub API (写入) │
│              │     │  HTML/JSON/媒体文件   │     │  需要 PAT 令牌     │
└──────────────┘     └─────────────────────┘     └──────────────────┘
       │                                                   ▲
       │              ┌─────────────────────┐              │
       └─────────────▶│  Firebase Auth       │    管理员通过管理面板写入
                      │  仅负责登录/注册      │
                      └─────────────────────┘
                                │
                      ┌─────────────────────┐
                      │  EmailJS (可选)      │
                      │  签证审批邮件通知     │
                      └─────────────────────┘
```

**核心原则：**
- Firebase 只做一件事：账号密码管理（认证）
- 所有数据（内容、媒体、配置）存储在 GitHub 仓库中
- 公开页面通过 GitHub Pages URL 直接读取 JSON（无需任何令牌）
- 管理员通过 GitHub REST API 写入数据（需要 PAT 令牌）
- 签证审批邮件通过 EmailJS 纯前端发送（可选功能）

---

## 二、上线部署步骤（完整流程）

### 第 1 步：Firebase 设置（5 分钟）

1. 打开 https://console.firebase.google.com
2. 如果项目 `atelier-government` 不存在，创建新项目
3. 启用 **Authentication**：
   - 左侧菜单 → Authentication → Sign-in method
   - 启用「电子邮件/密码」
4. **配置授权域名**（关键！）：
   - Authentication → Settings → Authorized domains
   - 添加 `lupo4085.github.io`（你的 GitHub Pages 域名）
   - 如果用自定义域名，也一并添加
5. 确认 `firebase-config.js` 中的配置与 Firebase Console 中的匹配：
   - Firebase Console → 项目设置 → 常规 → 你的应用 → Firebase SDK snippet
   - 对比 `apiKey`、`authDomain`、`projectId` 是否一致

> **不需要**启用 Firestore 或 Storage

### 第 2 步：推送代码到 GitHub（5 分钟）

```bash
cd C:\Users\Lupo\Desktop\Atelier_Gov

# 如果还没有远程仓库
git remote add origin https://github.com/lupo4085/Atelier_Gov.git

# 添加所有文件并推送
git add -A
git commit -m "部署到 GitHub Pages"
git branch -M main
git push -u origin main
```

### 第 3 步：启用 GitHub Pages（3 分钟）

1. 打开 https://github.com/lupo4085/Atelier_Gov/settings/pages
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `main`，目录选择 `/ (root)`
4. 点击 **Save**
5. 等待 1-3 分钟，页面顶部会显示你的 Pages URL：
   ```
   https://lupo4085.github.io/Atelier_Gov
   ```

### 第 4 步：验证部署是否成功

依次打开以下 URL，确认能正常显示：

| 测试 | URL | 预期结果 |
|------|-----|---------|
| 国家介绍 | `https://lupo4085.github.io/Atelier_Gov/atelier-gov-introduction/index.html` | 全屏滚动介绍页 |
| 政府主页 | `https://lupo4085.github.io/Atelier_Gov/index.html` | 政府门户首页 |
| 签证申请 | `https://lupo4085.github.io/Atelier_Gov/visa-application.html` | 签证表单页 |
| 内容索引 | `https://lupo4085.github.io/Atelier_Gov/content/index.json` | JSON 数据 |
| 部门页面 | `https://lupo4085.github.io/Atelier_Gov/Centeral_Gov_service/homeoffice.html` | 内政部页面 |

如果 JSON 返回 404，等待几分钟让 GitHub Pages 完成部署。

### 第 5 步：生成 GitHub Personal Access Token（5 分钟）

**只有管理员需要此令牌，普通用户不需要。**

1. 打开 https://github.com/settings/tokens
2. 点击 `Generate new token` → `Generate new token (classic)`
3. 设置：
   - **Note**: `Atelier Gov Admin`
   - **Expiration**: 建议 90 天或自定义更长时间
   - **Scopes**: 勾选 `repo`（包含所有子权限）
4. 点击 `Generate token`
5. **立即复制令牌**（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`，页面离开后无法再看到）

> **安全提示：** 不要在任何公开场合分享此令牌。

### 第 6 步：配置管理员账户（5 分钟）

1. 在你的网站上打开 `register.html`，注册一个管理员账号
2. 打开 Firebase Console → Authentication → Users，找到刚注册账号的 **User UID**
3. 编辑本地的 `config/users.json`：

```json
{
  "description": "用户角色映射表",
  "users": [
    {
      "uid": "粘贴你的 Firebase UID",
      "email": "你的邮箱@example.com",
      "role": "super_admin",
      "displayName": "你的名字",
      "createdAt": "2026-03-15T00:00:00.000Z",
      "updatedAt": "2026-03-15T00:00:00.000Z"
    }
  ]
}
```

4. 提交推送：
```bash
git add config/users.json
git commit -m "配置管理员账户"
git push
```

5. 等待 1-3 分钟 GitHub Pages 部署完成

### 第 7 步：登录管理面板并设置 Token

1. 打开 `https://lupo4085.github.io/Atelier_Gov/admin-dashboard.html`
2. 使用刚注册的管理员账号登录
3. 首次使用会弹出 **GitHub Token 设置窗口**
4. 粘贴第 5 步生成的 PAT，点击「保存」
5. Token 保存在浏览器 localStorage 中

**至此，系统已完全上线可用！**

### 第 8 步（可选）：配置签证审批邮件通知

如果需要签证审批时自动发送邮件给申请人：

#### 8.1 注册 EmailJS
1. 打开 https://www.emailjs.com，免费注册
2. 免费额度：200 封/月（足够模拟项目使用）

#### 8.2 连接邮箱服务
1. EmailJS 控制台 → Email Services → Add New Service
2. 选择邮箱提供商（Gmail、Outlook 等），按提示授权
3. 记下 **Service ID**（如 `service_xxx`）

#### 8.3 创建邮件模板
创建两个模板：

**模板 1：`visa_approved`（签证批准通知）**
```
Subject: 您的阿特利尔签证申请已批准 - {{reference_number}}
Body:
尊敬的 {{to_name}}，

您的签证申请（编号：{{reference_number}}）已获批准。

签证类型：{{visa_type}}
批准日期：{{approved_date}}
入境日期：{{entry_date}}
离境日期：{{exit_date}}

管理员备注：{{admin_notes}}

阿特利尔联邦政府签证服务
```

**模板 2：`visa_rejected`（签证拒绝通知）**
```
Subject: 您的阿特利尔签证申请结果 - {{reference_number}}
Body:
尊敬的 {{to_name}}，

很遗憾，您的签证申请（编号：{{reference_number}}）未获通过。

签证类型：{{visa_type}}
处理日期：{{rejection_date}}
拒绝原因：{{rejection_reason}}

如有疑问，请联系签证服务中心。

阿特利尔联邦政府签证服务
```

#### 8.4 填入配置
编辑 `emailjs-config.js`：
```javascript
const EMAILJS_PUBLIC_KEY = '你的Public Key';      // Account → API Keys
const EMAILJS_SERVICE_ID = '你的Service ID';       // Email Services 中创建的
const EMAILJS_TEMPLATE_APPROVED = 'visa_approved';
const EMAILJS_TEMPLATE_REJECTED = 'visa_rejected';
```

提交推送：
```bash
git add emailjs-config.js
git commit -m "配置 EmailJS 邮件通知"
git push
```

---

## 三、网站结构

### 3.1 页面入口流

```
国家介绍页 (atelier-gov-introduction/index.html)
  ├── → 政府主页 (index.html)
  │       ├── → 部门目录 (departments.html)
  │       ├── → 公民服务 (service-citizen.html) → 签证申请 (visa-application.html)
  │       ├── → 商业服务 (service-business.html)
  │       ├── → 新闻 (news.html)
  │       └── → 管理面板 (admin-dashboard.html)
  └── → 签证申请 (visa-application.html)
```

### 3.2 目录结构

```
Atelier_Gov/
├── index.html                    # 政府门户主页
├── visa-application.html         # 签证申请页
├── login.html / register.html    # 登录/注册
├── departments.html              # 部门目录
├── news.html                     # 新闻（动态加载）
├── contact-form.html             # 通用服务申请
├── admin-dashboard.html          # 管理仪表板（含签证审批）
├── admin-panel.html              # 旧版管理面板
│
├── firebase-config.js            # Firebase 配置
├── github-api.js                 # GitHub REST API 封装
├── auth.js                       # 认证 + 角色检查
├── database.js                   # 数据操作封装层
├── emailjs-config.js             # EmailJS 配置（需填入密钥）
├── email-service.js              # 邮件发送服务
│
├── atelier-gov-introduction/     # 国家介绍（全屏滚动页）
│   ├── index.html
│   └── *.png                     # 国旗、国徽、地图等图片
│
├── Centeral_Gov_service/         # 联邦部委页面（21个）
│   ├── homeoffice.html           # 内政部
│   ├── ministry-of-defence.html  # 国防部
│   ├── ministry-of-finance.html  # 财政部
│   ├── ministry-of-education.html # 教育部
│   ├── ...                       # 其他部门
│   └── urban-assault-group.html  # 城市突击队
│
├── Outside_Gov_service/          # 外部机构（3个）
│   ├── national-power-company.html
│   ├── universities-admissions.html
│   └── ANR.html                  # 国家铁路
│
├── Bank_of_Atelier/              # 中央银行
│   └── bank-of-atelier.html
│
├── gov_Notice/                   # 公告与旅行警告
├── local_gov/                    # 地方政府门户
├── nationalicon/                 # 国徽图片
├── css/                          # 公共 CSS
│
├── content/                      # 内容数据 (JSON)
│   ├── index.json                # 内容索引
│   ├── categories.json           # 分类
│   ├── tags.json                 # 标签
│   └── submissions/              # 表单提交（签证申请等）
│
├── media/                        # 媒体文件
│   └── index.json                # 媒体索引
│
└── config/                       # 系统配置
    ├── users.json                # 用户角色映射
    └── workflow-logs.json        # 工作流日志
```

### 3.3 JavaScript 加载规则

**所有页面**必须加载（子目录页面加 `../` 前缀）：
```html
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="auth.js"></script>
```

**表单提交页面**（contact-form、visa-application、research-permit 等）额外加载：
```html
<script src="github-api.js"></script>
<script src="database.js"></script>
```

**管理页面**（admin-dashboard）额外加载：
```html
<script src="github-api.js"></script>
<script src="database.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script src="emailjs-config.js"></script>
<script src="email-service.js"></script>
```

---

## 四、日常使用

### 4.1 管理员：发布内容

1. 登录 `admin-dashboard.html`
2. 左侧导航 → 创建内容
3. 填写标题、类型、内容
4. 选择状态并提交

### 4.2 管理员：审批签证

1. 登录 `admin-dashboard.html`
2. 左侧导航 → 签证管理 → 签证申请
3. 查看申请列表，点击「详情」查看完整信息
4. 填写管理员备注，点击「批准」或「拒绝」
5. 如已配置 EmailJS，审批结果自动发送到申请人邮箱

### 4.3 管理员：管理 GitHub Token

- **设置/更换 Token**：管理面板左侧 → 系统 → GitHub Token
- **Token 过期后**：重新生成 PAT，然后在管理面板更新
- **注销时**：Token 自动从 localStorage 清除

### 4.4 管理员：管理用户角色

编辑 `config/users.json`，添加新用户条目后提交推送。

角色层级（高 → 低）：

| 角色 | 权限说明 |
|------|---------|
| `super_admin` | 所有权限 |
| `admin` | 内容管理、用户管理、签证审批 |
| `editor` | 内容增删改、发布、审核 |
| `author` | 创建和编辑内容 |
| `reviewer` | 审核内容 |
| `user` | 只读（默认） |

自动角色：邮箱后缀 `@atelier.gov.at` → 自动获得 `editor` 权限。

### 4.5 用户：申请签证

1. 打开 `visa-application.html`（可从国家介绍页或公民服务页跳转）
2. 登录或注册账号
3. 填写签证表单并提交
4. 记录申请编号，等待邮件通知

---

## 五、故障排查

### 5.1 页面显示 404

- 确认 GitHub Pages 已启用（Settings → Pages）
- 确认 branch 设置为 `main`，目录为 `/ (root)`
- 等待 1-3 分钟部署完成
- 检查 URL 大小写是否正确（GitHub Pages 区分大小写）

### 5.2 登录/注册失败

- 确认 Firebase Auth 已启用「电子邮件/密码」
- 确认 GitHub Pages 域名已添加到 Firebase 授权域名列表
- 打开 F12 控制台查看具体错误信息

### 5.3 管理面板操作报错

- `401 Bad credentials`：GitHub PAT 已过期，需重新生成
- `409 Conflict`：SHA 冲突，刷新页面后重试
- `403 Forbidden`：PAT 权限不足，需勾选 `repo` scope
- `没有权限`：检查 `config/users.json` 中的角色配置

### 5.4 签证审批邮件未发送

- 检查 `emailjs-config.js` 中的密钥是否已填入（不能是 `YOUR_PUBLIC_KEY`）
- 检查 EmailJS 控制台中邮箱服务是否正常连接
- 检查邮件模板 ID 是否匹配（`visa_approved` / `visa_rejected`）
- 检查 EmailJS 免费额度是否用完（200 封/月）

### 5.5 子目录页面（部门页面）功能异常

- 确认 JS 引用路径使用了 `../` 前缀（如 `src="../firebase-config.js"`）
- 确认国徽图片路径为 `../nationalicon/nationicon.png`

---

## 六、费用说明

| 服务 | 费用 | 限制 |
|------|------|------|
| Firebase Auth | 免费 | 每月 10,000 次认证 |
| GitHub 仓库 | 免费 | 公开仓库无限制 |
| GitHub Pages | 免费 | 100GB 带宽/月，1GB 存储 |
| GitHub API | 免费 | 5,000 次请求/小时 |
| EmailJS | 免费 | 200 封邮件/月 |

**总计：$0/月**

---

## 七、数据备份与恢复

所有数据存储在 Git 仓库中，每次变更都是 Git commit，天然具有完整版本历史。

```bash
# 查看提交历史
git log --oneline

# 回滚特定文件
git checkout <commit-hash> -- content/index.json

# 克隆完整备份
git clone https://github.com/lupo4085/Atelier_Gov.git Atelier_Gov_backup
```

---

## 八、安全注意事项

1. **GitHub PAT**：不要在代码中硬编码；定期更换（建议每 90 天）
2. **Firebase API Key**：`firebase-config.js` 中的 Key 是公开的（正常设计），通过授权域名白名单保护
3. **EmailJS Public Key**：公开可见但与特定账户绑定，不会造成安全风险
4. **角色数据**：`config/users.json` 在公开仓库中可见；关键写入操作仍需 PAT 保护
