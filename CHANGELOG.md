# 迭代日志 (CHANGELOG)

记录每次架构变更、功能实现和已知问题。

---

## v0.3.5 — 2026-03-15 | 添加 README + 双重许可证

### 修改内容

- `README.md`（根目录）：**新建**，中英双语，含虚构性质免责声明、世界设定简介、技术架构说明、目录结构、许可证声明
- `LICENSE`：**新建**，MIT 许可证正文（适用于源代码）
- `atelier-gov-introduction/README.md`：修正原文拼写错误（"webside" → "website"），扩充为子目录说明

### 架构说明

采用**双重许可（Dual License）**策略：
- 源代码（HTML/CSS/JS）→ MIT License
- 创意内容（世界设定、地名、历史叙事等）→ CC BY-SA 4.0

---

## v0.3.4 — 2026-03-15 | 全站恢复正常状态：清除所有风暴阿比斯残留内容

### 修改内容

**全面正常化处理（6 个文件）：**

- `Centeral_Gov_service/emergency-management.html`：
  - 将"官方行动指令"（风暴撤离令）替换为部门职责介绍
  - 将"生存指南：低温应对"替换为通用家庭应急准备指南
  - 将资源调配状态（除雪车/发电车）替换为常规备勤状态
  - 将"暴风雪将在36小时内减弱"侧边栏替换为"当前无活跃灾害事件"

- `Outside_Gov_service/ANR.html`：
  - 西海岸干线：`缩短运行` + "叙拉古段停运" → `正常`
  - 东部沿海线、中部平原线：`全线停运` → `正常`
  - 车站公告：候车厅转避难所 → 正常服务

- `local_gov/localgov.html`：
  - 垃圾回收：`服务暂停`（结冰停收）→ `正常运行`
  - 学校：`期限延长`（全部关闭）→ `正常运行`
  - 市政税：移除"冬季灾害减免"措辞
  - 停车与道路：`仅限急救` → `正常运行`
  - 出生/死亡/婚姻登记：移除"登记处已关闭"说明
  - 害虫控制：移除"因严寒"描述

- `Outside_Gov_service/national-power-company.html`：
  - 叙拉古首都圈：`部分中断 83%` → `运行中 61%`
  - 高地矿区：`高负载 78%` → `运行中 71%`
  - 冬季电价补贴通知 → 超导输电二期竣工公告
  - 数据时间戳更新至 2093-03-15

- `Centeral_Gov_service/NHS.html`：
  - 心理健康：移除"暴风雪幽闭焦虑"描述 → 通用心理咨询服务
  - "寒冷天气健康指南" → "健康资讯"（春季过敏 + 义体维护）
  - 急诊等待时间：6小时45分 +400% → 1小时20分 -10%

- `Centeral_Gov_service/NOA.html`：
  - 云量：95%/暴雪 → 18%/晴朗适宜观测
  - 望远镜状态：关闭（暴风雪）→ 正常运作
  - 极光预报：暴风雪遮挡视野 → 建议前往郊区观测

---

## v0.3.3 — 2026-03-15 | 移除灾害告示横幅 + 修复货币命名 + 统一许可协议名称

### 修改内容

**Part 1 — 移除临时气象/灾害告示横幅（6 个文件）：**
- `Centeral_Gov_service/emergency-management.html`：删除 `.emergency-banner`（温带气旋"阿比斯"紧急状态宣告）
- `Centeral_Gov_service/metoffice.html`：删除 `.alert-banner`（强辐射预警等级4）
- `Centeral_Gov_service/NHS.html`：删除 `.alert-banner`（红色警报，寒冷健康风险）
- `Outside_Gov_service/national-power-company.html`：删除 `.alert-banner`（叙拉古电力中断警报）
- `local_gov/localgov.html`：删除 `.local-alert`（暴风雪红色预警）
- `Outside_Gov_service/ANR.html`：删除 `.disruption-banner`（叙拉古列车停运公告）

**Part 2 — 修复货币命名（1 个文件）：**
- `Centeral_Gov_service/ministry-of-finance.html`：`新阿特利尔信用点 (NAC)` → `阿特利尔镑 (ATP)`，`1 KRM = 4.2 NAC` → `1 KRM = 4.2 ATP`

**Part 3 — 统一开放政府许可协议名称（11 个文件）：**
- `开放政府许可协议 v3.0` → `阿特利尔联邦开放政府数据许可协议 v1.0`
- 批量替换：`homeoffice.html`、`nationalgovdoor.html`、`data-research.html`、`departments.html`、`index.html`、`jobs.html`、`news.html`、`research-permit.html`、`service-business.html`、`service-citizen.html`
- 精准替换：`transparency.html`（正文标题、正文引用、footer 共 2 处）

### 未完成/遗留
- `gov_Notice/travel.html` 和 `trave2l.html` 的告示横幅为核心内容，未修改（符合预期）

---

## v0.3.2 — 2026-03-15 | 去现实世界化：替换所有真实世界引用

### 修改内容

**类别 A — 紧急号码（19 个文件）：**
- `911` → `999`（阿特利尔联邦统一紧急号码）
- 涉及：`Centeral_Gov_service/` 下 15 个文件、`Outside_Gov_service/` 下 3 个文件、`local_gov/localgov.html`

**类别 B — 电话区号（22 个文件）：**
- `010-555-` → `0870-555-`（移除现实世界北京区号）
- 涉及：上述 19 个文件 + `contact-form.html`、`departments.html`、`jobs.html`

**类别 C — 国际拨号前缀（4 个文件）：**
- `+00 (1) 555-0911` → `+870 555-0999`（`travel.html`）
- `+88 (02) 4921-2200` → `+892 (02) 4921-2200`（`travel.html`，米尔斯顿虚构国）
- `+00 (1) 800-VISA-BAN` → `+870 800-VIS-DENY`（`trave2l.html`）
- `+00 (1) 555-3321` → `+870 555-3321`（`trave2l.html`）
- `+00 (1) 555-0192` → `+870 555-0192`（`foreign_office.html`）
- `+00 (1) 800 123 4567` → `+870 800 123 4567`（`national-statistics.html`）

**类别 D — 现实国家名称（`visa-application.html`）：**
- `例如：中华人民共和国` → `例如：克洛维亚共和国`
- `+86-138XXXXXXXX` → `+870-138XXXXXXXX`

**类别 E — 货币符号：**
- `£482` → `₳482`（`national-statistics.html`）
- `£ 100` / `£482.50` → `₳ 100` / `₳482.50`（`bank-of-atelier.html`）
- `1 USD = 4.2 NAC` → `1 KRM = 4.2 NAC`（`ministry-of-finance.html`，KRM = 克洛缅马克）

**类别 F — 版权声明（`national-statistics.html`）：**
- `Open Government Licence v3.0` → `阿特利尔联邦开放政府数据许可协议 v1.0`

### 架构变化
无。纯内容替换，不涉及功能逻辑。

### 已知问题
无新增。

---

## v0.3.1 — 2026-03-15 | GitHub Pages 兼容性整理

### 修改内容

**文件重命名（16 个文件，空格改为连字符）：**
- `Bank of Atelier.html` → `bank-of-atelier.html`
- `Ministry of Defence.html` → `ministry-of-defence.html`
- `Ministry of Finance.html` → `ministry-of-finance.html`
- `Ministry of Education.html` → `ministry-of-education.html`
- `Ministry of Food, Fisheries and Agriculture.html` → `ministry-of-agriculture.html`
- `Ministry of Industry and Information Technology.html` → `ministry-of-industry.html`
- `Ministry of Natural Resources.html` → `ministry-of-natural-resources.html`
- `Ministry of Science and Technology.html` → `ministry-of-science.html`
- `National Office of Statistics.html` → `national-statistics.html`
- `Office of Government Transparency and Ethics.html` → `transparency-ethics.html`
- `Urban Assault Group.html` → `urban-assault-group.html`
- `Department of Emergency Managemen.html` → `emergency-management.html`
- `Federal Department of Justice  Supreme Court.html` → `justice-supreme-court.html`
- `Atelier National Time Service.html` → `time-service.html`
- `National Power Company.html` → `national-power-company.html`
- `Universities Admissions Service.html` → `universities-admissions.html`

**修复的问题：**
- 所有子目录 HTML 文件的 JS 引用路径修复（`firebase-config.js` → `../firebase-config.js` 等，共 28 个文件）
- 子目录页面的 `contact-form.html` 链接修复（添加 `../` 前缀）
- `contact-form.html`、`research-permit.html`、`test-system.html` 缺少 `github-api.js` 加载
- `departments.html` 中引用了不存在的 `Ministry of Justice.html`，修正为 `justice-supreme-court.html`
- 4 个不存在页面的链接改为 `#`（`clock.html`、`tracking.html`、`privacy.html`、`help.html`）
- 删除 `.bak` 备份文件（3 个）

**其他：**
- 重写 `USAGE_GUIDE.md`，添加完整上线部署指南

---

## v0.3.0 — 2026-03-15 | 国家介绍页整合 + 签证申请系统

### 架构变化

新增 EmailJS 纯前端邮件通知系统，用于签证审批结果通知。无需后端服务器，免费额度 200 封/月。

### 修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `visa-application.html` | 新建 | 签证申请表单页（6种签证类型，15个字段） |
| `emailjs-config.js` | 新建 | EmailJS 配置占位（需用户填入密钥） |
| `email-service.js` | 新建 | 邮件发送辅助函数（批准/拒绝通知） |
| `atelier-gov-introduction/index.html` | 修改 | 「访问联邦政府主页」→ `../index.html`，「申请电子签证」→ `../visa-application.html` |
| `index.html` | 修改 | header 导航添加「国家介绍」链接 |
| `service-citizen.html` | 修改 | 「签证与居留许可」链接改为 `visa-application.html` |
| `github-api.js` | 修改 | 新增 `ghUpdateSubmission()` 函数 |
| `database.js` | 修改 | 新增 `updateSubmission()` 包装函数（需 admin 权限） |
| `admin-dashboard.html` | 修改 | 新增签证管理 Tab（申请列表、统计、筛选、审批模态框）+ EmailJS 集成 |
| `CHANGELOG.md` | 修改 | 记录本次迭代 |

### 实现的功能

- [x] 国家介绍页与政府门户互链（双向跳转）
- [x] 签证申请表单（旅游/商务/工作/学生/记者/过境 6 种类型）
- [x] 签证申请提交到 `content/submissions/` 存储
- [x] 商务/工作签证时动态显示「邀请方信息」字段
- [x] 管理仪表板签证管理 Tab（统计条、筛选、列表）
- [x] 签证审批详情模态框（查看全部信息 + 批准/拒绝按钮）
- [x] `updateSubmission()` API（管理员更新提交状态）
- [x] EmailJS 邮件通知集成（批准/拒绝时发送邮件）

### 用户需完成的配置

- [ ] 注册 EmailJS（https://www.emailjs.com）并连接邮箱服务
- [ ] 创建 `visa_approved` 和 `visa_rejected` 两个邮件模板
- [ ] 在 `emailjs-config.js` 中填入 Public Key 和 Service ID

---

## v0.2.0 — 2026-03-15 | 迁移到 GitHub 存储 + 项目清理

### 架构变化

**从 Firebase 全家桶迁移到 Firebase Auth + GitHub 存储：**

```
旧架构：Firebase Auth + Firestore(内容/用户) + Storage(媒体文件)
新架构：Firebase Auth(仅认证) + GitHub Repo(内容JSON/媒体) + GitHub Pages(公开读取)
```

目的：消除 Firestore/Storage 的付费风险，实现完全免费运营。

### 修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `github-api.js` | 新建 | GitHub REST API 封装，含内容 CRUD、媒体上传、角色管理、工作流 |
| `firebase-config.js` | 重写 | 移除 Firestore/Storage 初始化，仅保留 Auth |
| `database.js` | 重写 | 18 个函数改为调用 `github-api.js`，保持函数签名不变 |
| `auth.js` | 重写 | 移除 Firestore 用户文档创建，角色检查改用 `config/users.json` + 邮箱后缀 |
| `admin-dashboard.html` | 修改 | SDK 替换 + 添加 GitHub PAT 设置模态框 + 修复 `.toDate()` 调用 |
| `admin-panel.html` | 修改 | SDK 替换 + 修复 `.toDate()` 调用 |
| `news.html` | 修改 | SDK 替换 + 添加从 GitHub Pages 动态加载内容的功能 |
| `index.html` | 修改 | SDK 替换 |
| `test-system.html` | 修改 | SDK 替换 + 连接测试改为测试 GitHub Pages/API |
| 其他 ~35 个 HTML | 修改 | 移除 `firebase-firestore-compat.js` 和 `firebase-storage-compat.js` |
| `content/index.json` | 新建 | 空内容索引 |
| `content/categories.json` | 新建 | 空分类数据 |
| `content/tags.json` | 新建 | 空标签数据 |
| `media/index.json` | 新建 | 空媒体索引 |
| `config/users.json` | 新建 | 初始管理员模板（需替换 UID） |
| `config/workflow-logs.json` | 新建 | 空工作流日志 |
| `USAGE_GUIDE.md` | 新建 | 完整使用说明文档 |
| `CHANGELOG.md` | 新建 | 本迭代日志 |
| `CLAUDE.md` | 重写 | 移除所有过时的 Firestore/Storage 指令，反映新架构 |
| `replace-images.js` | 删除 | 一次性图片路径替换脚本，已完成使命 |
| `firestore.rules` | 删除 | Firestore 安全规则，不再使用 |
| `DEPLOYMENT.md` | 删除 | 旧版部署指南（基于 Firestore/Storage），内容过时 |

### 实现的功能

- [x] GitHub REST API 完整封装（`github-api.js`）
- [x] 内容 CRUD：创建、读取、列表、搜索、更新、删除
- [x] 媒体文件上传到 GitHub 仓库（base64 编码）
- [x] 用户角色系统：`config/users.json` + 邮箱后缀自动判断
- [x] 工作流管理：提交审核、批准、拒绝 + 日志记录
- [x] 分类和标签管理
- [x] 表单提交存储
- [x] GitHub PAT 管理界面（管理面板内设置/清除）
- [x] `news.html` 动态从 GitHub Pages 加载最新内容
- [x] 所有 HTML 页面清理（移除 Firestore/Storage SDK）
- [x] 详细使用说明文档
- [x] 项目文件清理（删除过时脚本和规则文件）

### 未完成的功能

- [ ] `config/users.json` 需要手动填入真实 Firebase UID
- [ ] GitHub 仓库尚未推送到远程（需执行 `git push`）
- [ ] GitHub Pages 尚未启用（需在仓库 Settings 中配置）
- [ ] `admin-dashboard.html` 中的统计数据加载（仪表板数字显示为 `--`）
- [ ] `admin-dashboard.html` 中的「最近活动」加载（显示「暂无活动记录」）
- [ ] 内容编辑功能（`editContent()` 仍为占位函数 `alert`）
- [ ] 内容查看功能（`viewContent()` 仍为占位函数 `alert`）
- [ ] 分类管理页面 UI（显示「开发中...」）
- [ ] 标签管理页面 UI（显示「开发中...」）
- [ ] 媒体库浏览页面 UI（显示「开发中...」）
- [ ] 媒体上传页面 UI（显示「开发中...」）
- [ ] 待审核列表页面 UI（显示「开发中...」）
- [ ] 审核日志页面 UI（显示「开发中...」）
- [ ] 用户管理页面 UI（显示「开发中...」）
- [ ] 角色权限页面 UI（显示「开发中...」）
- [ ] `contact-form.html` 表单提交集成（需加载 `github-api.js` + `database.js`）
- [ ] 内容版本控制
- [ ] SHA 冲突自动重试机制
- [ ] 其他公开页面的动态内容加载（目前仅 `news.html` 实现）

---

## v0.1.0 — 2026-03-15 | 初始版本

### 说明

项目初始状态，从本地静态 HTML 项目演化而来。

### 包含内容

- 43+ 个政府部门/机构 HTML 页面（内联 CSS）
- Firebase 全家桶集成（Auth + Firestore + Storage）
- 基础管理面板 (`admin-panel.html`, `admin-dashboard.html`)
- 认证系统 (`auth.js`, `login.html`, `register.html`)
- Firestore 数据操作 (`database.js`)
- 安全规则 (`firestore.rules`, `storage.rules`)
- 公共 CSS 提取 (`css/` 目录)
- 国徽图片路径已从绝对路径 `G:\` 修正为相对路径
