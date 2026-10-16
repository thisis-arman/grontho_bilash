import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../redux/api/baseApi";
import authReducer from "../redux/features/auth/authSlice";
import cartReducer from "../redux/features/cart/cartSlice";
import ThemeProvider from "../theme/ThemeProvider";
import MainLayout from "../components/layouts/MainLayout";
import Home from "../pages/home/Home";

// Renders the home page to HTML at build time (scripts/prerender.mjs), so
// visitors and search engines see the page before any JavaScript has run.
// It is the guest view: no login, an empty bag, the default (night) theme.
// main.tsx swaps it for the live app as soon as React is ready.
export const render = (url = "/") => {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      cart: cartReducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
  });

  return renderToString(
    <Provider store={store}>
      <ThemeProvider>
        <StaticRouter location={url}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </StaticRouter>
      </ThemeProvider>
    </Provider>
  );
};
