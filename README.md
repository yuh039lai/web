# 庭寬的足球小窩（Render 後端版）

這個專案採用「靜態前端 + Render 部署 Node.js 後端 API」。

## 架構

- 前端：index.html、blog.html、chat.html、admin.html 等靜態頁面
- 後端：server/index.js（Express API）
- 資料儲存：server/db.json（開發用途）
- API 設定：api-config.js

## 主要功能

- 管理員登入（JWT）
- 本地帳號註冊（可直接在 admin.html 建立）
- 賽事資訊頁可直接發布文章（登入後）
- 文章 CRUD（新增/編輯/刪除/查詢）
- 球員資料頁（免費 TheSportsDB API）
- 網站設定讀寫
- 社群牆貼文與留言（輪詢更新）
- 足球選手資料代理（透過後端呼叫免費 TheSportsDB API）

## 本機啟動

1. 安裝套件

```bash
npm install
```

2. 啟動後端

```bash
npm start
```

3. 開啟前端頁面（建議用 Live Server）

- 前端預設會打 http://localhost:3000/api

## Render 部署後端

專案已提供 render.yaml，可直接從 GitHub 匯入。

### 必填環境變數

- JWT_SECRET：JWT 簽章密鑰
- ADMIN_EMAIL：管理員帳號
- ADMIN_PASSWORD：管理員密碼

### 選填

- THESPORTSDB_API_KEY：TheSportsDB API Key（預設使用免費 key `3`）
- ALLOW_PUBLIC_SIGNUP：是否開放 admin.html 公開註冊（預設 true）

## 前端串接 Render API

部署後，請把 api-config.js 裡的：

- https://YOUR-RENDER-SERVICE.onrender.com/api

改成你的 Render 服務 URL。

## 注意事項

- server/db.json 適合開發與測試，若用於正式環境，建議改接 Render Postgres。
- 聊天室目前為輪詢模式（每 3 秒抓新訊息）。
