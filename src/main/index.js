import { app, shell, BrowserWindow, ipcMain, safeStorage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// src/main/index.js
import fs from 'fs'

// 密钥存储路径
const KEY_PATH = join(app.getPath('userData'), 'ai-api-key.enc')
// IPC 处理
ipcMain.handle('save-api-key', (event, key) => {
  if (!key) {
    fs.existsSync(KEY_PATH) && fs.unlinkSync(KEY_PATH)
    return true
  }
  try {
    const encrypted = safeStorage.encryptString(key)
    fs.writeFileSync(KEY_PATH, encrypted)
    return true
  } catch (err) {
    console.error('保存密钥失败:', err)
    return false
  }
})

ipcMain.handle('get-api-key', () => {
  if (!fs.existsSync(KEY_PATH)) return null
  try {
    const encrypted = fs.readFileSync(KEY_PATH)
    return safeStorage.decryptString(encrypted)
  } catch (err) {
    console.error('读取密钥失败:', err)
    return null
  }
})

ipcMain.handle('delete-api-key', () => {
  if (fs.existsSync(KEY_PATH)) {
    fs.unlinkSync(KEY_PATH)
    return true
  }
  return false
})

// ... 其他现有代码（createWindow, app.on 等保持不变）
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
