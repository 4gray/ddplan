const { app, ipcMain } = require('electron');
const { menubar } = require('menubar');
const path = require('path');

const iconPath = path.join(__dirname, 'IconTemplate.png');

const mb = menubar({
    index: `file://${__dirname}/dist/ddplan/browser/index.html`,
    icon: iconPath,
    browserWindow: {
        width: 300,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'electron-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            backgroundThrottling: false,
        },
        transparent: true,
        fullscreenable: false,
        alwaysOnTop: false,
        showOnAllWorkspaces: true,
    },
    tooltip: 'DDPlan',
    showDockIcon: false,
    preloadWindow: true,
});

mb.on('ready', () => {
    console.log('Menubar app is ready.');
    // For development, you might want to point to ng serve
    // if (process.env.NODE_ENV === 'development') {
    //   mb.window.loadURL('http://localhost:4200');
    // }
});

mb.on('after-create-window', () => {
    mb.window.openDevTools({ mode: 'undocked' }); // Uncomment to open DevTools
});

ipcMain.on('quit', () => {
    app.quit();
});

// Prevent app from quitting when all windows are closed (macOS behavior)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit(); // Default behavior on other platforms
    }
});

// Re-create the window if the app is activated and no windows are open (macOS behavior)
app.on('activate', () => {
    if (mb.window === null && app.isPackaged) {
        // This logic might need adjustment based on how menubar handles window re-creation
    }
});
