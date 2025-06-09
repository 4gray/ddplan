const { app, ipcMain, nativeImage } = require('electron');
const { menubar } = require('menubar');
const path = require('path');

const iconPath = path.join(__dirname, 'IconTemplate.png');
const trayIcon = nativeImage.createFromPath(iconPath);

// Set different icon sizes based on platform
let resizedIcon;
if (process.platform === 'darwin') {
    resizedIcon = trayIcon.resize({ width: 20, height: 20 });
    resizedIcon.setTemplateImage(true);
} else if (process.platform === 'win32') {
    resizedIcon = trayIcon.resize({ width: 16, height: 16 });
} else {
    resizedIcon = trayIcon.resize({ width: 22, height: 22 });
}

const isDev = process.env.NODE_ENV === 'development';
const indexURL = isDev
    ? 'http://localhost:4200'
    : `file://${__dirname}/dist/ddplan/browser/index.html`;

const mb = menubar({
    index: indexURL,
    icon: resizedIcon,
    browserWindow: {
        width: 300,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'electron-preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            backgroundThrottling: false,
            devTools: isDev,
        },
        transparent: true,
        fullscreenable: false,
        alwaysOnTop: true,
        showOnAllWorkspaces: true,
    },
    tooltip: 'DDPlan',
    showDockIcon: false,
    preloadWindow: true,
});

mb.on('ready', () => {
    console.log('DDPlan is ready!');

    if (isDev) {
        console.log(
            'Running in development mode, loading from Angular dev server'
        );
    } else {
        console.log('Running in production mode, loading from built files');
    }
});

mb.on('after-create-window', () => {
    if (isDev) {
        // Open dev tools in development mode
        mb.window.webContents.openDevTools({ mode: 'detach' });
    }
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
