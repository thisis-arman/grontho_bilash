import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import router from './routes/route';
import { RouterProvider } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { initInstall } from './pwa/install';

// Service worker + "install app" support (see src/pwa/install.ts).
initInstall();

const host = document.getElementById('root')!;

// The home page arrives pre-rendered (scripts/prerender.mjs) so it paints
// before this bundle loads. React renders the live app into a hidden
// container next to it and swaps the two in one frame once the saved
// login and bag have been restored, so there is no blank flash.
const snapshot = host.querySelector<HTMLElement>('[data-prerendered]');
let container = host;
if (snapshot) {
  container = document.createElement('div');
  container.hidden = true;
  host.appendChild(container);
}

const ReplaceSnapshot = () => {
  useLayoutEffect(() => {
    if (!snapshot) return;
    const swap = () => {
      // The hero's entrance animation already played on the snapshot.
      document.documentElement.classList.add('gb-live');
      snapshot.remove();
      container.hidden = false;
    };
    // Server-rendered pages (blog posts) keep their copy on screen until the
    // app's page has its data, so the reader never sees a loader in between.
    if (snapshot.hasAttribute('data-wait-ready')) {
      const fallback = window.setTimeout(swap, 8000);
      const onReady = () => {
        window.clearTimeout(fallback);
        // The post has already rendered (the event fires after commit).
        swap();
      };
      window.addEventListener('gb:page-ready', onReady, { once: true });
      return () => {
        window.clearTimeout(fallback);
        window.removeEventListener('gb:page-ready', onReady);
      };
    }
    swap();
  }, []);
  return null;
};

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
          <ReplaceSnapshot />
        </PersistGate>
      </ThemeProvider>
      <Analytics />
    </Provider>
  </React.StrictMode>
);
