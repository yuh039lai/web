(function () {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const defaultBase = isLocal
        ? 'http://localhost:3000/api'
        : 'https://web-k171.onrender.com/api';

    const urlParams = new URLSearchParams(window.location.search);
    const queryOverride = urlParams.get('apiBaseUrl');
    const localOverride = localStorage.getItem('API_BASE_URL_OVERRIDE');

    window.API_BASE_URL = queryOverride || localOverride || defaultBase;
})();
