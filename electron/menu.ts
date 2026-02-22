import { app, Menu, shell, BrowserWindow } from "electron";

/**
 * Build and set the native application menu.
 * macOS: Full menu bar with App, Edit, View, Window, Help menus.
 * Windows/Linux: Edit, View, Window, Help menus.
 */
export function setupMenu(): void {
  const isMac = process.platform === "darwin";

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),

    // Edit menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" as const },
              { role: "delete" as const },
              { role: "selectAll" as const },
            ]
          : [
              { role: "delete" as const },
              { type: "separator" as const },
              { role: "selectAll" as const },
            ]),
      ],
    },

    // View menu
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },

    // Navigate menu
    {
      label: "Navigate",
      submenu: [
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            win?.webContents.loadURL(win.webContents.getURL().replace(/\/[^/]*$/, "/"));
          },
        },
        {
          label: "My Lists",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win) {
              const baseUrl = new URL(win.webContents.getURL()).origin;
              win.webContents.loadURL(`${baseUrl}/lists`);
            }
          },
        },
        {
          label: "Today's Focus",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            const win = BrowserWindow.getFocusedWindow();
            if (win) {
              const baseUrl = new URL(win.webContents.getURL()).origin;
              win.webContents.loadURL(`${baseUrl}/today`);
            }
          },
        },
      ],
    },

    // Window menu
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const },
            ]
          : [{ role: "close" as const }]),
      ],
    },

    // Help menu
    {
      role: "help",
      submenu: [
        {
          label: "About TodoApp",
          click: () => {
            shell.openExternal("https://github.com/chandralegend/todo-app");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
