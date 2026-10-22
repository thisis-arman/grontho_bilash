const productionUrl = 'https://grontho-bilash-server.vercel.app';
// `window` is missing while the home page is pre-rendered at build time.
const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(hostname);

// VITE_API_BASE_URL (optional) points a local build at another API, e.g. a test server.
const override = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = override || (isLocal ? `http://${hostname}:5000/api/v1` : `${productionUrl}/api/v1`);
