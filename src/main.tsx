import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@cake-admin/cakeand/cakeand.css";
import "./theme.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
