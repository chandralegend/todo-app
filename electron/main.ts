import { app, BrowserWindow, shell, ipcMain } from "electron";
import path from "node:path";
import { ensureDatabase, getDatabaseUrl } from "./database";
import { startCronScheduler, stopCronScheduler } from "./cron";
import { startServer, stopServer } from "./server";
import { setupMenu } from "./menu";

const isDev = !app.isPackaged;
const DEV_URL = "http://localhost:3000";

let mainWindow: BrowserWindow | null = null;
let serverUrl: string = DEV_URL;

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
    backgroundColor: "#F5F3EF", // Match app background to avoid white flash
  });

  // Show window once the page is loaded to avoid flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Fallback: if ready-to-show doesn't fire within 5s, show anyway
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log("[electron] Timeout waiting for ready-to-show, showing window");
      mainWindow.show();
    }
  }, 5000);

  // Handle page load failures — retry after a short delay
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`[electron] Page failed to load: ${errorCode} ${errorDescription}`);
    // Retry loading after 2 seconds
    setTimeout(() => {
      console.log("[electron] Retrying page load...");
      mainWindow?.loadURL(serverUrl);
    }, 2000);
  });

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Load the app URL (set during initialization)
  mainWindow.loadURL(serverUrl);

  if (isDev) {
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------- IPC Handlers ----------

// Return app version to renderer
ipcMain.handle("get-app-version", () => app.getVersion());

// Window control IPC (for custom titlebar if needed)
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on("window-close", () => mainWindow?.close());

// ---------- App Lifecycle ----------

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

// Clean up cron and server on quit
app.on("will-quit", () => {
  stopCronScheduler();
  stopServer();
});

// ---------- Initialization ----------

app.whenReady().then(async () => {
  // 1. Ensure database exists and migrations are applied
  //    Sets DATABASE_URL env var for the Next.js process
  ensureDatabase();

  console.log(`[electron] DATABASE_URL = ${getDatabaseUrl()}`);

  // 2. Set up native window menu (before server — menu is instant)
  setupMenu();

  // 3. Start the embedded Next.js server (production only)
  //    In dev mode, this returns http://localhost:3000 immediately
  try {
    serverUrl = await startServer();
    console.log(`[electron] Server URL = ${serverUrl}`);
  } catch (error) {
    console.error("[electron] Failed to start server:", error);
    // Continue anyway — window will show error and retry
  }

  // 4. Create the main window
  createWindow();

  // 5. Start cron scheduler for recurring task generation
  startCronScheduler();
});
