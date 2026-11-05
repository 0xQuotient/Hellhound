const { app, BrowserWindow, shell } = require("electron");

const APP_ORIGIN = "http://localhost:5173";

let mainWindow;

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

  mainWindow.loadURL(APP_ORIGIN);

  // The tool is single-window and never navigates. Deny any attempt to open a
  // new window or steer the renderer to another origin — so nothing in a loaded
  // corpus could drive the app somewhere. External links go to the OS browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_ORIGIN)) event.preventDefault();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
