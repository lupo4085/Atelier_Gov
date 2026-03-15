# 阿特利尔联邦政府 - 后端内容发布系统部署指南

## 系统概述

本项目是一个完整的政府门户内容管理系统，基于Firebase构建，提供用户认证、内容管理、媒体库、工作流审批等功能。

## 部署前准备

### 1. Firebase项目配置
1. 访问 [Firebase控制台](https://console.firebase.google.com)
2. 创建新项目：`atelier-government`
3. 在项目中启用以下服务：
   - **Authentication**：启用电子邮件/密码登录
   - **Firestore Database**：创建数据库（测试模式）
   - **Storage**：创建存储桶
   - **Hosting**（可选）：用于部署静态文件

### 2. 获取Firebase配置
1. 进入项目设置 → 常规 → 您的应用 → Web应用
2. 注册应用并获取配置代码
3. 更新 `firebase-config.js` 中的配置：
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 3. 安全规则配置
1. 将 `firestore.rules` 内容复制到 Firestore → 规则
2. 将 `storage.rules` 内容复制到 Storage → 规则
3. 发布规则

## 初始化数据库结构

### 1. 创建初始管理员账户
1. 访问 `register.html`
2. 使用 `admin@atelier.gov` 邮箱注册（系统会自动分配 editor 角色）
3. 或使用Firebase控制台直接创建用户并设置角色

### 2. 手动设置超级管理员（如果需要）
在Firestore的 `users` 集合中，找到管理员用户的文档，将 `role` 字段更新为 `super_admin`。

## 系统功能模块

### 1. 用户角色系统
- **super_admin**：超级管理员，拥有所有权限
- **admin**：管理员，可以管理用户和所有内容
- **editor**：编辑，可以创建、编辑、发布内容，管理分类和标签
- **author**：作者，可以创建内容和上传媒体
- **reviewer**：审核员，可以审核内容
- **user**：普通用户，只能查看已发布内容和提交表单

### 2. 内容工作流
1. **草稿** → 作者创建内容
2. **待审核** → 提交审核
3. **已批准** → 审核通过
4. **已发布** → 发布到网站
5. **已拒绝** → 审核不通过

### 3. 管理界面
- **传统管理面板**：`admin-panel.html` - 简单的内容管理
- **新管理仪表板**：`admin-dashboard.html` - 完整的多标签管理系统

## 文件结构说明

```
/
├── firebase-config.js          # Firebase配置
├── auth.js                     # 用户认证功能
├── database.js                 # 数据库操作函数
├── firestore.rules             # Firestore安全规则
├── storage.rules               # Storage安全规则
├── admin-panel.html           # 传统管理面板
├── admin-dashboard.html       # 新管理仪表板
├── login.html                 # 用户登录
├── register.html              # 用户注册
├── index.html                 # 主门户页面
├── news.html                  # 新闻页面
├── contact-form.html          # 联系表单
└── departments.html           # 部门目录
```

## 扩展开发指南

### 1. 添加新内容类型
在 `admin-dashboard.html` 的创建内容表单中，添加新的内容类型选项：
```html
<option value="new-type">新类型</option>
```

### 2. 添加新的权限检查
在 `auth.js` 的 `getDefaultPermissions` 函数中添加新权限，并在 `checkUserRole` 函数中实现权限检查。

### 3. 集成富文本编辑器
建议集成 [TinyMCE](https://www.tiny.cloud/) 或 [Quill](https://quilljs.com/)：
1. 添加编辑器CSS和JS文件
2. 替换 `textarea` 为编辑器实例
3. 在表单提交时获取编辑器内容

### 4. 添加API端点
使用Firebase Functions创建REST API：
1. 安装Firebase CLI：`npm install -g firebase-tools`
2. 初始化Functions：`firebase init functions`
3. 创建API端点处理业务逻辑

## 安全注意事项

### 1. 生产环境配置
- 更新Firestore和Storage安全规则，限制公开访问
- 启用电子邮件验证
- 设置密码强度要求
- 配置CORS策略

### 2. 数据备份
- 定期备份Firestore数据
- 设置存储桶的生命周期规则
- 启用Firestore数据导出

### 3. 监控和日志
- 启用Firebase Analytics监控使用情况
- 设置错误报告（Firebase Crashlytics）
- 监控API使用量和成本

## 故障排除

### 1. 权限错误
- 检查用户角色是否正确设置
- 验证Firestore安全规则
- 检查Storage安全规则

### 2. 内容不显示
- 确认内容状态为 "published"
- 检查Firestore查询条件
- 查看浏览器控制台错误

### 3. 上传失败
- 检查文件大小限制（当前10MB）
- 验证文件类型是否允许
- 检查Storage安全规则

## 后续开发计划

### 阶段2：核心功能
- 完整的工作流审批系统
- 媒体库管理界面
- 高级搜索功能

### 阶段3：高级功能
- 内容版本控制
- REST API开发
- 数据分析仪表板

### 阶段4：优化部署
- 性能优化
- 安全加固
- 监控运维

## 技术支持

如有问题，请参考：
- [Firebase文档](https://firebase.google.com/docs)
- [项目GitHub仓库](#)
- 系统管理员：admin@atelier.gov

---
*最后更新：2026年3月14日*