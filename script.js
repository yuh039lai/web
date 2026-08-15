// ===== DOM 加載完成後執行 =====
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavigation();
    initContactForm();
    addSmoothScrolling();
});

// ===== 導航功能 =====
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 移除所有 active 類
            navLinks.forEach(l => l.classList.remove('active'));
            // 添加 active 類到被點擊的連結
            this.classList.add('active');
        });
    });

    // 設置當前頁面的導航鏈接為活躍
    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== 聯絡表格功能 =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 獲取表格數據
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // 驗證表格
            if (!validateForm(data)) {
                showFormMessage('請填寫所有必填字段', 'error');
                return;
            }
            
            // 模擬發送表格（在實際應用中，這裡會發送到服務器）
            sendForm(data);
        });
    }
}

function validateForm(data) {
    // 檢查所有字段是否已填寫
    for (let field in data) {
        if (!data[field].trim()) {
            return false;
        }
    }
    
    // 驗證郵箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showFormMessage('請輸入有效的電子郵件地址', 'error');
        return false;
    }
    
    return true;
}

function sendForm(data) {
    // 顯示發送中的消息
    showFormMessage('正在發送訊息...', 'info');
    
    // 模擬異步請求（實際應用中會發送到服務器）
    setTimeout(() => {
        // 成功發送
        showFormMessage('感謝您的訊息！我們將盡快回覆您。', 'success');
        
        // 清除表格
        document.getElementById('contactForm').reset();
        
        // 在 3 秒後隱藏消息
        setTimeout(() => {
            hideFormMessage();
        }, 3000);
    }, 1500);
}

function showFormMessage(message, type) {
    const messageElement = document.getElementById('formMessage');
    
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';
    }
}

function hideFormMessage() {
    const messageElement = document.getElementById('formMessage');
    
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

// ===== 平滑滾動 =====
function addSmoothScrolling() {
    // 為所有內部鏈接添加平滑滾動效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== 頁面加載動畫 =====
window.addEventListener('load', function() {
    // 添加頁面加載完成的視覺反饋
    document.body.style.opacity = '1';
    
    // 記錄頁面加載
    console.log('頁面加載完成！');
});

// ===== 實用工具函數 =====

// 獲取當前日期
function getCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('zh-TW', options);
}

// 格式化日期
function formatDate(date) {
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 檢查元素是否在視口中
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 延遲執行函數
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// ===== 調試日誌 =====
console.log('庭寬的足球小窩網站已加載！');
console.log('當前頁面：', window.location.pathname);
