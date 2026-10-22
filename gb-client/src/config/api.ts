const productionUrl = 'https://grontho-bilash-server.vercel.app';
// `window` is missing while the home page is pre-rendered at build time.
const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(hostname);

// VITE_API_BASE_URL (optional) points a local build at another API, e.g. a test server.
const override = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Vercel preview builds call the API through the site's own /api-proxy
// rewrite (vercel.json), so previews work without being added to the API's
// CORS list. Production calls the API directly, as before.
declare const __VERCEL_PREVIEW__: boolean | undefined;
const isPreview = typeof __VERCEL_PREVIEW__ !== "undefined" && __VERCEL_PREVIEW__;

export const API_BASE_URL =
  override || (isLocal ? `http://${hostname}:5000/api/v1` : isPreview ? "/api-proxy/v1" : `${productionUrl}/api/v1`);
