// API 工具函數

const AUTH_TOKEN_KEY = 'ADMIN_AUTH_TOKEN';

function getApiBaseUrl() {
    if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.trim()) {
        return window.API_BASE_URL.replace(/\/$/, '');
    }
    return 'http://localhost:3000/api';
}

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setAuthToken(token) {
    if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }
}

async function apiRequest(path, options = {}, authRequired = false) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (authRequired) {
        const token = getAuthToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        headers
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(payload?.error || '請求失敗');
    }

    return payload;
}

async function loginUser(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    setAuthToken(data.token);
    return data.user;
}

async function logoutUser() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' }, true);
    } finally {
        setAuthToken('');
    }
}

async function getCurrentUser() {
    const token = getAuthToken();
    if (!token) {
        return null;
    }

    try {
        const data = await apiRequest('/auth/me', { method: 'GET' }, true);
        return data.user || null;
    } catch (error) {
        setAuthToken('');
        return null;
    }
}

async function getArticles() {
    try {
        return await apiRequest('/articles', { method: 'GET' });
    } catch (error) {
        console.error('獲取文章失敗:', error);
        return [];
    }
}

async function getArticle(id) {
    try {
        return await apiRequest(`/articles/${encodeURIComponent(id)}`, { method: 'GET' });
    } catch (error) {
        console.error('獲取文章失敗:', error);
        return null;
    }
}

async function addArticle(title, content, category, imageUrl) {
    const article = await apiRequest('/articles', {
        method: 'POST',
        body: JSON.stringify({ title, content, category, imageUrl })
    }, true);
    return article.id;
}

async function updateArticle(id, title, content, category, imageUrl) {
    await apiRequest(`/articles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, category, imageUrl })
    }, true);
}

async function deleteArticle(id) {
    await apiRequest(`/articles/${encodeURIComponent(id)}`, {
        method: 'DELETE'
    }, true);
}

async function getSettings() {
    try {
        return await apiRequest('/settings', { method: 'GET' });
    } catch (error) {
        console.error('獲取設定失敗:', error);
        return null;
    }
}

async function updateSettings(data) {
    await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
    }, true);
}

async function getFootballPlayers() {
    try {
        const data = await apiRequest('/players?season=2024', { method: 'GET' });
        return data.response || [];
    } catch (error) {
        console.error('獲取足球選手失敗:', error);
        return [];
    }
}

async function signInAsGuest() {
    return {
        uid: `guest_${Date.now()}`,
        nickname: localStorage.getItem('chatNickname') || '訪客'
    };
}

function listenToChatMessages(onMessages, onError) {
    let active = true;

    const loadMessages = async () => {
        if (!active) {
            return;
        }

        try {
            const messages = await apiRequest('/chat/messages?limit=100', { method: 'GET' });
            onMessages(messages || []);
        } catch (error) {
            if (typeof onError === 'function') {
                onError(error);
            }
        }
    };

    loadMessages();
    const timer = setInterval(loadMessages, 3000);

    return () => {
        active = false;
        clearInterval(timer);
    };
}

async function sendChatMessage(message, nickname) {
    await apiRequest('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message, nickname })
    });
}

async function uploadImage(_file) {
    throw new Error('目前後端尚未實作圖片上傳');
}

async function initializeSampleData() {
    return;
}
