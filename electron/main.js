const { app, BrowserWindow } = require("electron");
const path = require("path");

// Correct absolute path inside packaged app
require(path.join(__dirname, "..", "backend", "server.js"));
// Start backend directly
//require("./backend/server");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    backgroundColor: "#0f172a",
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(
      path.join(
        app.getAppPath(),
        "frontend/dist/index.html"
      )
    );
  }
}

app.whenReady().then(() => {
  setTimeout(() => {
    createWindow();
  }, 3000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});