# Atelier Federal Government Portal
# 阿特利尔联邦政府门户网站

> ⚠️ **This is a fictional worldbuilding project. 本项目为虚构世界建构作品。**
>
> The "Federal Republic of Atelier" is an entirely imaginary nation. This website does not represent any real government, institution, or political entity.
>
> "阿特利尔联邦共和国"是完全虚构的国家。本网站与任何真实政府、机构或政治实体无关。

[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-orange.svg)](https://lupo4085.github.io/Atelier_Gov)

---

## 关于本项目 / About

这是一个**虚构国家门户网站**项目，以静态网站的形式模拟"阿特利尔联邦共和国"的官方政府门户。项目同时作为**世界建构（Worldbuilding）创作**和**无后端 Web 架构**的技术演示。

This project simulates the official government portal of the fictional "Federal Republic of Atelier" as a static website. It serves both as a **worldbuilding creative work** and a technical demo of **serverless web architecture**.

---

## 世界设定简介 / The World of Atelier

阿特利尔联邦共和国（Federal Republic of Atelier）是一个架空国家，拥有完整的政府体系、货币（阿特利尔镑）、地理（首都叙拉古）和历史背景。联邦设有 21 个中央部委、独立司法机构、央行及多个外部服务机构。国家设定融合了近未来科技与现实政府运作逻辑，故事年代约为 2090s。

The Federal Republic of Atelier is a fictional nation with a complete government system, currency (Atelier Pound), geography (capital: Syracuse/叙拉古), and lore. The setting blends near-future technology with realistic governance structures, set in the 2090s.

---

## 技术特点 / Technical Highlights

- **无传统后端**：数据存储于 GitHub 仓库（JSON 文件），公开内容通过 GitHub Pages 直接读取
- **Firebase Auth**：仅用于用户认证（登录/注册），不使用 Firestore 或 Storage
- **GitHub REST API**：管理员通过 PAT 令牌执行写操作（内容发布、签证审批等）
- **40+ 静态页面**：涵盖 21 个联邦部委、央行、外部机构、地方政府、签证系统

```
用户浏览器 ──▶ GitHub Pages（公开读取 JSON，无需令牌）
     ├──▶ Firebase Auth（仅认证）
     └──▶ GitHub REST API（管理员写入，需要 PAT）
```

---

## 网站页面 / Pages

| 目录 | 内容 |
|------|------|
| `Centeral_Gov_service/` | 21 个联邦部委页面 |
| `Bank_of_Atelier/` | 阿特利尔中央银行 |
| `Outside_Gov_service/` | 外部机构（电力公司、大学招生、国家铁路） |
| `local_gov/` | 地方政府门户 |
| `gov_Notice/` | 政府公告与旅行警告 |
| `atelier-gov-introduction/` | 国家介绍（全屏滚动展示） |
| `visa-application.html` | 签证申请系统 |
| `admin-dashboard.html` | 管理仪表板（需登录） |

---

## 快速开始 / Getting Started

**在线访问：** https://lupo4085.github.io/Atelier_Gov

**本地预览：** 直接用浏览器打开任意 `.html` 文件（无需构建步骤）

**部署与管理：** 详见 [USAGE_GUIDE.md](USAGE_GUIDE.md)

**开发参考：** 详见 [CLAUDE.md](CLAUDE.md)（面向 AI 辅助开发）

---

## 目录结构 / Structure

```
Atelier_Gov/
├── index.html                      # 政府主页
├── visa-application.html           # 签证申请
├── admin-dashboard.html            # 管理仪表板
├── Centeral_Gov_service/           # 联邦部委（21 个页面）
├── Bank_of_Atelier/                # 中央银行
├── Outside_Gov_service/            # 外部机构
├── local_gov/                      # 地方政府
├── gov_Notice/                     # 政府公告
├── atelier-gov-introduction/       # 国家介绍页
├── content/                        # JSON 数据（内容索引、提交数据）
├── config/                         # 系统配置（用户角色等）
├── css/                            # 公共样式
├── github-api.js                   # GitHub API 封装
├── auth.js                         # 认证逻辑
└── database.js                     # 数据操作层
```

---

## 许可证 / License

The **source code** (HTML, CSS, JavaScript architecture and scripts) is licensed under the [MIT License](LICENSE).

The **creative content** (fictional worldbuilding, lore, department names, place names, character names, and all narrative text) is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

**源代码**（HTML、CSS、JavaScript 架构与脚本）以 [MIT 许可证](LICENSE) 授权。

**创意内容**（虚构世界设定、历史背景、部委名称、地名、人名及所有叙事文字）以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授权。
