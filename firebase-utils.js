// Firebase 工具函數

// 登入
async function loginUser(email, password) {
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        console.log('登入成功:', result.user.email);
        return result.user;
    } catch (error) {
        console.error('登入失敗:', error.message);
        throw error;
    }
}

// 登出
async function logoutUser() {
    try {
        await firebase.auth().signOut();
        console.log('已登出');
    } catch (error) {
        console.error('登出失敗:', error.message);
        throw error;
    }
}

// 獲取當前使用者
function getCurrentUser() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(user => {
            resolve(user);
        });
    });
}

// 獲取所有文章
async function getArticles() {
    try {
        const snapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('獲取文章失敗:', error);
        return [];
    }
}

// 獲取單篇文章
async function getArticle(id) {
    try {
        const doc = await db.collection('articles').doc(id).get();
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('獲取文章失敗:', error);
        return null;
    }
}

// 新增文章
async function addArticle(title, content, category, imageUrl) {
    try {
        const docRef = await db.collection('articles').add({
            title: title,
            content: content,
            category: category,
            imageUrl: imageUrl,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('文章已新增:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('新增文章失敗:', error);
        throw error;
    }
}

// 更新文章
async function updateArticle(id, title, content, category, imageUrl) {
    try {
        await db.collection('articles').doc(id).update({
            title: title,
            content: content,
            category: category,
            imageUrl: imageUrl,
            updatedAt: new Date()
        });
        console.log('文章已更新:', id);
    } catch (error) {
        console.error('更新文章失敗:', error);
        throw error;
    }
}

// 刪除文章
async function deleteArticle(id) {
    try {
        await db.collection('articles').doc(id).delete();
        console.log('文章已刪除:', id);
    } catch (error) {
        console.error('刪除文章失敗:', error);
        throw error;
    }
}

// 獲取網站設定
async function getSettings() {
    try {
        const doc = await db.collection('settings').doc('config').get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('獲取設定失敗:', error);
        return null;
    }
}

// 更新網站設定
async function updateSettings(data) {
    try {
        await db.collection('settings').doc('config').set(data, { merge: true });
        console.log('設定已更新');
    } catch (error) {
        console.error('更新設定失敗:', error);
        throw error;
    }
}

// 獲取足球選手資料（從外部 API）
async function getFootballPlayers() {
    try {
        // 這裡使用免費的足球 API
        // 你可以替換為其他足球 API
        const response = await fetch('https://api.api-sports.io/v3/players?season=2024', {
            headers: {
                'x-apisports-key': 'YOUR_API_KEY' // 需要在 api-sports.io 註冊
            }
        });
        const data = await response.json();
        return data.response || [];
    } catch (error) {
        console.error('獲取足球選手失敗:', error);
        return [];
    }
}

// 以匿名使用者身分登入聊天室
async function signInAsGuest() {
    const result = await firebase.auth().signInAnonymously();
    return result.user;
}

// 即時監聽聊天室訊息
function listenToChatMessages(onMessages, onError) {
    return db.collection('chatMessages')
        .orderBy('createdAt', 'asc')
        .limitToLast(100)
        .onSnapshot(snapshot => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            onMessages(messages);
        }, onError);
}

// 發送聊天室訊息
async function sendChatMessage(message, nickname) {
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error('尚未完成訪客登入');
    }

    await db.collection('chatMessages').add({
        message: message,
        nickname: nickname || '訪客',
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// 上傳圖片到 Firebase Storage
async function uploadImage(file) {
    try {
        const timestamp = new Date().getTime();
        const fileName = `images/${timestamp}_${file.name}`;
        const storageRef = firebase.storage().ref(fileName);
        
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        
        console.log('圖片已上傳:', url);
        return url;
    } catch (error) {
        console.error('上傳圖片失敗:', error);
        throw error;
    }
}

// 初始化範例資料
async function initializeSampleData() {
    try {
        // 檢查是否已有資料
        const settingsDoc = await db.collection('settings').doc('config').get();
        if (settingsDoc.exists) {
            console.log('資料已存在，跳過初始化');
            return;
        }

        // 創建初始設定
        await db.collection('settings').doc('config').set({
            siteName: '庭寬的足球小窩',
            siteDescription: '探索足球的歷史、技術與激情',
            contactEmail: 'info@footballworld.com',
            contactPhone: '+886-2-XXXX-XXXX',
            contactAddress: '台灣，台北市',
            updatedAt: new Date()
        });

        // 創建初始文章
        await db.collection('articles').add({
            title: '足球：世界上最美妙的遊戲',
            content: '足球，被稱為"世界上最美妙的遊戲"，是全球最受歡迎的運動...',
            category: '足球知識',
            imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('範例資料已初始化');
    } catch (error) {
        console.error('初始化範例資料失敗:', error);
    }
}
