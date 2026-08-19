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
const THESPORTSDB_API_KEY = process.env.THESPORTSDB_API_KEY || '3';
const ALLOW_PUBLIC_SIGNUP = (process.env.ALLOW_PUBLIC_SIGNUP || 'true').toLowerCase() === 'true';

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
    chatMessages: [],
    communityPosts: []
});

const LEAGUE_NAME_MAP = {
    premier_league: 'English Premier League',
    la_liga: 'Spanish La Liga',
    serie_a: 'Italian Serie A',
    bundesliga: 'German Bundesliga'
};

const PLAYER_QUERY_ALIASES = {
    '姆巴佩': 'Kylian Mbappe',
    '姆巴配': 'Kylian Mbappe',
    '麥巴比': 'Kylian Mbappe',
    '梅西': 'Lionel Messi',
    'C羅': 'Cristiano Ronaldo',
    'c羅': 'Cristiano Ronaldo',
    '哈蘭': 'Erling Haaland',
    '哈兰德': 'Erling Haaland',
    '孫興慜': 'Heung-min Son',
    '贝林厄姆': 'Jude Bellingham'
};

const FALLBACK_PLAYERS = [
    { id: 'fb1', name: 'Lionel Messi', team: 'Inter Miami', nationality: 'Argentina', position: 'Forward', number: '10', birthDate: '1987-06-24', height: '170 cm', weight: '72 kg', cutout: '', thumb: '', render: '', description: 'One of the greatest footballers.', league: 'other' },
    { id: 'fb2', name: 'Cristiano Ronaldo', team: 'Al Nassr', nationality: 'Portugal', position: 'Forward', number: '7', birthDate: '1985-02-05', height: '187 cm', weight: '83 kg', cutout: '', thumb: '', render: '', description: 'Legendary goalscorer.', league: 'other' },
    { id: 'fb3', name: 'Bukayo Saka', team: 'Arsenal', nationality: 'England', position: 'Winger', number: '7', birthDate: '2001-09-05', height: '178 cm', weight: '72 kg', cutout: '', thumb: '', render: '', description: 'Key Arsenal attacker.', league: 'premier_league' },
    { id: 'fb4', name: 'Martin Odegaard', team: 'Arsenal', nationality: 'Norway', position: 'Midfielder', number: '8', birthDate: '1998-12-17', height: '178 cm', weight: '68 kg', cutout: '', thumb: '', render: '', description: 'Creative midfield captain.', league: 'premier_league' },
    { id: 'fb5', name: 'Erling Haaland', team: 'Manchester City', nationality: 'Norway', position: 'Forward', number: '9', birthDate: '2000-07-21', height: '194 cm', weight: '88 kg', cutout: '', thumb: '', render: '', description: 'Powerful striker.', league: 'premier_league' },
    { id: 'fb6', name: 'Kevin De Bruyne', team: 'Manchester City', nationality: 'Belgium', position: 'Midfielder', number: '17', birthDate: '1991-06-28', height: '181 cm', weight: '70 kg', cutout: '', thumb: '', render: '', description: 'Elite playmaker.', league: 'premier_league' },
    { id: 'fb7', name: 'Mohamed Salah', team: 'Liverpool', nationality: 'Egypt', position: 'Forward', number: '11', birthDate: '1992-06-15', height: '175 cm', weight: '71 kg', cutout: '', thumb: '', render: '', description: 'Liverpool star winger.', league: 'premier_league' },
    { id: 'fb8', name: 'Virgil van Dijk', team: 'Liverpool', nationality: 'Netherlands', position: 'Defender', number: '4', birthDate: '1991-07-08', height: '195 cm', weight: '92 kg', cutout: '', thumb: '', render: '', description: 'Dominant centre-back.', league: 'premier_league' },
    { id: 'fb9', name: 'Jude Bellingham', team: 'Real Madrid', nationality: 'England', position: 'Midfielder', number: '5', birthDate: '2003-06-29', height: '186 cm', weight: '75 kg', cutout: '', thumb: '', render: '', description: 'Dynamic midfielder.', league: 'la_liga' },
    { id: 'fb9b', name: 'Kylian Mbappe', team: 'Real Madrid', nationality: 'France', position: 'Forward', number: '9', birthDate: '1998-12-20', height: '178 cm', weight: '75 kg', cutout: '', thumb: '', render: '', description: 'World-class French forward.', league: 'la_liga' },
    { id: 'fb10', name: 'Vinicius Junior', team: 'Real Madrid', nationality: 'Brazil', position: 'Forward', number: '7', birthDate: '2000-07-12', height: '176 cm', weight: '73 kg', cutout: '', thumb: '', render: '', description: 'Explosive dribbler.', league: 'la_liga' },
    { id: 'fb11', name: 'Robert Lewandowski', team: 'Barcelona', nationality: 'Poland', position: 'Forward', number: '9', birthDate: '1988-08-21', height: '185 cm', weight: '81 kg', cutout: '', thumb: '', render: '', description: 'Clinical finisher.', league: 'la_liga' },
    { id: 'fb12', name: 'Pedri', team: 'Barcelona', nationality: 'Spain', position: 'Midfielder', number: '8', birthDate: '2002-11-25', height: '174 cm', weight: '60 kg', cutout: '', thumb: '', render: '', description: 'Talented young midfielder.', league: 'la_liga' },
    { id: 'fb13', name: 'Lautaro Martinez', team: 'Inter', nationality: 'Argentina', position: 'Forward', number: '10', birthDate: '1997-08-22', height: '174 cm', weight: '72 kg', cutout: '', thumb: '', render: '', description: 'Inter captain and scorer.', league: 'serie_a' },
    { id: 'fb14', name: 'Nicolo Barella', team: 'Inter', nationality: 'Italy', position: 'Midfielder', number: '23', birthDate: '1997-02-07', height: '172 cm', weight: '68 kg', cutout: '', thumb: '', render: '', description: 'Energetic central midfielder.', league: 'serie_a' },
    { id: 'fb15', name: 'Rafael Leao', team: 'AC Milan', nationality: 'Portugal', position: 'Forward', number: '10', birthDate: '1999-06-10', height: '188 cm', weight: '81 kg', cutout: '', thumb: '', render: '', description: 'Fast winger for Milan.', league: 'serie_a' },
    { id: 'fb16', name: 'Dusan Vlahovic', team: 'Juventus', nationality: 'Serbia', position: 'Forward', number: '9', birthDate: '2000-01-28', height: '190 cm', weight: '84 kg', cutout: '', thumb: '', render: '', description: 'Strong striker.', league: 'serie_a' },
    { id: 'fb17', name: 'Harry Kane', team: 'Bayern Munich', nationality: 'England', position: 'Forward', number: '9', birthDate: '1993-07-28', height: '188 cm', weight: '86 kg', cutout: '', thumb: '', render: '', description: 'Top English striker.', league: 'bundesliga' },
    { id: 'fb18', name: 'Jamal Musiala', team: 'Bayern Munich', nationality: 'Germany', position: 'Midfielder', number: '42', birthDate: '2003-02-26', height: '184 cm', weight: '72 kg', cutout: '', thumb: '', render: '', description: 'Creative attacking midfielder.', league: 'bundesliga' },
    { id: 'fb19', name: 'Marco Reus', team: 'Borussia Dortmund', nationality: 'Germany', position: 'Midfielder', number: '11', birthDate: '1989-05-31', height: '180 cm', weight: '71 kg', cutout: '', thumb: '', render: '', description: 'Dortmund icon.', league: 'bundesliga' },
    { id: 'fb20', name: 'Florian Wirtz', team: 'Bayer Leverkusen', nationality: 'Germany', position: 'Midfielder', number: '10', birthDate: '2003-05-03', height: '177 cm', weight: '70 kg', cutout: '', thumb: '', render: '', description: 'Rising Bundesliga star.', league: 'bundesliga' }
];

function normalizeText(value = '') {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function resolvePlayerSearch(search = '') {
    const raw = String(search || '').trim();
    if (!raw) {
        return '';
    }

    const direct = PLAYER_QUERY_ALIASES[raw];
    if (direct) {
        return direct;
    }

    const normalized = normalizeText(raw);
    for (const [alias, mapped] of Object.entries(PLAYER_QUERY_ALIASES)) {
        if (normalizeText(alias) === normalized) {
            return mapped;
        }
    }

    return raw;
}

function ensureDataShape() {
    const defaults = {
        siteName: '庭寬的足球小窩',
        siteDescription: '探索足球的歷史、技術與激情',
        contactEmail: 'info@footballworld.com',
        contactPhone: '+886-2-XXXX-XXXX',
        contactAddress: '台灣，台北市',
        pageContent: {
            aboutIntro: '歡迎來到庭寬的足球小窩！這裡是我分享足球想法、喜愛球員和精彩比賽的地方。',
            favoriteTeam: 'Arsenal F.C.（兵工廠／阿森納）',
            siteAbout: '庭寬的足球小窩是我的個人足球網站。希望你可以在這裡找到喜歡的內容，歡迎一起分享足球。',
            discordId: '待填寫你的 Discord ID',
            instagramId: '待填寫你的 IG ID'
        },
        playerNicknames: {}
    };

    db.data = db.data || {};
    db.data.admins = Array.isArray(db.data.admins) ? db.data.admins : [];
    db.data.settings = {
        ...defaults,
        ...(db.data.settings || {}),
        pageContent: {
            ...defaults.pageContent,
            ...((db.data.settings || {}).pageContent || {})
        },
        playerNicknames: {
            ...defaults.playerNicknames,
            ...((db.data.settings || {}).playerNicknames || {})
        }
    };
    db.data.articles = Array.isArray(db.data.articles) ? db.data.articles : [];
    db.data.chatMessages = Array.isArray(db.data.chatMessages) ? db.data.chatMessages : [];
    db.data.communityPosts = Array.isArray(db.data.communityPosts) ? db.data.communityPosts : [];
}

function issueToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name || '' },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function normalizeEmail(value = '') {
    return String(value).toLowerCase().trim();
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
    const normalizedEmail = normalizeEmail(email);
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

app.post('/api/auth/register', async (req, res) => {
    if (!ALLOW_PUBLIC_SIGNUP) {
        return res.status(403).json({ error: '目前未開放註冊，請聯絡管理員' });
    }

    const { name = '', email = '', password = '' } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = String(name).trim();

    if (!trimmedName) {
        return res.status(400).json({ error: '請輸入名稱' });
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return res.status(400).json({ error: '請輸入有效的電子郵件' });
    }

    if (String(password).length < 8) {
        return res.status(400).json({ error: '密碼至少需要 8 碼' });
    }

    const exists = db.data.admins.some((item) => item.email === normalizedEmail);
    if (exists) {
        return res.status(409).json({ error: '此電子郵件已註冊' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        id: nanoid(),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash
    };

    db.data.admins.push(user);
    await db.write();

    const token = issueToken(user);
    return res.status(201).json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
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
        authorName: req.user?.name || req.user?.email || '站內作者',
        authorEmail: req.user?.email || '',
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

app.get('/api/community/posts', (_req, res) => {
    const posts = [...db.data.communityPosts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((post) => ({
            ...post,
            comments: Array.isArray(post.comments)
                ? [...post.comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                : []
        }));

    res.json(posts);
});

app.post('/api/community/posts', async (req, res) => {
    const { nickname = '訪客', title = '', content = '' } = req.body || {};

    if (!String(title).trim() || !String(content).trim()) {
        return res.status(400).json({ error: '標題與內容皆為必填' });
    }

    const post = {
        id: nanoid(),
        nickname: String(nickname || '訪客').trim().slice(0, 24),
        title: String(title).trim().slice(0, 120),
        content: String(content).trim().slice(0, 2000),
        createdAt: new Date().toISOString(),
        comments: []
    };

    db.data.communityPosts.push(post);
    await db.write();
    res.status(201).json(post);
});

app.post('/api/community/posts/:postId/comments', async (req, res) => {
    const { nickname = '訪客', content = '' } = req.body || {};
    const post = db.data.communityPosts.find((item) => item.id === req.params.postId);

    if (!post) {
        return res.status(404).json({ error: '找不到貼文' });
    }

    if (!String(content).trim()) {
        return res.status(400).json({ error: '留言內容不可為空' });
    }

    post.comments = Array.isArray(post.comments) ? post.comments : [];

    const comment = {
        id: nanoid(),
        nickname: String(nickname || '訪客').trim().slice(0, 24),
        content: String(content).trim().slice(0, 500),
        createdAt: new Date().toISOString()
    };

    post.comments.push(comment);
    await db.write();
    res.status(201).json(comment);
});

app.get('/api/players', async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const resolvedSearch = resolvePlayerSearch(search);
        const team = String(req.query.team || '').trim();
        const league = String(req.query.league || '').trim();
        const nationality = String(req.query.nationality || '').trim();
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize, 10) || 12, 1), 30);
        const key = encodeURIComponent(THESPORTSDB_API_KEY);

        async function fetchPlayers(endpoint) {
            const response = await fetch(endpoint);
            if (!response.ok) {
                return [];
            }
            let data = { player: [] };
            try {
                data = await response.json();
            } catch (error) {
                data = { player: [] };
            }
            return Array.isArray(data.player) ? data.player : [];
        }

        async function fetchTeamPlayersByTeamName(teamName) {
            const teamEndpoint = `https://www.thesportsdb.com/api/v1/json/${key}/searchteams.php?t=${encodeURIComponent(teamName)}`;
            const teamResponse = await fetch(teamEndpoint);
            if (!teamResponse.ok) {
                return [];
            }

            let teamData = { teams: [] };
            try {
                teamData = await teamResponse.json();
            } catch (error) {
                teamData = { teams: [] };
            }

            const teamId = teamData?.teams?.[0]?.idTeam;
            if (!teamId) {
                return [];
            }

            const playerEndpoint = `https://www.thesportsdb.com/api/v1/json/${key}/lookup_all_players.php?id=${encodeURIComponent(teamId)}`;
            const playerResponse = await fetch(playerEndpoint);
            if (!playerResponse.ok) {
                return [];
            }

            let playerData = { player: [] };
            try {
                playerData = await playerResponse.json();
            } catch (error) {
                playerData = { player: [] };
            }

            return Array.isArray(playerData.player) ? playerData.player : [];
        }

        let rawPlayers = [];

        if (team) {
            rawPlayers = await fetchTeamPlayersByTeamName(team);
        } else if (league && LEAGUE_NAME_MAP[league]) {
            const leagueName = LEAGUE_NAME_MAP[league];
            const leagueTeamsEndpoint = `https://www.thesportsdb.com/api/v1/json/${key}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
            const teamResponse = await fetch(leagueTeamsEndpoint);

            if (teamResponse.ok) {
                let teamData = { teams: [] };
                try {
                    teamData = await teamResponse.json();
                } catch (error) {
                    teamData = { teams: [] };
                }

                const teams = Array.isArray(teamData.teams) ? teamData.teams.slice(0, 8) : [];
                const list = await Promise.all(
                    teams.map((teamItem) => fetchTeamPlayersByTeamName(teamItem.strTeam))
                );
                rawPlayers = list.flat();
            }
        } else {
            const query = resolvedSearch || 'Messi';
            const endpoint = `https://www.thesportsdb.com/api/v1/json/${key}/searchplayers.php?p=${encodeURIComponent(query)}`;
            rawPlayers = await fetchPlayers(endpoint);
        }

        const uniqueMap = new Map();
        rawPlayers.forEach((item) => {
            if (item.idPlayer && !uniqueMap.has(item.idPlayer)) {
                uniqueMap.set(item.idPlayer, item);
            }
        });

        let players = [...uniqueMap.values()].map((item) => ({
                id: item.idPlayer,
                name: item.strPlayer,
                team: item.strTeam,
                nationality: item.strNationality,
                position: item.strPosition,
                number: item.strNumber,
                birthDate: item.dateBorn,
                height: item.strHeight,
                weight: item.strWeight,
                cutout: item.strCutout,
                thumb: item.strThumb,
                render: item.strRender,
                description: item.strDescriptionEN || item.strDescriptionCN || item.strDescriptionDE || '',
                league
            }));

        if (!players.length) {
            players = [...FALLBACK_PLAYERS];
        }

        if (search) {
            const kw = normalizeText(resolvedSearch || search);
            players = players.filter((item) => normalizeText(item.name || '').includes(kw));
        }

        if (nationality) {
            const nation = nationality.toLowerCase();
            players = players.filter((item) => String(item.nationality || '').toLowerCase().includes(nation));
        }

        if (team) {
            const teamKw = team.toLowerCase();
            players = players.filter((item) => String(item.team || '').toLowerCase().includes(teamKw));
        }

        if (league) {
            players = players.filter((item) => String(item.league || '').toLowerCase() === league.toLowerCase());
        }

        const total = players.length;
        const start = (page - 1) * pageSize;
        const paged = players.slice(start, start + pageSize);

        return res.json({
            source: 'TheSportsDB',
            players: paged,
            pagination: {
                page,
                pageSize,
                total,
                hasMore: start + pageSize < total
            }
        });
    } catch (error) {
        return res.status(500).json({ error: '讀取球員資料失敗' });
    }
});

async function start() {
    await db.read();
    ensureDataShape();
    await db.write();
    await ensureDefaultAdmin();

    app.listen(PORT, () => {
        console.log(`API server listening on port ${PORT}`);
    });
}

start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
