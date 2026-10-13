const productionUrl = 'https://grontho-bilash-server.vercel.app';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(window.location.hostname);

export const API_BASE_URL = isLocal ? `http://${window.location.hostname}:5000/api/v1` : `${productionUrl}/api/v1`;
