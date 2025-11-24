const { app, BrowserWindow, protocol, net, shell, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const isDev = process.env.NODE_ENV === 'development';

// Configure logging
log.transports.file.level = 'info';
// Configure autoUpdater
autoUpdater.logger = log;
autoUpdater.autoDownload = false; // Let user decide when to download
autoUpdater.allowPrerelease = false;

// Store reference to main window
let mainWindow;

// Register protocol before app ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true } }
]);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        icon: path.join(__dirname, '../public/favicon.ico'),
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadURL('app://./index.html');
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:') || url.startsWith('http:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    return mainWindow;
}

app.whenReady().then(() => {
    // Handle 'app' protocol
    protocol.handle('app', (request) => {
        const urlParsed = url.parse(request.url);
        let filePath = urlParsed.pathname;

        if (filePath === '/' || filePath === '\\') {
            filePath = 'index.html';
        }

        if (filePath.startsWith('/')) {
            filePath = filePath.slice(1);
        }

        const finalPath = path.join(__dirname, '../out', filePath);
        return net.fetch(url.pathToFileURL(finalPath).toString());
    });

    createWindow();

    // Check for updates shortly after startup
    if (!isDev) {
        setTimeout(() => {
            autoUpdater.checkForUpdates();
        }, 3000);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// AutoUpdater event handlers
autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
    sendStatusToWindow('checking-for-update');
});

autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    sendStatusToWindow('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    sendStatusToWindow('update-not-available', info);
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
    sendStatusToWindow('error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download progress: ${progressObj.percent}%`);
    sendStatusToWindow('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    sendStatusToWindow('update-downloaded', info);
});

function sendStatusToWindow(type, data = null) {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', { type, data });
    }
}

// IPC handlers
ipcMain.handle('check-for-updates', async () => {
    if (isDev) {
        return { available: false, message: 'Dev mode' };
    }
    try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, result };
    } catch (error) {
        log.error('Check for updates failed:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
