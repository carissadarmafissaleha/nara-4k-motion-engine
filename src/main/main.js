/**
 * Motion Studio Engine - Main Process
 * Electron Lifecycle, IPC Handlers, and Batch Rendering Coordinator
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { RenderEngine } = require('./engine/render-engine');
const { parseHtmlMetadata, enrichMetadata, exportMetadataToCsv, exportMetadataPerFile, findMatchingAudioFile, detectFolderAssets } = require('./engine/metadata-parser');

// Prevent background timer throttling when running hidden in tray
app.commandLine.appendSwitch('disable-background-timer-throttling');

let mainWindow = null;
let renderEngine = null;
let isBatchRunning = false;
let tray = null;
let isQuitting = false;
let currentBatchStatus = 'idle'; // 'idle' | 'rendering' | 'completed' | 'cancelled'
let activeBatchInfo = { current: 0, total: 0, activeFile: '' };
let hasShownTrayBalloon = false;

function safeExistsSync(targetPath) {
  if (typeof targetPath !== 'string' || !targetPath.trim()) {
    return false;
  }
  try {
    return fs.existsSync(targetPath);
  } catch (e) {
    return false;
  }
}

function getAppIconPath() {
  const paths = [
    path.join(__dirname, '../assets/icon128.png'),
    path.join(__dirname, '../assets/icon48.png'),
    path.join(__dirname, '../../extension/icons/icon128.png')
  ];
  for (const p of paths) {
    if (safeExistsSync(p)) return p;
  }
  return undefined;
}

function getTrayIcon() {
  const candidatePaths = [
    path.join(__dirname, '../assets/icon16.png'),
    path.join(__dirname, '../assets/icon48.png'),
    path.join(__dirname, '../../extension/icons/icon16.png'),
    path.join(__dirname, '../../extension/icons/icon48.png')
  ];
  for (const p of candidatePaths) {
    if (safeExistsSync(p)) {
      return nativeImage.createFromPath(p);
    }
  }
  return null;
}

function updateTrayMenu() {
  if (!tray) return;

  let statusLabel = 'Status: Siap (Idle)';
  if (currentBatchStatus === 'rendering') {
    statusLabel = `Status: Merender (${activeBatchInfo.current}/${activeBatchInfo.total}) ${activeBatchInfo.activeFile ? '- ' + activeBatchInfo.activeFile : ''}`;
  } else if (currentBatchStatus === 'completed') {
    statusLabel = `Status: Selesai (${activeBatchInfo.total} file)`;
  } else if (currentBatchStatus === 'cancelled') {
    statusLabel = 'Status: Dibatalkan';
  }

  const isWinVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible() && !mainWindow.isMinimized();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'NARA Motion Studio',
      enabled: false
    },
    {
      label: statusLabel,
      enabled: false
    },
    { type: 'separator' },
    {
      label: isWinVisible ? 'Sembunyikan ke Tray' : 'Buka NARA Studio',
      click: () => {
        if (isWinVisible) {
          hideToTray();
        } else {
          showMainWindow();
        }
      }
    },
    {
      label: 'Buka Folder Hasil',
      click: async () => {
        const userVideos = app.getPath('videos') || app.getPath('documents');
        const defaultDir = path.join(userVideos, 'Nara Motions');
        if (safeExistsSync(defaultDir)) {
          await shell.openPath(defaultDir);
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Keluar dari NARA',
      click: async () => {
        isQuitting = true;
        if (renderEngine) {
          try { await renderEngine.close(); } catch (e) {}
        }
        if (tray) {
          try { tray.destroy(); } catch (e) {}
          tray = null;
        }
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  updateTrayMenu();
}

function hideToTray() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
    updateTrayMenu();
    notifyHiddenToTray();
  }
}

function toggleMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
    hideToTray();
  } else {
    showMainWindow();
  }
}

function notifyHiddenToTray() {
  if (!hasShownTrayBalloon && tray) {
    hasShownTrayBalloon = true;
    try {
      tray.displayBalloon({
        title: 'NARA Motion Studio',
        content: 'Aplikasi berjalan di background. Klik dua kali ikon tray untuk membuka kembali.',
        iconType: 'info'
      });
    } catch (e) {}
  }
}

function createTray() {
  if (tray) return;
  const icon = getTrayIcon();
  if (!icon) {
    console.warn('[Tray] Icon not found, skipping tray creation');
    return;
  }

  tray = new Tray(icon);
  tray.setToolTip('NARA - Commercial Motion Studio (Running in background)');

  tray.on('click', () => {
    toggleMainWindow();
  });

  tray.on('double-click', () => {
    showMainWindow();
  });

  tray.on('balloon-click', () => {
    showMainWindow();
  });

  updateTrayMenu();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 560,
    title: 'NARA - Commercial 4K & ProRes 4444 Motion Studio',
    backgroundColor: '#070a12',
    icon: getAppIconPath(),
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false, // Allows loading local file preview in sandbox
      backgroundThrottling: false // Penting: Biarkan rendering & background tasks berjalan lancar saat di tray
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    updateTrayMenu();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[Window Load Error]', errorCode, errorDescription);
  });

  // Intercept window close to hide to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      hideToTray();
      return false;
    }
  });

  mainWindow.on('show', () => {
    updateTrayMenu();
  });

  mainWindow.on('hide', () => {
    updateTrayMenu();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock to prevent duplicate background instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showMainWindow();
  });

  // App lifecycle
  app.whenReady().then(() => {
    renderEngine = new RenderEngine();
    createTray();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        showMainWindow();
      }
    });
  });
}

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', async () => {
  if (renderEngine) {
    try {
      await renderEngine.close();
    } catch (e) {}
  }
});

app.on('window-all-closed', async () => {
  if (renderEngine) {
    await renderEngine.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Default Output Directory
ipcMain.handle('system:getDefaultOutputDir', () => {
  const userVideos = app.getPath('videos') || app.getPath('documents');
  const defaultDir = path.join(userVideos, 'Nara Motions');
  if (!safeExistsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch (e) {}
  }
  return defaultDir;
});

// IPC Handler: Open Folder in OS File Explorer
ipcMain.handle('system:openFolder', async (event, folderPath) => {
  if (!folderPath || typeof folderPath !== 'string' || !safeExistsSync(folderPath)) {
    return { success: false, error: 'Path does not exist' };
  }
  await shell.openPath(folderPath);
  return { success: true };
});

// IPC Handler: File Picker Dialog
ipcMain.handle('dialog:selectHtmlFiles', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Web Animation Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'HTML Web Animations', extensions: ['html', 'htm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result.canceled ? [] : result.filePaths;
});

// IPC Handler: Select Assets/Images/SVG for AI Motion Generator
ipcMain.handle('dialog:selectAiAssetFiles', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih File Aset / Gambar / Logo untuk AI Motion',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Visual Assets & Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'] },
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || !result.filePaths.length) return [];

  const loadedAssets = [];
  for (const filePath of result.filePaths) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const filename = path.basename(filePath);
      const stat = await fs.promises.stat(filePath);

      // Read small/medium files into base64 Data URL (limit ~12MB for browser safety)
      if (stat.size <= 12 * 1024 * 1024) {
        const buffer = await fs.promises.readFile(filePath);
        let mime = 'application/octet-stream';
        if (ext === '.png') mime = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.svg') mime = 'image/svg+xml';
        else if (ext === '.webp') mime = 'image/webp';
        else if (ext === '.gif') mime = 'image/gif';
        else if (ext === '.mp3') mime = 'audio/mp3';
        else if (ext === '.wav') mime = 'audio/wav';

        const base64 = buffer.toString('base64');
        const dataUrl = `data:${mime};base64,${base64}`;

        loadedAssets.push({
          name: filename,
          path: filePath,
          size: stat.size,
          extension: ext,
          mimeType: mime,
          dataUrl: dataUrl,
          isImage: mime.startsWith('image/'),
          isAudio: mime.startsWith('audio/')
        });
      }
    } catch (e) {
      console.warn('Failed reading asset file:', filePath, e.message);
    }
  }

  return loadedAssets;
});

// IPC Handler: Directory Picker Dialog
ipcMain.handle('dialog:selectHtmlDirectory', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Folder Containing HTML Animations',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) return [];

  const targetDir = result.filePaths[0];
  try {
    const files = await fs.promises.readdir(targetDir);
    const htmlFiles = files
      .filter(f => f.toLowerCase().endsWith('.html') || f.toLowerCase().endsWith('.htm'))
      .map(f => path.join(targetDir, f));
    return htmlFiles;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
});

// IPC Handler: Output Directory Picker
ipcMain.handle('dialog:selectOutputDirectory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Render Output Directory',
    properties: ['openDirectory', 'createDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// IPC Handler: Parse Metadata
ipcMain.handle('engine:parseMetadata', async (event, filePath) => {
  return await parseHtmlMetadata(filePath);
});

// IPC Handler: Read HTML file for preview
ipcMain.handle('file:readHtmlContent', async (event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const fileDir = path.dirname(filePath);
    const fileUrl = url.pathToFileURL(filePath).href;
    const dirUrl = url.pathToFileURL(fileDir).href + '/';
    const detectedAssets = detectFolderAssets(filePath, content);
    return { success: true, content, filePath, fileDir, fileUrl, dirUrl, detectedAssets };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Save Generated Animation directly
ipcMain.handle('file:saveGeneratedAnimation', async (event, { filename, content }) => {
  try {
    let outputDir;
    try {
      outputDir = path.join(process.cwd(), 'generated_animations');
      if (!safeExistsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (errDir) {
      outputDir = path.join(app.getPath('userData'), 'generated_animations');
      if (!safeExistsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    }

    let cleanName = path.basename(filename || 'motion-animation', path.extname(filename || ''));
    cleanName = cleanName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const finalFilename = `${cleanName}.html`;
    const targetPath = path.join(outputDir, finalFilename);
    await fs.promises.writeFile(targetPath, content || '', 'utf-8');
    return { success: true, filePath: targetPath, filename: finalFilename };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Save HTML with Dialog
ipcMain.handle('dialog:saveHtmlFile', async (event, { defaultFilename, content }) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender) || ((mainWindow && !mainWindow.isDestroyed()) ? mainWindow : null);
    let defaultPath = defaultFilename || 'motion-animation.html';
    try {
      defaultPath = path.join(app.getPath('downloads'), defaultFilename || 'motion-animation.html');
    } catch (e) {}

    const result = await dialog.showSaveDialog(win, {
      title: 'Save Generated Animation HTML',
      defaultPath,
      filters: [
        { name: 'HTML Web Animation', extensions: ['html', 'htm'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }
    await fs.promises.writeFile(result.filePath, content || '', 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Cancel Batch Render
ipcMain.handle('engine:cancelBatchRender', async () => {
  if (renderEngine && isBatchRunning) {
    renderEngine.cancel();
    isBatchRunning = false;
    currentBatchStatus = 'cancelled';
    updateTrayMenu();
    if (tray) {
      tray.setToolTip('NARA - Batch rendering dibatalkan');
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('render:status', { status: 'cancelled' });
      mainWindow.webContents.send('render:log', '[Engine] Batch rendering cancelled by user.');
    }
    return { success: true };
  }
  return { success: false };
});

// IPC Handler: Start Batch Render
ipcMain.handle('engine:startBatchRender', async (event, payload) => {
  if (isBatchRunning) {
    return { success: false, error: 'A render batch is already in progress.' };
  }

  const { items, settings } = payload;
  if (!items || !items.length) {
    return { success: false, error: 'No items in render queue.' };
  }

  isBatchRunning = true;
  currentBatchStatus = 'rendering';
  activeBatchInfo = { current: 1, total: items.length, activeFile: '' };
  updateTrayMenu();
  if (tray) {
    tray.setToolTip(`NARA - Memulai render (${items.length} file)`);
  }

  const outputDir = settings.outputDir;
  const metadataRecordsForCsv = [];
  let successfulRenders = 0;
  let failedRenders = 0;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('render:status', {
      status: 'rendering',
      totalQueue: items.length,
      activeFileIndex: 0
    });
    mainWindow.webContents.send('render:log', `[Batch] Starting batch queue: ${items.length} items`);
    mainWindow.webContents.send('render:log', `[Batch] Output directory: ${outputDir}`);
  }

  for (let idx = 0; idx < items.length; idx++) {
    if (!isBatchRunning) break; // cancelled

    const item = items[idx];
    const isSeamlessLoop = item.isSeamlessLoop !== undefined ? item.isSeamlessLoop : settings.isSeamlessLoop;
    const holdLastFrames = item.holdLastFrames !== undefined ? item.holdLastFrames : settings.holdLastFrames;
    const preset = item.preset || settings.preset || 'mp4_4k';
    const fps = item.fps || settings.fps || 60;
    const width = item.width || settings.width || 3840;
    const height = item.height || settings.height || 2160;
    const totalFrames = item.totalFrames || settings.totalFrames || 180;
    const bgMode = item.bgMode || settings.bgMode || 'checkerboard';

    const isProRes = preset === 'prores4444' || preset === 'prores' || preset === 'mov';
    const ext = isProRes ? '.mov' : '.mp4';
    const baseName = path.basename(item.filePath, path.extname(item.filePath));
    const bgSuffix = (bgMode && bgMode !== 'checkerboard') ? `_${bgMode}` : '';
    const outputFilename = `${baseName}_${preset}${bgSuffix}_${width}x${height}_${fps}fps${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    activeBatchInfo.current = idx + 1;
    activeBatchInfo.activeFile = baseName;
    updateTrayMenu();
    if (tray) {
      tray.setToolTip(`NARA (${idx + 1}/${items.length}) - ${baseName.slice(0, 40)}`);
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('render:status', {
        status: 'rendering',
        activeFile: baseName,
        queueIndex: idx + 1,
        totalQueue: items.length
      });
      mainWindow.webContents.send('render:log', `--------------------------------------------------`);
      mainWindow.webContents.send('render:log', `[Batch] (${idx + 1}/${items.length}) Rendering: ${baseName}`);
    }

    try {
      // 1. Parse & enrich metadata beforehand for IN-FILE EMBEDDING & CSV EXPORT
      const rawMeta = await parseHtmlMetadata(item.filePath);
      const userMeta = item.metadata || {};

      let userKeywords = [];
      if (Array.isArray(userMeta.keywords)) {
        userKeywords = userMeta.keywords;
      } else if (typeof userMeta.keywords === 'string') {
        userKeywords = userMeta.keywords.split(',').map(k => k.trim()).filter(Boolean);
      } else if (rawMeta.keywords) {
        userKeywords = rawMeta.keywords;
      }

      const mergedMeta = {
        ...rawMeta,
        ...userMeta,
        title: userMeta.title || rawMeta.title || baseName,
        category: userMeta.category || rawMeta.category || 'Motion Graphics',
        description: userMeta.description || rawMeta.description || userMeta.title || rawMeta.title || baseName,
        keywords: userKeywords
      };

      // 2. Auto-detect matching audio in same folder with same name
      const enableAudio = settings.enableAudio !== false;
      let matchedAudioPath = null;
      if (enableAudio) {
        if (item.audioPath && safeExistsSync(item.audioPath)) {
          matchedAudioPath = item.audioPath;
        } else if (typeof findMatchingAudioFile === 'function') {
          const detected = findMatchingAudioFile(item.filePath);
          if (detected) matchedAudioPath = detected.path;
        }
      }

      if (matchedAudioPath && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('render:log', `[Audio] File audio se-nama terdeteksi: ${path.basename(matchedAudioPath)}`);
      }

      // 3. Execute render with In-File Metadata Embedding permanently in container
      const renderResult = await renderEngine.renderAnimation(
        {
          htmlPath: item.filePath,
          outputPath,
          preset,
          width,
          height,
          fps,
          totalFrames,
          isSeamlessLoop,
          holdLastFrames,
          bgMode,
          metadata: mergedMeta,
          audioPath: matchedAudioPath,
          copyAudioToOutput: Boolean(settings.copyAudioToOutput),
          fastMode: Boolean(settings.fastMode),
          encoderEngine: settings.encoderEngine || 'auto'
        },
        (progress) => {
          if (tray && progress && typeof progress.percent === 'number') {
            const etaStr = progress.etaFormatted ? ` [ETA: ${progress.etaFormatted}]` : '';
            tray.setToolTip(`NARA [${progress.percent}%]${etaStr} (${idx + 1}/${items.length}): ${baseName.slice(0, 25)}`);
          }
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('render:progress', {
              ...progress,
              fileIndex: idx,
              filename: baseName
            });
          }
        },
        (logMsg) => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('render:log', logMsg);
          }
        }
      );

      const enriched = enrichMetadata({
        meta: mergedMeta,
        isSeamlessLoop,
        holdLastFrames,
        outputFilename
      });
      metadataRecordsForCsv.push(enriched);

      try {
        const perFileCsv = await exportMetadataPerFile(outputPath, enriched);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('render:log', `[Metadata] ${path.basename(perFileCsv)}`);
        }
      } catch (perFileErr) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('render:log', `[Metadata Error] Per-file CSV: ${perFileErr.message}`);
        }
      }

      successfulRenders++;

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('render:fileComplete', {
          fileIndex: idx,
          filename: baseName,
          outputPath,
          success: true
        });
        mainWindow.webContents.send('render:log', `[Batch] Successfully exported: ${outputFilename}`);
      }
    } catch (err) {
      failedRenders++;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('render:fileComplete', {
          fileIndex: idx,
          filename: baseName,
          outputPath,
          success: false,
          error: err.message
        });
        mainWindow.webContents.send('render:log', `[Batch Error] Failed to render ${baseName}: ${err.message}`);
      }
    }
  }

  // 3. Export & safe-append CSV metadata
  let csvPath = null;
  if (metadataRecordsForCsv.length > 0) {
    try {
      const csvResult = await exportMetadataToCsv(outputDir, metadataRecordsForCsv);
      csvPath = typeof csvResult === 'object' ? csvResult.csvPath : csvResult;
      const totalRows = typeof csvResult === 'object' ? csvResult.totalRows : metadataRecordsForCsv.length;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('render:log', `[Auto-Metadata CSV] Berhasil append ${metadataRecordsForCsv.length} video ke: ${csvPath} (Total di CSV: ${totalRows} baris). Data lama tersimpan aman!`);
      }
    } catch (csvErr) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('render:log', `[Metadata Error] CSV export error: ${csvErr.message}`);
      }
    }
  }

  isBatchRunning = false;
  currentBatchStatus = 'completed';
  activeBatchInfo.total = items.length;
  updateTrayMenu();

  if (tray) {
    tray.setToolTip(`NARA - Selesai: ${successfulRenders}/${items.length} file`);
    // Jika window sedang disembunyikan di tray, beri notifikasi balon ke user
    if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible()) {
      try {
        tray.displayBalloon({
          title: 'NARA - Render Selesai',
          content: `Batch render selesai (${successfulRenders} sukses, ${failedRenders} gagal). Klik untuk membuka NARA Studio.`,
          iconType: 'info'
        });
      } catch (e) {}
    }
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('render:status', {
      status: 'completed',
      totalQueue: items.length
    });

    mainWindow.webContents.send('render:batchComplete', {
      total: items.length,
      successful: successfulRenders,
      failed: failedRenders,
      outputDir,
      csvPath
    });
  }

  return {
    success: true,
    total: items.length,
    successful: successfulRenders,
    failed: failedRenders,
    csvPath
  };
});

// IPC Handler: Hide Window to System Tray
ipcMain.handle('system:hideToTray', () => {
  hideToTray();
  return { success: true };
});

// IPC Handler: Restore/Show Window from Tray
ipcMain.handle('system:showWindow', () => {
  showMainWindow();
  return { success: true };
});

// IPC Handler: Check if Window is Visible
ipcMain.handle('system:isWindowVisible', () => {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isVisible() : false;
});

