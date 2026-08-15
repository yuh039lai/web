# 足球世界 - Firebase 版本 🎉

一個完整的足球網站管理系統，朋友可以直接登入編輯所有內容！

## ⚡ 快速開始

### 1️⃣ Firebase 設定（一次性）
- 打開 `FIREBASE-SETUP.md` 
- 按照步驟建立 Firebase 專案
- 複製設定信息到 `firebase-config.js`

### 2️⃣ 本地測試
```bash
cd c:\Users\hank5\web
python -m http.server 8000
```
然後訪問：
- 🌐 前台：`http://localhost:8000`
- 🔐 後台：`http://localhost:8000/admin.html`

### 3️⃣ 部署到 GitHub Pages
遵循 `FIREBASE-SETUP.md` 中的部署步驟

---

## 📁 檔案說明

| 檔案 | 說明 |
|------|------|
| `index.html` | 首頁 |
| `blog.html` | 部落格文章列表 |
| `about.html` | 關於我們 |
| `contact.html` | 聯絡方式 |
| `admin.html` | 登入頁面 |
| `admin-dashboard.html` | 管理後台 |
| `firebase-config.js` | Firebase 設定（需要更新） |
| `firebase-utils.js` | Firebase 工具函數 |
| `style.css` | 網站樣式 |
| `script.js` | 前端邏輯 |
| `FIREBASE-SETUP.md` | 詳細設定說明 |

---

## 🎯 朋友可以做什麼

✅ 登入管理後台  
✅ 新增 / 編輯 / 刪除文章  
✅ 編輯頁面標題和內容  
✅ 修改網站設定（名稱、介紹、聯絡方式）  
✅ 上傳圖片  
✅ 查看足球選手數據

---

## 🔑 重要提醒

1. **千萬不要**在公開的 GitHub 上提交 `firebase-config.js`
2. 已設定 `.gitignore` 自動忽略此檔案
3. 朋友登入時使用在 Firebase 建立的帳號
4. 確認 Firebase Firestore 和 Storage 已啟用

---

## 📞 技術支持

遇到問題？檢查 `FIREBASE-SETUP.md` 中的常見問題部分。

---

**準備好了嗎？** 🚀 按照 `FIREBASE-SETUP.md` 開始設定！
