# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains static HTML pages for a fictional government portal simulation ("Atelier Federal Government"). The content is primarily in Chinese with some English elements, and includes departments such as central bank, ministries, and external services.

All HTML files are self-contained with inline CSS styling. There are no external stylesheets, JavaScript files, build scripts, or package dependencies.

## Directory Structure

- `Bank_of_Atelier/` – Central bank website (Bank of Atelier)
- `Centeral_Gov_service/` – Various federal ministries and departments (Justice, Defence, Education, Finance, etc.)
- `Outside_Gov_service/` – External government-related organizations (National Power Company, Universities Admissions Service)
- `gov_Notice/` – Public notices and travel advisories
- `local_gov/` – Local government portal
- `nationalicon/` – National emblem image (`nationicon.png`)
- `css/` – Common CSS files for different service categories (new)

Each directory contains one or more `.html` files representing individual agency or service pages.

## Development Commands

There is no build system, package manager, or test suite. To view a page, open the corresponding `.html` file directly in a web browser.

- **Preview**: Double-click any `.html` file or use `open file.html` (macOS) / `start file.html` (Windows) / `xdg-open file.html` (Linux).
- **No linting or formatting tools** are configured.
- **No automated tests** exist.

## Key Architecture Notes

1. **Self-contained HTML**: Each page includes its own `<style>` block with CSS custom properties (CSS variables) defining a department‑specific color scheme. There is no shared CSS.

2. **Image references**: Most pages reference the national emblem via an absolute Windows path:
   ```html
   <img src="G:\nationicon.png" alt="国徽" class="gov-emblem">
   ```
   The actual image is stored in `nationalicon/nationicon.png`. If pages are moved to another environment, these `src` attributes may need to be updated to a relative path (e.g., `../nationalicon/nationicon.png`).

3. **Design consistency**: Pages follow a similar visual pattern:
   - A dark header with an orange accent border
   - Hero section with a search bar (where applicable)
   - Card‑based or list‑based content grids
   - Responsive media queries for mobile screens
   - Government‑style footer

4. **Language**: Content is mostly written in Chinese (`lang="zh-CN"`), with occasional English labels and titles.

5. **Common CSS extraction**: Public CSS files have been extracted for each service category (federal, local, notice, external, bank) in the `css/` directory. These files contain shared styles, CSS custom properties, and responsive rules for future development. Existing HTML files retain their inline CSS unchanged.

## Common Tasks

- **Adding a new department page**: Create a new `.html` file in the appropriate directory. Copy the structure and CSS variable definitions from an existing page, then modify the content and color palette.

- **Fixing broken image links**: Update `src="G:\nationicon.png"` to a relative path that points to `../nationalicon/nationicon.png` (adjust the number of `..` based on the directory depth).

- **Viewing the site locally**: Because there is no server, some intra‑site links (e.g., `href="clock.html"`) may not work if the target file is in a different directory. Use relative paths that respect the directory hierarchy.

## Notes for Future Maintenance

- The project is purely presentational; there is no backend, no dynamic data, and no interactive functionality beyond basic hyperlinks.
- All styling is inline, which makes global design changes tedious. Consider extracting common CSS into a shared stylesheet if the site grows.
- The absolute image path `G:\nationicon.png` suggests the original author worked with a mapped drive. Keep this in mind when moving or deploying the files.

## Backend Architecture: Firebase Auth + GitHub Storage

The project uses **Firebase Auth only** for authentication and **GitHub repository** for all data storage. Firestore and Firebase Storage have been removed to achieve free-tier operation.

### Architecture
```
Firebase Auth (仅认证) → GitHub Repo (内容JSON + 媒体文件) → GitHub Pages (公开读取)
```

### Core Files
- `firebase-config.js` – Firebase configuration (Auth only, no Firestore/Storage)
- `github-api.js` – GitHub REST API wrapper (replaces all Firestore/Storage operations)
- `auth.js` – Authentication functions + role checking via `config/users.json`
- `database.js` – Wrapper layer calling `github-api.js` (same function signatures as old Firestore version)
- `login.html`, `register.html` – User authentication pages
- `admin-dashboard.html` – Full management dashboard with GitHub PAT settings
- `admin-panel.html` – Simple content management panel

### Data Storage Structure
```
content/
  index.json          ← Content index (all items metadata)
  categories.json     ← Category definitions
  tags.json           ← Tag definitions
  news/               ← News articles (one JSON per article)
  announcements/      ← Announcements
  policies/           ← Policy documents
  service-updates/    ← Service updates
  travel-warnings/    ← Travel warnings
  submissions/        ← Form submissions

media/
  index.json          ← Media file index
  images/             ← Uploaded images
  documents/          ← Uploaded documents (PDF, etc.)

config/
  users.json          ← User role mappings (Firebase UID → role)
  workflow-logs.json  ← Workflow audit log
```

### How It Works
- **Public reads**: Fetch JSON directly from GitHub Pages URL (no API key needed)
- **Admin writes**: Use GitHub REST API with Personal Access Token (stored in localStorage)
- **Role system**: Check `config/users.json` first, then fall back to email domain (`@atelier.gov.at` → editor)
- **User registration**: Firebase Auth only, no write to GitHub needed

### Setup Instructions
1. Create a Firebase project and enable Email/Password Authentication
2. Update `firebase-config.js` with your Firebase config
3. Deploy to GitHub Pages (enable in repo Settings → Pages)
4. Edit `config/users.json` to add your Firebase UID as super_admin
5. Generate a GitHub PAT with `repo` scope for admin operations
6. Log in to admin dashboard and enter the PAT when prompted

### Adding Auth to Other Pages
```html
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="auth.js"></script>
```
Do NOT include `firebase-firestore-compat.js` or `firebase-storage-compat.js`.

### Security Notes
- GitHub PAT is stored in localStorage and cleared on logout
- Only admins need a PAT; public users read via GitHub Pages (no auth needed)
- `config/users.json` controls role assignments
- `firestore.rules` and `storage.rules` are deprecated (kept for reference only)

### Limitations
- GitHub API: 100MB max per file upload, recommend repo < 1GB total
- GitHub Pages deployment has 1-3 minute delay after commits
- Concurrent index.json edits may conflict (SHA-based retry in github-api.js)

## 后端内容发布系统

项目使用 Firebase Auth + GitHub 存储的架构，实现完全免费运营。

### 系统架构
- **认证**：Firebase Auth（仅邮箱/密码登录）
- **数据存储**：GitHub 仓库（JSON 文件 + 媒体文件）
- **公开访问**：GitHub Pages（静态文件直接读取）
- **管理操作**：GitHub REST API + Personal Access Token

### 角色系统
- 角色层级：super_admin > admin > editor > author > reviewer > user
- 角色来源：`config/users.json`（手动分配）或邮箱后缀自动判断
- `@atelier.gov.at` 邮箱自动获得 `editor` 权限

### 管理界面
- **管理仪表板**：`admin-dashboard.html` — 完整管理系统，首次使用时提示输入 GitHub PAT
- **简易面板**：`admin-panel.html` — 基本内容管理

### 开发指南
1. **添加新功能**：扩展 `github-api.js` 中的函数
2. **修改角色**：编辑 `config/users.json`
3. **内容管理**：通过管理面板操作，数据存储在 `content/` 目录

### 注意事项
- `firestore.rules` 和 `storage.rules` 已弃用（保留仅供参考）
- 所有 HTML 页面只加载 Firebase App + Auth SDK，不再加载 Firestore/Storage SDK
- 管理员需要 GitHub PAT（`repo` 权限），普通用户无需任何令牌