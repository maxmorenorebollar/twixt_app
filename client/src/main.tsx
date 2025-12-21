import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import App from "./App.js";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1e88e5" },
    secondary: { main: "#ef4444" },
    background: {
      default: "#0b1021",
      paper: "#0f172a",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      '"Space Grotesk", "Inter", system-ui, -apple-system, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
