// GitHub API 封装模块
// 替代所有 Firestore/Storage 操作，使用 GitHub 仓库存储数据

const GITHUB_OWNER = 'lupo4085';
const GITHUB_REPO = 'Atelier_Gov';
const GITHUB_BRANCH = 'main';
const GITHUB_PAGES_BASE = 'https://lupo4085.github.io/Atelier_Gov';
const GITHUB_API_BASE = 'https://api.github.com';

// ============================================================
// GitHub PAT 管理（仅管理员需要）
// ============================================================

function setGitHubToken(token) {
  // 使用 sessionStorage 代替 localStorage：关闭标签页后自动清除，降低 XSS 风险
  sessionStorage.setItem('github_pat', token);
}

function getGitHubToken() {
  return sessionStorage.getItem('github_pat');
}

function clearGitHubToken() {
  sessionStorage.removeItem('github_pat');
}

// ============================================================
// 底层 API 请求
// ============================================================

async function githubApiRequest(path, method = 'GET', body = null) {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub PAT 未设置。请先在设置中输入 GitHub Personal Access Token。');
  }

  const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API 请求失败: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// 从 GitHub Pages 公开读取（无需 PAT）
async function getPublicContent(path) {
  const url = `${GITHUB_PAGES_BASE}/${path}?t=${Date.now()}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`读取内容失败: ${response.status}`);
  }
  return response.json();
}

// 获取文件内容和 SHA（通过 API，用于写操作前获取 SHA）
async function getFileMeta(path) {
  try {
    const data = await githubApiRequest(`/contents/${path}?ref=${GITHUB_BRANCH}`);
    return {
      sha: data.sha,
      content: JSON.parse(atob(data.content))
    };
  } catch (e) {
    if (e.message.includes('404') || e.message.includes('Not Found')) {
      return null;
    }
    throw e;
  }
}

// 创建或更新文件
async function putFileContent(path, content, message) {
  const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

  const body = {
    message,
    content: encodedContent,
    branch: GITHUB_BRANCH
  };

  // 尝试获取已有文件的 SHA（更新需要 SHA）
  const existing = await getFileMeta(path).catch(() => null);
  if (existing) {
    body.sha = existing.sha;
  }

  return githubApiRequest(`/contents/${path}`, 'PUT', body);
}

// 上传二进制文件（base64）
async function putBinaryFile(path, base64Content, message) {
  const body = {
    message,
    content: base64Content,
    branch: GITHUB_BRANCH
  };

  const existing = await getFileMeta(path).catch(() => null);
  if (existing) {
    body.sha = existing.sha;
  }

  return githubApiRequest(`/contents/${path}`, 'PUT', body);
}

// 删除文件
async function deleteFile(path, message) {
  const existing = await getFileMeta(path);
  if (!existing) {
    throw new Error('文件不存在');
  }

  return githubApiRequest(`/contents/${path}`, 'DELETE', {
    message,
    sha: existing.sha,
    branch: GITHUB_BRANCH
  });
}

// ============================================================
// 生成唯一 ID
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// ============================================================
// 内容 CRUD（替代 database.js 中的 Firestore 操作）
// ============================================================

async function ghAddContent(contentData) {
  const id = generateId();
  const now = new Date().toISOString();
  const user = window.firebaseAuth.currentUser;

  const contentType = contentData.type || 'news';
  const typeFolder = contentType.replace(/-/g, '-');

  const fullContent = {
    id,
    ...contentData,
    authorId: user ? user.uid : null,
    authorName: user ? (user.displayName || user.email) : 'unknown',
    authorEmail: user ? user.email : null,
    createdAt: now,
    updatedAt: now,
    status: contentData.status || (contentData.published ? 'published' : 'draft'),
    published: contentData.published || false,
    featured: contentData.featured || false,
    views: 0
  };

  if (fullContent.status === 'published' && !fullContent.publishedAt) {
    fullContent.publishedAt = now;
  }

  // 保存内容 JSON 文件
  await putFileContent(
    `content/${typeFolder}/${id}.json`,
    fullContent,
    `添加内容: ${contentData.title || id}`
  );

  // 更新 index.json
  await updateContentIndex('add', {
    id,
    title: fullContent.title,
    type: fullContent.type,
    status: fullContent.status,
    published: fullContent.published,
    featured: fullContent.featured,
    authorId: fullContent.authorId,
    authorName: fullContent.authorName,
    authorEmail: fullContent.authorEmail,
    categoryId: fullContent.categoryId || null,
    tags: fullContent.tags || [],
    createdAt: now,
    updatedAt: now,
    publishedAt: fullContent.publishedAt || null,
    excerpt: (fullContent.content || '').substring(0, 200)
  });

  return { success: true, id };
}

async function ghGetContent(contentType, limit = 10) {
  try {
    const index = await getPublicContent('content/index.json');
    if (!index || !index.items) {
      return { success: true, content: [] };
    }

    let items = index.items.filter(item =>
      item.type === contentType && item.published === true
    );

    // 按发布时间降序排序
    items.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));

    if (limit) {
      items = items.slice(0, limit);
    }

    return { success: true, content: items };
  } catch (error) {
    console.error('获取内容错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghGetContentList(filters = {}, limit = 20) {
  try {
    const index = await getPublicContent('content/index.json');
    if (!index || !index.items) {
      return { success: true, content: [], hasMore: false };
    }

    let items = index.items;

    // 应用筛选条件
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    } else if (filters.published !== undefined) {
      items = items.filter(item => item.published === filters.published);
    }

    if (filters.categoryId) {
      items = items.filter(item => item.categoryId === filters.categoryId);
    }

    if (filters.authorId) {
      items = items.filter(item => item.authorId === filters.authorId);
    }

    if (filters.featured) {
      items = items.filter(item => item.featured === true);
    }

    // 排序
    if (filters.sortBy === 'createdAt') {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      items.sort((a, b) => order * (new Date(a.createdAt) - new Date(b.createdAt)));
    } else {
      items.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
    }

    const hasMore = items.length > limit;
    items = items.slice(0, limit);

    return { success: true, content: items, hasMore };
  } catch (error) {
    console.error('获取内容列表错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghSearchContent(keyword, contentType = null) {
  try {
    const index = await getPublicContent('content/index.json');
    if (!index || !index.items) {
      return { success: true, results: [] };
    }

    let items = index.items.filter(item => item.published === true);

    if (contentType) {
      items = items.filter(item => item.type === contentType);
    }

    const lowerKeyword = keyword.toLowerCase();
    const results = items.filter(item =>
      (item.title && item.title.toLowerCase().includes(lowerKeyword)) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(lowerKeyword))
    );

    results.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));

    return { success: true, results };
  } catch (error) {
    console.error('搜索错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghUpdateContent(contentId, updateData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    // 从 index 找到内容信息
    const index = await getPublicContent('content/index.json');
    if (!index || !index.items) {
      return { success: false, error: '内容索引不存在' };
    }

    const itemIndex = index.items.findIndex(item => item.id === contentId);
    if (itemIndex === -1) {
      return { success: false, error: '内容不存在' };
    }

    const existingItem = index.items[itemIndex];
    const typeFolder = (existingItem.type || 'news').replace(/-/g, '-');
    const now = new Date().toISOString();

    // 读取完整内容文件
    const fullContent = await getPublicContent(`content/${typeFolder}/${contentId}.json`);
    if (!fullContent) {
      return { success: false, error: '内容文件不存在' };
    }

    // 合并更新
    const updated = {
      ...fullContent,
      ...updateData,
      updatedAt: now,
      updatedBy: user.uid
    };

    // 保存更新后的内容
    await putFileContent(
      `content/${typeFolder}/${contentId}.json`,
      updated,
      `更新内容: ${updated.title || contentId}`
    );

    // 更新 index
    await updateContentIndex('update', {
      id: contentId,
      title: updated.title,
      type: updated.type,
      status: updated.status,
      published: updated.published,
      featured: updated.featured,
      authorId: updated.authorId,
      authorName: updated.authorName,
      authorEmail: updated.authorEmail,
      categoryId: updated.categoryId || null,
      tags: updated.tags || [],
      createdAt: updated.createdAt,
      updatedAt: now,
      publishedAt: updated.publishedAt || null,
      excerpt: (updated.content || '').substring(0, 200)
    });

    return { success: true };
  } catch (error) {
    console.error('更新内容错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghDeleteContent(contentId) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    // 从 index 找到内容
    const index = await getPublicContent('content/index.json');
    if (!index || !index.items) {
      return { success: false, error: '内容索引不存在' };
    }

    const item = index.items.find(i => i.id === contentId);
    if (!item) {
      return { success: false, error: '内容不存在' };
    }

    const typeFolder = (item.type || 'news').replace(/-/g, '-');

    // 删除内容文件
    await deleteFile(
      `content/${typeFolder}/${contentId}.json`,
      `删除内容: ${item.title || contentId}`
    );

    // 更新 index
    await updateContentIndex('delete', { id: contentId });

    return { success: true };
  } catch (error) {
    console.error('删除内容错误:', error);
    return { success: false, error: error.message };
  }
}

// 更新 content/index.json
async function updateContentIndex(action, itemData) {
  const meta = await getFileMeta('content/index.json');
  let index = meta ? meta.content : { lastUpdated: '', items: [] };

  index.lastUpdated = new Date().toISOString();

  if (action === 'add') {
    index.items.push(itemData);
  } else if (action === 'update') {
    const idx = index.items.findIndex(i => i.id === itemData.id);
    if (idx !== -1) {
      index.items[idx] = itemData;
    } else {
      index.items.push(itemData);
    }
  } else if (action === 'delete') {
    index.items = index.items.filter(i => i.id !== itemData.id);
  }

  const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(index, null, 2))));

  const body = {
    message: `更新内容索引 (${action})`,
    content: encodedContent,
    branch: GITHUB_BRANCH
  };

  if (meta) {
    body.sha = meta.sha;
  }

  await githubApiRequest('/contents/content/index.json', 'PUT', body);
}

// ============================================================
// 表单提交（存入 content/submissions/）
// ============================================================

async function ghSubmitForm(formData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const id = generateId();
    const now = new Date().toISOString();

    const submission = {
      id,
      ...formData,
      userId: user.uid,
      userEmail: user.email,
      submittedAt: now,
      status: 'pending'
    };

    await putFileContent(
      `content/submissions/${id}.json`,
      submission,
      `表单提交: ${id}`
    );

    return { success: true, id };
  } catch (error) {
    console.error('提交表单错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 更新提交（管理员审批用）
// ============================================================

async function ghUpdateSubmission(submissionId, updateData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    // 读取现有提交
    const submission = await getPublicContent(`content/submissions/${submissionId}.json`);
    if (!submission) {
      return { success: false, error: '提交不存在' };
    }

    // 合并更新数据
    const updated = {
      ...submission,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: user.uid,
      updatedByEmail: user.email
    };

    // 写回
    await putFileContent(
      `content/submissions/${submissionId}.json`,
      updated,
      `更新提交: ${submissionId} (${updateData.status || 'update'})`
    );

    return { success: true, submission: updated };
  } catch (error) {
    console.error('更新提交错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 用户提交查询
// ============================================================

async function ghGetUserSubmissions() {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    // 列出 submissions 目录下的文件
    const files = await githubApiRequest(`/contents/content/submissions?ref=${GITHUB_BRANCH}`);

    if (!Array.isArray(files)) {
      return { success: true, submissions: [] };
    }

    const submissions = [];
    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;
      try {
        const data = await getPublicContent(`content/submissions/${file.name}`);
        if (data && data.userId === user.uid) {
          submissions.push(data);
        }
      } catch (e) {
        // 跳过读取失败的文件
      }
    }

    submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return { success: true, submissions };
  } catch (error) {
    console.error('获取用户提交错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 分类管理
// ============================================================

async function ghAddCategory(categoryData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const id = generateId();
    const meta = await getFileMeta('content/categories.json');
    let categories = meta ? meta.content : [];

    categories.push({
      id,
      ...categoryData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(categories, null, 2))));
    const body = {
      message: `添加分类: ${categoryData.name || id}`,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (meta) body.sha = meta.sha;

    await githubApiRequest('/contents/content/categories.json', 'PUT', body);

    return { success: true, id };
  } catch (error) {
    console.error('添加分类错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghGetCategories(parentId = null) {
  try {
    const categories = await getPublicContent('content/categories.json');
    if (!categories) return { success: true, categories: [] };

    let filtered = categories;
    if (parentId) {
      filtered = categories.filter(c => c.parentId === parentId);
    } else {
      filtered = categories.filter(c => !c.parentId);
    }

    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return { success: true, categories: filtered };
  } catch (error) {
    console.error('获取分类错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghUpdateCategory(categoryId, updateData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const meta = await getFileMeta('content/categories.json');
    if (!meta) return { success: false, error: '分类文件不存在' };

    let categories = meta.content;
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx === -1) return { success: false, error: '分类不存在' };

    categories[idx] = {
      ...categories[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(categories, null, 2))));
    await githubApiRequest('/contents/content/categories.json', 'PUT', {
      message: `更新分类: ${categories[idx].name || categoryId}`,
      content: encodedContent,
      sha: meta.sha,
      branch: GITHUB_BRANCH
    });

    return { success: true };
  } catch (error) {
    console.error('更新分类错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 标签管理
// ============================================================

async function ghAddTag(tagData) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const id = generateId();
    const meta = await getFileMeta('content/tags.json');
    let tags = meta ? meta.content : [];

    tags.push({
      id,
      ...tagData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      usageCount: 0
    });

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(tags, null, 2))));
    const body = {
      message: `添加标签: ${tagData.name || id}`,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (meta) body.sha = meta.sha;

    await githubApiRequest('/contents/content/tags.json', 'PUT', body);

    return { success: true, id };
  } catch (error) {
    console.error('添加标签错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghGetTags(limit = 50) {
  try {
    const tags = await getPublicContent('content/tags.json');
    if (!tags) return { success: true, tags: [] };

    tags.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    return { success: true, tags: tags.slice(0, limit) };
  } catch (error) {
    console.error('获取标签错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 媒体上传（替代 Firebase Storage）
// ============================================================

async function ghUploadMedia(file, metadata = {}) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const id = generateId();
    const fileExt = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now();

    // 确定存储路径
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
    const folder = isImage ? 'media/images' : 'media/documents';
    const fileName = `${user.uid}_${timestamp}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 读取文件为 base64
    const base64Content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // FileReader 返回 data:type;base64,XXXX 格式，只取后面的部分
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 上传文件到 GitHub
    await putBinaryFile(
      filePath,
      base64Content,
      `上传媒体: ${file.name}`
    );

    const downloadURL = `${GITHUB_PAGES_BASE}/${filePath}`;

    // 更新 media/index.json
    const meta = await getFileMeta('media/index.json');
    let mediaIndex = meta ? meta.content : [];

    mediaIndex.push({
      id,
      name: file.name,
      fileName,
      filePath,
      downloadURL,
      size: file.size,
      type: file.type,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      ...metadata
    });

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(mediaIndex, null, 2))));
    const body = {
      message: `更新媒体索引: ${file.name}`,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (meta) body.sha = meta.sha;

    await githubApiRequest('/contents/media/index.json', 'PUT', body);

    return {
      success: true,
      id,
      downloadURL,
      fileName
    };
  } catch (error) {
    console.error('上传媒体错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghGetMediaList(limit = 20) {
  try {
    const mediaIndex = await getPublicContent('media/index.json');
    if (!mediaIndex) return { success: true, media: [] };

    let media = Array.isArray(mediaIndex) ? mediaIndex : [];
    media.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, media: media.slice(0, limit) };
  } catch (error) {
    console.error('获取媒体列表错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 工作流管理
// ============================================================

async function ghSubmitForReview(contentId, notes = '') {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    // 更新内容状态
    await ghUpdateContent(contentId, { status: 'pending_review' });

    // 添加工作流日志
    await addWorkflowLog({
      contentId,
      action: 'submit_for_review',
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      notes
    });

    return { success: true };
  } catch (error) {
    console.error('提交审核错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghApproveContent(contentId, notes = '') {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const now = new Date().toISOString();
    await ghUpdateContent(contentId, {
      status: 'approved',
      published: true,
      publishedAt: now,
      approvedBy: user.uid,
      approvedByName: user.displayName || user.email
    });

    await addWorkflowLog({
      contentId,
      action: 'approve',
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      notes
    });

    return { success: true };
  } catch (error) {
    console.error('审核通过错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghRejectContent(contentId, notes = '') {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    await ghUpdateContent(contentId, { status: 'rejected' });

    await addWorkflowLog({
      contentId,
      action: 'reject',
      performedBy: user.uid,
      performedByName: user.displayName || user.email,
      notes
    });

    return { success: true };
  } catch (error) {
    console.error('审核拒绝错误:', error);
    return { success: false, error: error.message };
  }
}

async function addWorkflowLog(logEntry) {
  try {
    const meta = await getFileMeta('config/workflow-logs.json');
    let logs = meta ? meta.content : [];

    logs.push({
      id: generateId(),
      ...logEntry,
      timestamp: new Date().toISOString()
    });

    // 只保留最近 500 条日志
    if (logs.length > 500) {
      logs = logs.slice(-500);
    }

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(logs, null, 2))));
    const body = {
      message: `工作流日志: ${logEntry.action}`,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (meta) body.sha = meta.sha;

    await githubApiRequest('/contents/config/workflow-logs.json', 'PUT', body);
  } catch (error) {
    console.error('记录工作流日志错误:', error);
  }
}

// ============================================================
// 用户角色管理
// ============================================================

// 从 config/users.json 读取角色（公开读取，通过 GitHub Pages）
async function ghCheckUserRole(requiredRole) {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '用户未登录' };

    const roleHierarchy = {
      'super_admin': 6,
      'admin': 5,
      'editor': 4,
      'author': 3,
      'reviewer': 2,
      'user': 1
    };

    let userRole = 'user';

    // 1. 先查 config/users.json（管理员手动分配的角色优先）
    try {
      const usersConfig = await getPublicContent('config/users.json');
      if (usersConfig && usersConfig.users) {
        const userEntry = usersConfig.users.find(u => u.uid === user.uid);
        if (userEntry && userEntry.role) {
          userRole = userEntry.role;
        } else {
          // 2. 用户不在 users.json 中，检查邮箱后缀
          if (user.email && user.email.endsWith('@atelier.gov.at')) {
            userRole = 'editor';
          }
        }
      }
    } catch (e) {
      // users.json 不可用时，用邮箱后缀判断
      if (user.email && user.email.endsWith('@atelier.gov.at')) {
        userRole = 'editor';
      }
    }

    const userRoleLevel = roleHierarchy[userRole] || 1;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 1;

    return {
      success: true,
      hasRole: userRoleLevel >= requiredRoleLevel,
      userRole
    };
  } catch (error) {
    console.error('检查用户角色错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghGetCurrentUserProfile() {
  try {
    const user = window.firebaseAuth.currentUser;
    if (!user) return { success: false, error: '用户未登录' };

    let userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'user',
      permissions: {}
    };

    // 从 config/users.json 获取角色信息
    try {
      const usersConfig = await getPublicContent('config/users.json');
      if (usersConfig && usersConfig.users) {
        const userEntry = usersConfig.users.find(u => u.uid === user.uid);
        if (userEntry) {
          userData = { ...userData, ...userEntry };
        } else if (user.email && user.email.endsWith('@atelier.gov.at')) {
          userData.role = 'editor';
        }
      }
    } catch (e) {
      if (user.email && user.email.endsWith('@atelier.gov.at')) {
        userData.role = 'editor';
      }
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return { success: false, error: error.message };
  }
}

async function ghUpdateUserRole(userId, newRole) {
  try {
    const currentUser = window.firebaseAuth.currentUser;
    if (!currentUser) return { success: false, error: '请先登录' };

    const validRoles = ['super_admin', 'admin', 'editor', 'author', 'reviewer', 'user'];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: '无效的角色' };
    }

    const meta = await getFileMeta('config/users.json');
    let usersConfig = meta ? meta.content : { users: [] };

    const idx = usersConfig.users.findIndex(u => u.uid === userId);
    if (idx !== -1) {
      usersConfig.users[idx].role = newRole;
      usersConfig.users[idx].updatedAt = new Date().toISOString();
    } else {
      usersConfig.users.push({
        uid: userId,
        role: newRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(usersConfig, null, 2))));
    await githubApiRequest('/contents/config/users.json', 'PUT', {
      message: `更新用户角色: ${userId} → ${newRole}`,
      content: encodedContent,
      sha: meta ? meta.sha : undefined,
      branch: GITHUB_BRANCH
    });

    return { success: true };
  } catch (error) {
    console.error('更新用户角色错误:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// 导出到全局作用域
// ============================================================

window.setGitHubToken = setGitHubToken;
window.getGitHubToken = getGitHubToken;
window.clearGitHubToken = clearGitHubToken;

// 供 database.js 包装层调用的内部函数
window._gh = {
  addContent: ghAddContent,
  getContent: ghGetContent,
  getContentList: ghGetContentList,
  searchContent: ghSearchContent,
  updateContent: ghUpdateContent,
  deleteContent: ghDeleteContent,
  submitForm: ghSubmitForm,
  updateSubmission: ghUpdateSubmission,
  getUserSubmissions: ghGetUserSubmissions,
  addCategory: ghAddCategory,
  getCategories: ghGetCategories,
  updateCategory: ghUpdateCategory,
  addTag: ghAddTag,
  getTags: ghGetTags,
  uploadMedia: ghUploadMedia,
  getMediaList: ghGetMediaList,
  submitForReview: ghSubmitForReview,
  approveContent: ghApproveContent,
  rejectContent: ghRejectContent,
  checkUserRole: ghCheckUserRole,
  getCurrentUserProfile: ghGetCurrentUserProfile,
  updateUserRole: ghUpdateUserRole
};
