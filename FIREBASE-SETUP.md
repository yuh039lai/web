# Firebase + GitHub Pages 設定指南

## 🚀 快速開始

這個足球網站已經改造成使用 Firebase 作為後端資料庫，支持完整的內容管理功能。

---

## 📋 設定步驟

### Step 1：建立 Firebase 專案

1. 訪問 [Firebase 控制台](https://console.firebase.google.com/)
2. 點擊「建立專案」
3. 輸入專案名稱（例如：`football-world`）
4. 選擇帳號並同意條款
5. 點擊「建立專案」
6. 等待專案建立完成

### Step 2：建立 Web 應用

1. 在 Firebase 專案首頁，點擊「新增應用」
2. 選擇 Web（</> 圖標）
3. 輸入應用名稱（例如：`football-world-web`）
4. 點擊「註冊應用」
5. 複製顯示的 Firebase 設定

### Step 3：複製 Firebase 設定

Firebase 會提供類似這樣的設定：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4：更新 firebase-config.js

1. 打開 `firebase-config.js` 檔案
2. 將上面複製的設定貼入，替換所有的 `YOUR_*` 值
3. 保存檔案

### Step 5：啟用 Firestore 資料庫

1. 在 Firebase 控制台，左邊點擊「Firestore 資料庫」
2. 點擊「建立資料庫」
3. 選擇起始模式（選擇測試模式）
4. 選擇資料庫位置
5. 點擊「建立」

### Step 6：啟用 Firebase 驗證

1. 在 Firebase 控制台，左邊點擊「身份驗證」
2. 點擊「開始使用」
3. 選擇「電子郵件/密碼」提供者
4. 打開啟用開關
5. 點擊「保存」

### Step 7：建立管理帳號

1. 還在「身份驗證」頁面
2. 點擊「使用者」標籤
3. 點擊「新增使用者」
4. 輸入朋友的電子郵件和密碼
5. 點擊「新增使用者」

這個帳號就是朋友用來登入管理後台的帳號。

### Step 8：啟用 Firebase Storage（用於上傳圖片）

1. 在 Firebase 控制台，左邊點擊「Storage」
2. 點擊「開始使用」
3. 選擇起始模式（選擇測試模式）
4. 點擊「完成」

---

## 🌐 本地測試

### 方法 1：使用 Python 簡易伺服器

```bash
cd c:\Users\hank5\web
python -m http.server 8000
```

然後訪問 `http://localhost:8000`

### 方法 2：使用 Live Server 擴展

1. 在 VS Code 安裝 "Live Server" 擴展
2. 右鍵點擊 `index.html`
3. 選擇 "Open with Live Server"

### 測試管理後台

1. 訪問 `http://localhost:8000/admin.html`
2. 使用在 Firebase 建立的帳號登入
3. 開始編輯內容！

---

## 🔐 安全性設定

### 更新 Firestore 安全規則

在 Firebase 控制台：

1. 進入 Firestore 資料庫
2. 點擊「規則」標籤
3. 替換為以下規則：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 所有人都可以讀取公開資訊
    match /articles/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 設定只有登入使用者可以讀
    match /settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

4. 點擊「發佈」

---

## 📤 部署到 GitHub Pages

### Step 1：建立 GitHub 儲存庫

1. 訪問 [GitHub](https://github.com)
2. 點擊「+ 新建儲存庫」
3. 輸入名稱：`football-world`（或其他名稱）
4. 選擇「Public」
5. 點擊「建立儲存庫」

### Step 2：將代碼推送到 GitHub

在 VS Code 終端中運行：

```bash
cd c:\Users\hank5\web

# 初始化 Git（如果還沒有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交：足球世界網站"

# 添加遠端 GitHub 儲存庫
git remote add origin https://github.com/YOUR_USERNAME/football-world.git

# 推送代碼
git push -u origin main
```

替換 `YOUR_USERNAME` 為你的 GitHub 使用者名稱。

### Step 3：啟用 GitHub Pages

1. 在 GitHub 儲存庫頁面，點擊「Settings」
2. 左邊點擊「Pages」
3. 在「Build and deployment」下，選擇「Branch」
4. 選擇 `main` 分支，根目錄
5. 點擊「Save」
6. 等待部署完成（通常 1-2 分鐘）

你的網站會在以下網址發布：
```
https://YOUR_USERNAME.github.io/football-world
```

### Step 4：驗證 Firebase 連接

1. 訪問 `https://YOUR_USERNAME.github.io/football-world`
2. 檢查網站是否正常載入
3. 訪問管理後台：`https://YOUR_USERNAME.github.io/football-world/admin.html`
4. 使用建立的帳號登入

---

## 🎯 朋友使用指南

### 登入管理後台

1. 訪問 `https://YOUR_USERNAME.github.io/football-world/admin.html`
2. 使用提供的電子郵件和密碼登入
3. 進入管理儀表板

### 編輯內容

#### 📝 編輯文章
- 點擊左邊「文章管理」
- 點擊「+ 新增文章」或編輯現有文章
- 填入標題、分類、內容
- 點擊「保存文章」

#### 📄 編輯頁面
- 點擊左邊「頁面編輯」
- 修改頁面內容
- 點擊「保存」

#### ⚙️ 編輯設定
- 點擊左邊「網站設定」
- 修改網站名稱、介紹、聯絡方式
- 點擊「保存設定」

#### ⚽ 查看足球選手
- 點擊左邊「足球選手」
- 點擊「載入選手資料」
- 查看從 API 獲取的選手信息

---

## 🔌 足球 API 設定

### 使用 API-Sports.io 獲取足球資料

1. 訪問 [API-Sports.io](https://www.api-sports.io/)
2. 點擊「Sign Up」註冊帳號
3. 獲取免費 API Key
4. 在 `firebase-utils.js` 中的 `getFootballPlayers()` 函數裡
5. 替換 `YOUR_API_KEY` 為你的實際 API Key

### 替換位置

在 `firebase-utils.js` 中找到這一行：

```javascript
'x-apisports-key': 'YOUR_API_KEY' // 需要在 api-sports.io 註冊
```

替換為你的實際 API Key。

---

## 🆘 常見問題

### Q: 登入後台時出現 "Firebase is not defined"

**A:** 確認 `firebase-config.js` 中的 Firebase SDK 正確加載，並且設定信息已更新。

### Q: 文章無法保存

**A:** 
1. 檢查 Firebase 控制台是否已啟用 Firestore 資料庫
2. 確認 Firestore 安全規則是否已更新
3. 檢查瀏覽器控制台是否有錯誤訊息

### Q: 圖片無法上傳

**A:**
1. 確認 Firebase Storage 已啟用
2. 檢查 Storage 的安全規則
3. 嘗試使用圖片 URL 而不是上傳

### Q: GitHub Pages 無法訪問

**A:**
1. 確認儲存庫是 Public
2. 等待 GitHub Pages 部署完成（檢查 Settings > Pages）
3. 清除瀏覽器快取並重新載入

---

## 📝 文件結構

```
c:\Users\hank5\web\
├── index.html              # 首頁
├── blog.html               # 部落格頁面
├── about.html              # 關於我們
├── contact.html            # 聯絡方式
├── admin.html              # 管理後台登入
├── admin-dashboard.html    # 管理後台儀表板
├── firebase-config.js      # Firebase 設定
├── firebase-utils.js       # Firebase 工具函數
├── style.css               # 樣式表
├── script.js               # 前端腳本
└── FIREBASE-SETUP.md       # 本檔案
```

---

## 🎉 完成！

設定完成後，你和朋友就可以：

✅ 朋友登入管理後台編輯網站內容  
✅ 自動保存到 Firebase Firestore  
✅ 前台自動讀取並顯示最新內容  
✅ 網站託管在 GitHub Pages（免費）  
✅ 支持圖片上傳到 Firebase Storage  

**任何問題，請查閱官方文檔或聯絡我！** 🚀

---

**最後更新：** 2026年8月16日
