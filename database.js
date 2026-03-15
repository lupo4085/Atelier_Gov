// 数据库操作（GitHub API 封装层）
// 保持与旧 Firestore 版本相同的函数签名和返回格式
// 所有实际操作由 github-api.js 中的 _gh 对象处理

// 提交表单数据
async function submitForm(formData) {
  return _gh.submitForm(formData);
}

// 获取动态内容（新闻、公告等）
async function getContent(contentType, limit = 10) {
  return _gh.getContent(contentType, limit);
}

// 获取内容列表（支持筛选和分页）
async function getContentList(filters = {}, limit = 20) {
  return _gh.getContentList(filters, limit);
}

// 搜索内容
async function searchContent(keyword, contentType = null) {
  return _gh.searchContent(keyword, contentType);
}

// 添加新内容（需要创建内容权限）
async function addContent(contentData) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) {
      return { success: false, error: '请先登录' };
    }

    const roleCheck = await checkUserRole('author');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要作者权限才能创建内容' };
    }

    return _gh.addContent(contentData);
  } catch (error) {
    console.error('添加内容错误:', error);
    return { success: false, error: error.message };
  }
}

// 获取用户提交的表单（仅限自己的）
async function getUserSubmissions() {
  return _gh.getUserSubmissions();
}

// 分类管理函数
async function addCategory(categoryData) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('editor');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要编辑权限' };
    }

    return _gh.addCategory(categoryData);
  } catch (error) {
    console.error('添加分类错误:', error);
    return { success: false, error: error.message };
  }
}

async function getCategories(parentId = null) {
  return _gh.getCategories(parentId);
}

async function updateCategory(categoryId, updateData) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('editor');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要编辑权限' };
    }

    return _gh.updateCategory(categoryId, updateData);
  } catch (error) {
    console.error('更新分类错误:', error);
    return { success: false, error: error.message };
  }
}

// 标签管理函数
async function addTag(tagData) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('author');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要作者权限' };
    }

    return _gh.addTag(tagData);
  } catch (error) {
    console.error('添加标签错误:', error);
    return { success: false, error: error.message };
  }
}

async function getTags(limit = 50) {
  return _gh.getTags(limit);
}

// 媒体管理函数
async function uploadMedia(file, metadata = {}) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('author');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要作者权限' };
    }

    return _gh.uploadMedia(file, metadata);
  } catch (error) {
    console.error('上传媒体错误:', error);
    return { success: false, error: error.message };
  }
}

async function getMediaList(limit = 20) {
  return _gh.getMediaList(limit);
}

// 内容管理增强函数
async function updateContent(contentId, updateData) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('editor');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要编辑权限' };
    }

    return _gh.updateContent(contentId, updateData);
  } catch (error) {
    console.error('更新内容错误:', error);
    return { success: false, error: error.message };
  }
}

async function deleteContent(contentId) {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('editor');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要编辑权限' };
    }

    return _gh.deleteContent(contentId);
  } catch (error) {
    console.error('删除内容错误:', error);
    return { success: false, error: error.message };
  }
}

// 工作流管理函数
async function submitForReview(contentId, notes = '') {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    return _gh.submitForReview(contentId, notes);
  } catch (error) {
    console.error('提交审核错误:', error);
    return { success: false, error: error.message };
  }
}

async function approveContent(contentId, notes = '') {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('reviewer');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要审核员权限' };
    }

    return _gh.approveContent(contentId, notes);
  } catch (error) {
    console.error('审核通过错误:', error);
    return { success: false, error: error.message };
  }
}

async function rejectContent(contentId, notes = '') {
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '请先登录' };

    const roleCheck = await checkUserRole('reviewer');
    if (!roleCheck.success || !roleCheck.hasRole) {
      return { success: false, error: '需要审核员权限' };
    }

    return _gh.rejectContent(contentId, notes);
  } catch (error) {
    console.error('审核拒绝错误:', error);
    return { success: false, error: error.message };
  }
}

// 导出函数到全局作用域
window.submitForm = submitForm;
window.getContent = getContent;
window.getContentList = getContentList;
window.searchContent = searchContent;
window.addContent = addContent;
window.getUserSubmissions = getUserSubmissions;
window.addCategory = addCategory;
window.getCategories = getCategories;
window.updateCategory = updateCategory;
window.addTag = addTag;
window.getTags = getTags;
window.uploadMedia = uploadMedia;
window.getMediaList = getMediaList;
window.updateContent = updateContent;
window.deleteContent = deleteContent;
window.submitForReview = submitForReview;
window.approveContent = approveContent;
window.rejectContent = rejectContent;
