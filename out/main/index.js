"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs-extra");
const dateFns = require("date-fns");
const accountCategories = [{ "id": "assets", "name": "Assets", "type": "asset" }, { "id": "liabilities", "name": "Liabilities", "type": "asset" }, { "id": "budgets", "name": "Budgets", "type": "budget" }];
const accounts = [{ "balance": "0", "id": "none", "name": "None", "transactionIds": [], "type": "none" }, { "balance": "0", "category": "assets", "id": "cash", "name": "Cash", "transactionIds": [], "type": "asset" }, { "balance": "0", "category": "assets", "id": "bank", "name": "Bank", "transactionIds": [], "type": "asset" }, { "balance": "0", "category": "liabilities", "id": "creditCard", "name": "Credit Card", "transactionIds": [], "type": "asset", "importTransactionsFormatId": "capitalOne" }, { "balance": "0", "category": "budgets", "id": "toSpend", "name": "To Spend", "transactionIds": [], "type": "budget" }];
const transactions = {};
const summary = { "balance": "0" };
const bulkTransactions = [];
const bulkTransactionTransactions = {};
const defaultProject = {
  accountCategories,
  accounts,
  transactions,
  summary,
  bulkTransactions,
  bulkTransactionTransactions
};
const userDataPath = electron.app.getPath("userData");
const settingsPath = path.join(userDataPath, "settings.json");
const defaultSettings = {
  projectPath: null,
  lastBackupDates: {},
  currencyPrefix: "£",
  dateFormat: "dd/MM/yyyy",
  importTransactionsDescriptionsGiftAided: []
};
let data;
const settings = {
  load() {
    const loadedSettings = fs.readJsonSync(settingsPath, { throws: false });
    data = {
      ...defaultSettings,
      ...loadedSettings
    };
  },
  save() {
    return fs.writeJson(settingsPath, data);
  },
  getProjectPath() {
    return data.projectPath;
  },
  setProjectPath(projectPath) {
    data.projectPath = projectPath;
  },
  setLastBackupDate(projectPath, date) {
    data.lastBackupDates[projectPath] = date.toISOString();
  },
  getLastBackupDate(projectPath) {
    const date = data.lastBackupDates[projectPath];
    return date ? new Date(date) : null;
  },
  get() {
    return data;
  },
  set(newData) {
    data = newData;
  }
};
settings.load();
function backup(filePath, data2) {
  const lastBackup = settings.getLastBackupDate(filePath);
  if (!lastBackup || dateFns.differenceInMonths(/* @__PURE__ */ new Date(), lastBackup) >= 1) {
    const dateStr = dateFns.format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
    return fs.writeFile(filePath.replace(".json", "") + ` [${dateStr} backup].json`, data2).catch(() => {
      throw new Error("Failed to backup project");
    }).then(() => {
      settings.setLastBackupDate(filePath, /* @__PURE__ */ new Date());
    });
  }
}
const project = {
  async save(filePath, data2) {
    if (typeof data2 !== "string") {
      throw new Error("Project must be stringified on client");
    }
    backup(filePath, data2);
    return fs.writeFile(filePath, data2).catch(() => {
      throw new Error("Failed to save project");
    });
  },
  async open(filePath) {
    console.log(`Opening project ${filePath}`);
    try {
      const data2 = await fs.readJson(filePath);
      if (!data2.accountCategories) {
        data2.accountCategories = defaultProject.accountCategories;
      }
      return data2;
    } catch {
      throw new Error("Failed to open project");
    }
  },
  async exportCsv(filePath, data2) {
    return fs.writeFile(filePath, data2).catch(() => {
      throw new Error("Failed to export");
    });
  }
};
const filters = [
  {
    name: "JSON",
    extensions: ["json"]
  }
];
async function saveAs(data2) {
  const defaultPath = settings.getProjectPath();
  const { canceled, filePath } = await electron.dialog.showSaveDialog({
    filters,
    ...defaultPath && { defaultPath }
  });
  if (canceled || !filePath) {
    return;
  }
  let path2 = filePath;
  if (!path2.endsWith(".json")) {
    path2 += ".json";
  }
  settings.setProjectPath(path2);
  settings.save();
  await project.save(path2, data2);
}
async function save(data2) {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    await project.save(projectPath, data2);
  } else {
    await saveAs(data2);
  }
}
electron.ipcMain.on("projectSave", async (_event, data2) => {
  save(data2);
});
electron.ipcMain.on("projectSaveAs", async (_event, data2) => {
  saveAs(data2);
});
electron.ipcMain.on("projectOpenDefault", async (event) => {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    try {
      const data2 = await project.open(projectPath);
      event.sender.send("projectOpened", data2 || defaultProject);
    } catch {
      settings.setProjectPath(null);
      event.sender.send("projectOpened", defaultProject);
    }
  } else {
    console.log("Opening default project");
    event.sender.send("projectOpened", defaultProject);
  }
});
electron.ipcMain.on("projectOpen", async (event) => {
  const { filePaths, canceled } = await electron.dialog.showOpenDialog({
    filters
  });
  if (!filePaths || !filePaths[0] || canceled) return;
  settings.setProjectPath(filePaths[0]);
  settings.save();
  const data2 = await project.open(filePaths[0]);
  event.sender.send("projectOpened", data2);
});
electron.ipcMain.on("projectNew", (event) => {
  settings.setProjectPath(null);
  settings.save();
  event.sender.send("projectOpened", defaultProject);
});
electron.ipcMain.on("exportCsv", async (_event, { type, data: data2 }) => {
  const { canceled: cancelled, filePath } = await electron.dialog.showSaveDialog({
    filters: [
      {
        name: "CSV",
        extensions: ["csv"]
      }
    ],
    title: `Export ${type} CSV`
  });
  if (cancelled || !filePath) {
    return;
  }
  let path2 = filePath;
  if (!path2.endsWith(".csv")) {
    path2 += ".csv";
  }
  project.exportCsv(path2, data2);
});
electron.ipcMain.on("showCloseWarning", async (event, data2) => {
  const { response } = await electron.dialog.showMessageBox({
    type: "warning",
    title: "Money Manager",
    buttons: ["Save", "Don't save"],
    message: "Do you want to save changes to your project?"
  });
  if (response === 0) {
    await save(data2);
  } else if (response === 1) {
    event.sender.send("closeConfirmed");
  }
});
electron.ipcMain.handle("importTransactions", async (event, { extensions, id }) => {
  const { filePaths, canceled } = await electron.dialog.showOpenDialog({
    filters: [{ name: "Transaction files", extensions }]
  });
  if (!filePaths.length || !filePaths[0] || canceled) {
    return;
  }
  const data2 = await fs.readFile(filePaths[0]);
  event.sender.send("importTransactionsDone", {
    data: data2.toString(),
    id
  });
});
function addApplicationMenuClickEvents(template, event) {
  template.forEach((item) => {
    if (item.id) {
      item.click = () => {
        event.sender.send("runApplicationMenuItem", item.id);
      };
    }
    if (item.submenu) {
      addApplicationMenuClickEvents(item.submenu, event);
    }
  });
}
electron.ipcMain.handle("setApplicationMenu", async (event, menuTemplate) => {
  addApplicationMenuClickEvents(menuTemplate, event);
  const menu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(menu);
});
electron.ipcMain.handle("getSettings", () => {
  return settings.get();
});
electron.ipcMain.handle("saveSettings", (_event, data2) => {
  settings.set(data2);
  return settings.save();
});
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.maximize();
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(createWindow);
electron.ipcMain.on("setWindowTitle", (_event, title) => {
  if (mainWindow) {
    mainWindow.setTitle(title);
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
