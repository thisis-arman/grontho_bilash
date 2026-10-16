const productionUrl = 'https://grontho-bilash-server.vercel.app';
// `window` is missing while the home page is pre-rendered at build time.
const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(hostname);

export const API_BASE_URL = isLocal ? `http://${hostname}:5000/api/v1` : `${productionUrl}/api/v1`;
