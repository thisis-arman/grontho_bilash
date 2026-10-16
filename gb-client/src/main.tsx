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
    // The hero's entrance animation already played on the snapshot.
    document.documentElement.classList.add('gb-live');
    snapshot.remove();
    container.hidden = false;
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
