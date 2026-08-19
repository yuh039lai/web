# 庭寬的足球小窩 - Render 後端快速開始

這份快速指南讓你把網站前端放在 GitHub，後端 API 部署在 Render。

## 1. 本機啟動

```bash
cd C:\Users\G02\Desktop\yuh\web
npm install
npm start
```

後端會在 `http://localhost:3000` 提供 API。

## 2. 開前端頁面

- 建議用 VS Code Live Server 開 `index.html`
- 或用其他靜態伺服器開啟整個資料夾

前端預設會呼叫 `http://localhost:3000/api`。

## 3. 部署到 Render（後端）

1. 把專案推到 GitHub
2. 在 Render 選擇 `Blueprint` 匯入 repo
3. Render 會讀取 `render.yaml` 建立服務
4. 設定環境變數：

- `JWT_SECRET`（必填）
- `ADMIN_EMAIL`（必填）
- `ADMIN_PASSWORD`（必填）
- `FOOTBALL_API_KEY`（選填）

## 4. 連接前端到 Render API

修改 `api-config.js`：

- 將 `https://YOUR-RENDER-SERVICE.onrender.com/api`
- 改成你的 Render 實際網址

## 5. 管理員登入

- 打開 `admin.html`
- 使用 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 登入

## 備註

- `server/db.json` 為檔案型資料庫，適合開發/小型測試。
- 正式環境建議改用 Render Postgres 以避免資料遺失。
