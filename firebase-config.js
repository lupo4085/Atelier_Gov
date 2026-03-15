// Firebase 配置（仅 Auth 认证）
// Firestore 和 Storage 已迁移到 GitHub 存储
const firebaseConfig = {
  apiKey: "AIzaSyC5g7R1HHE2RlFpgvWW4erBLDUSt-nlU1Y",
  authDomain: "atelier-government.firebaseapp.com",
  projectId: "atelier-government",
  storageBucket: "atelier-government.firebasestorage.app",
  messagingSenderId: "597493519716",
  appId: "1:597493519716:web:c808ac72ef33768c885671",
  measurementId: "G-WM511G3WZQ"
};

// 初始化 Firebase（仅 App + Auth）
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 导出供其他文件使用
window.firebaseApp = app;
window.firebaseAuth = auth;
