const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-render';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || '';

app.use(cors());
app.use(express.json());

const adapter = new JSONFile('server/db.json');
const db = new Low(adapter, {
    admins: [],
    settings: {
        siteName: '庭寬的足球小窩',
        siteDescription: '探索足球的歷史、技術與激情',
        contactEmail: 'info@footballworld.com',
        contactPhone: '+886-2-XXXX-XXXX',
        contactAddress: '台灣，台北市'
    },
    articles: [],
    chatMessages: []
});

function issueToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name || '' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: '未登入' });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ error: '登入已過期，請重新登入' });
    }
}

async function ensureDefaultAdmin() {
    const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123456';

    if (!db.data.admins.find((admin) => admin.email === email)) {
        const passwordHash = await bcrypt.hash(password, 10);
        db.data.admins.push({
            id: nanoid(),
            email,
            passwordHash,
            name: 'Admin'
        });
        await db.write();
        console.log('Created default admin:', email);
    }
}

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res) => {
    const { email = '', password = '' } = req.body || {};
    const normalizedEmail = email.toLowerCase().trim();
    const admin = db.data.admins.find((item) => item.email === normalizedEmail);

    if (!admin) {
        return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    const token = issueToken(admin);
    return res.json({
        token,
        user: {
            id: admin.id,
            email: admin.email,
            name: admin.name || 'Admin'
        }
    });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ user: req.user });
});

app.post('/api/auth/logout', (_req, res) => {
    res.json({ ok: true });
});

app.get('/api/articles', (_req, res) => {
    const sorted = [...db.data.articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
});

app.get('/api/articles/:id', (req, res) => {
    const article = db.data.articles.find((item) => item.id === req.params.id);
    if (!article) {
        return res.status(404).json({ error: '找不到文章' });
    }
    return res.json(article);
});

app.post('/api/articles', requireAuth, async (req, res) => {
    const { title = '', content = '', category = '', imageUrl = '' } = req.body || {};

    if (!title.trim() || !content.trim() || !category.trim()) {
        return res.status(400).json({ error: '標題、內容、分類為必填' });
    }

    const article = {
        id: nanoid(),
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        imageUrl: imageUrl.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.data.articles.push(article);
    await db.write();
    return res.status(201).json(article);
});

app.put('/api/articles/:id', requireAuth, async (req, res) => {
    const article = db.data.articles.find((item) => item.id === req.params.id);

    if (!article) {
        return res.status(404).json({ error: '找不到文章' });
    }

    const { title = '', content = '', category = '', imageUrl = '' } = req.body || {};

    if (!title.trim() || !content.trim() || !category.trim()) {
        return res.status(400).json({ error: '標題、內容、分類為必填' });
    }

    article.title = title.trim();
    article.content = content.trim();
    article.category = category.trim();
    article.imageUrl = imageUrl.trim();
    article.updatedAt = new Date().toISOString();

    await db.write();
    return res.json(article);
});

app.delete('/api/articles/:id', requireAuth, async (req, res) => {
    const before = db.data.articles.length;
    db.data.articles = db.data.articles.filter((item) => item.id !== req.params.id);

    if (before === db.data.articles.length) {
        return res.status(404).json({ error: '找不到文章' });
    }

    await db.write();
    return res.json({ ok: true });
});

app.get('/api/settings', (_req, res) => {
    res.json(db.data.settings || {});
});

app.put('/api/settings', requireAuth, async (req, res) => {
    db.data.settings = {
        ...(db.data.settings || {}),
        ...(req.body || {}),
        updatedAt: new Date().toISOString()
    };
    await db.write();
    res.json(db.data.settings);
});

app.get('/api/chat/messages', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 100;
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const messages = db.data.chatMessages.slice(-safeLimit);
    res.json(messages);
});

app.post('/api/chat/messages', async (req, res) => {
    const { message = '', nickname = '訪客' } = req.body || {};
    if (!message.trim()) {
        return res.status(400).json({ error: '訊息不可為空' });
    }

    const chatMessage = {
        id: nanoid(),
        message: message.trim(),
        nickname: (nickname || '訪客').trim().slice(0, 24),
        createdAt: new Date().toISOString()
    };

    db.data.chatMessages.push(chatMessage);

    if (db.data.chatMessages.length > 500) {
        db.data.chatMessages = db.data.chatMessages.slice(-500);
    }

    await db.write();
    res.status(201).json(chatMessage);
});

app.get('/api/players', async (req, res) => {
    if (!FOOTBALL_API_KEY) {
        return res.json({ response: [] });
    }

    try {
        const season = req.query.season || '2024';
        const endpoint = `https://api.api-sports.io/v3/players?season=${encodeURIComponent(season)}`;
        const response = await fetch(endpoint, {
            headers: {
                'x-apisports-key': FOOTBALL_API_KEY
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: '外部足球 API 請求失敗' });
        }

        const data = await response.json();
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ error: '讀取足球 API 失敗' });
    }
});

async function start() {
    await db.read();
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
        console.log(`API server listening on port ${PORT}`);
    });
}

start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
