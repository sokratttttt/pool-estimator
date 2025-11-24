const { app, BrowserWindow, protocol, net, shell, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const isDev = process.env.NODE_ENV === 'development';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

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

        // Check for updates after window is ready
        mainWindow.webContents.on('did-finish-load', () => {
            setTimeout(() => {
                autoUpdater.checkForUpdates();
            }, 3000);
        });
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
    sendStatusToWindow('Проверка обновлений...');
});

autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    sendStatusToWindow('Найдено обновление! Загрузка...');
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    sendStatusToWindow('Вы используете последнюю версию');
});

autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
    sendStatusToWindow('Ошибка при проверке обновлений');
});

autoUpdater.on('download-progress', (progressObj) => {
    let message = `Загрузка: ${Math.round(progressObj.percent)}%`;
    log.info(message);
    sendStatusToWindow(message, progressObj.percent);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    sendStatusToWindow('Обновление загружено. Перезапустите приложение для установки.');
});

function sendStatusToWindow(text, percent = null) {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', { text, percent });
    }
}

// IPC handlers for manual update check
ipcMain.handle('check-for-updates', async () => {
    if (isDev) {
        return { available: false, message: 'Dev mode - updates disabled' };
    }

    try {
        const result = await autoUpdater.checkForUpdates();
        return {
            available: result?.updateInfo?.version !== app.getVersion(),
            version: result?.updateInfo?.version
        };
    } catch (error) {
        log.error('Manual update check failed:', error);
        return { available: false, error: error.message };
    }
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});
