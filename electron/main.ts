import { app, BrowserWindow, shell } from "electron";
import path from "node:path";

const isDev = !app.isPackaged;
const DEV_URL = "http://localhost:3000";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: "TodoApp",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // Frameless look with native traffic lights on macOS
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false, // Don't show until ready
  });

  // Show window once the page is loaded to avoid flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // In production, load the standalone Next.js server
    // Phase D will set this up — for now, fall back to localhost
    mainWindow.loadURL(DEV_URL);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// macOS: re-create window when dock icon is clicked
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Create window when Electron is ready
app.whenReady().then(createWindow);
