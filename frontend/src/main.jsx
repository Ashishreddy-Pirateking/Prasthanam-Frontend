import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "./index.css";
import "./Legacy/style.css";
import "./Legacy/gallery.css";
import "./ticket-overrides.css";
import App from "./App.jsx";
import { SiteContentProvider } from "./context/SiteContentContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SiteContentProvider>
      <App />
    </SiteContentProvider>
  </StrictMode>
);
