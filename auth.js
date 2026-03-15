// 认证相关功能（Firebase Auth + GitHub 角色管理）

// 检查用户登录状态
function checkAuthState() {
  firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      console.log('用户已登录:', user.email);
      updateUIForLoggedInUser(user);
    } else {
      console.log('用户未登录');
      updateUIForLoggedOutUser();
    }
  });
}

// 用户注册（仅 Firebase Auth，不再写入 Firestore）
async function signUp(email, password, displayName) {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // 更新用户显示名称
    await user.updateProfile({
      displayName: displayName
    });

    return { success: true, user };
  } catch (error) {
    console.error('注册错误:', error);
    return { success: false, error: error.message };
  }
}

// 获取默认权限
function getDefaultPermissions(role) {
  const permissions = {
    can_create_content: false,
    can_edit_content: false,
    can_delete_content: false,
    can_publish_content: false,
    can_review_content: false,
    can_manage_users: false,
    can_manage_roles: false,
    can_manage_categories: false,
    can_manage_tags: false,
    can_upload_media: false,
    can_manage_settings: false
  };

  switch (role) {
    case 'super_admin':
      Object.keys(permissions).forEach(key => permissions[key] = true);
      break;
    case 'admin':
      permissions.can_create_content = true;
      permissions.can_edit_content = true;
      permissions.can_delete_content = true;
      permissions.can_publish_content = true;
      permissions.can_review_content = true;
      permissions.can_manage_users = true;
      permissions.can_manage_categories = true;
      permissions.can_manage_tags = true;
      permissions.can_upload_media = true;
      break;
    case 'editor':
      permissions.can_create_content = true;
      permissions.can_edit_content = true;
      permissions.can_delete_content = true;
      permissions.can_publish_content = true;
      permissions.can_review_content = true;
      permissions.can_manage_categories = true;
      permissions.can_manage_tags = true;
      permissions.can_upload_media = true;
      break;
    case 'reviewer':
      permissions.can_review_content = true;
      break;
    case 'author':
      permissions.can_create_content = true;
      permissions.can_edit_content = true;
      permissions.can_upload_media = true;
      break;
    case 'user':
      break;
  }

  return permissions;
}

// 用户登录
async function signIn(email, password) {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('登录错误:', error);
    return { success: false, error: error.message };
  }
}

// 用户注销
async function signOut() {
  try {
    // 清除 GitHub PAT
    if (typeof clearGitHubToken === 'function') {
      clearGitHubToken();
    }
    await firebaseAuth.signOut();
    return { success: true };
  } catch (error) {
    console.error('注销错误:', error);
    return { success: false, error: error.message };
  }
}

// 更新 UI - 登录状态
function updateUIForLoggedInUser(user) {
  const authElements = document.querySelectorAll('.auth-status');
  authElements.forEach(element => {
    element.innerHTML = `
      <span>欢迎，${user.displayName || user.email}</span>
      <button onclick="signOut()" class="btn-logout">注销</button>
    `;
  });

  const protectedElements = document.querySelectorAll('.requires-auth');
  protectedElements.forEach(element => {
    element.style.display = 'block';
  });
}

// 更新 UI - 未登录状态
function updateUIForLoggedOutUser() {
  const authElements = document.querySelectorAll('.auth-status');
  authElements.forEach(element => {
    element.innerHTML = `
      <a href="login.html" class="btn-login">登录</a>
      <a href="register.html" class="btn-register">注册</a>
    `;
  });

  const protectedElements = document.querySelectorAll('.requires-auth');
  protectedElements.forEach(element => {
    element.style.display = 'none';
  });
}

// 初始化认证状态检查
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebaseAuth !== 'undefined') {
    checkAuthState();
  }
});

// 检查用户角色和权限（从 config/users.json 读取，通过 GitHub Pages）
async function checkUserRole(role) {
  // 如果 github-api.js 已加载，使用它
  if (typeof _gh !== 'undefined' && _gh.checkUserRole) {
    return _gh.checkUserRole(role);
  }

  // 降级方案：仅基于邮箱后缀判断
  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '用户未登录' };

    const roleHierarchy = {
      'super_admin': 6, 'admin': 5, 'editor': 4,
      'author': 3, 'reviewer': 2, 'user': 1
    };

    let userRole = 'user';
    if (user.email && user.email.endsWith('@atelier.gov.at')) {
      userRole = 'editor';
    }

    const userRoleLevel = roleHierarchy[userRole] || 1;
    const requiredRoleLevel = roleHierarchy[role] || 1;

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

// 获取当前用户详细信息
async function getCurrentUserProfile() {
  if (typeof _gh !== 'undefined' && _gh.getCurrentUserProfile) {
    return _gh.getCurrentUserProfile();
  }

  try {
    const user = firebaseAuth.currentUser;
    if (!user) return { success: false, error: '用户未登录' };

    let userRole = 'user';
    if (user.email && user.email.endsWith('@atelier.gov.at')) {
      userRole = 'editor';
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userRole,
        permissions: getDefaultPermissions(userRole)
      }
    };
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return { success: false, error: error.message };
  }
}

// 更新用户角色（仅限管理员）
async function updateUserRole(userId, newRole) {
  if (typeof _gh !== 'undefined' && _gh.updateUserRole) {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) return { success: false, error: '请先登录' };

      const roleCheck = await checkUserRole('admin');
      if (!roleCheck.success || !roleCheck.hasRole) {
        return { success: false, error: '需要管理员权限' };
      }

      return _gh.updateUserRole(userId, newRole);
    } catch (error) {
      console.error('更新用户角色错误:', error);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'GitHub API 模块未加载' };
}

// 导出函数到全局作用域
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.checkAuthState = checkAuthState;
window.checkUserRole = checkUserRole;
window.getCurrentUserProfile = getCurrentUserProfile;
window.updateUserRole = updateUserRole;
