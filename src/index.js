import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import "core-js";

import App from "./App";
import store from "./store";
import { AuthContextProvider } from "./context/authContext";

// 👇 Thêm import từ tanstack/react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 👇 Tạo 1 instance queryClient (dùng chung cho toàn app)
const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <AuthContextProvider>
          {/* 👇 Bọc thêm QueryClientProvider */}
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AuthContextProvider>
      </HashRouter>
    </Provider>
  </React.StrictMode>
);
