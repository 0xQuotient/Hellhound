const { app, BrowserWindow, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const { serveStatic } = require("./static-server.cjs");

const DIST = path.join(__dirname, "..", "dist");
const DEV_SERVER = "http://localhost:5173";

let mainWindow;
let staticServer;
let appOrigin = DEV_SERVER;

async function resolveOrigin() {
  // Prefer the built bundle, served over loopback by an in-process static
  // server (a Vite ESM build cannot load over file:// — Chromium CORS-blocks
  // it). Fall back to the dev server only when there is no build.
  if (fs.existsSync(path.join(DIST, "index.html"))) {
    staticServer = await serveStatic(DIST);
    return staticServer.origin;
  }
  return DEV_SERVER;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "Hellhound",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Defence in depth: the renderer is a plain web page with no preload and
      // no Node access, so the OS-level sandbox costs nothing and contains it.
      sandbox: true,
    },
  });

  mainWindow.loadURL(appOrigin);

  // The tool is single-window and never navigates. Deny any attempt to open a
  // new window or steer the renderer off its own origin — so nothing in a
  // loaded corpus could drive the app somewhere. External links go to the OS
  // browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(appOrigin)) event.preventDefault();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  appOrigin = await resolveOrigin();
  createWindow();
});

app.on("window-all-closed", () => {
  if (staticServer) staticServer.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
