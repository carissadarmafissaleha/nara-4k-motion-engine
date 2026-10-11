/**
 * Motion Studio Engine - Main Process
 * Electron Lifecycle, IPC Handlers, and Batch Rendering Coordinator
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { RenderEngine } = require('./engine/render-engine');
const { parseHtmlMetadata, enrichMetadata, exportMetadataToCsv } = require('./engine/metadata-parser');

let mainWindow = null;
let renderEngine = null;
let isBatchRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 560,
    title: 'NARA - Commercial 4K & ProRes 4444 Motion Studio',
    backgroundColor: '#070a12',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false // Allows loading local file preview in sandbox
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  renderEngine = new RenderEngine();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
  const defaultDir = path.join(userVideos, 'MotionStudioRenders');
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch (e) {}
  }
  return defaultDir;
});

// IPC Handler: Open Folder in OS File Explorer
ipcMain.handle('system:openFolder', async (event, folderPath) => {
  if (!folderPath || !fs.existsSync(folderPath)) {
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
    return { success: true, content, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Save Generated Animation directly
ipcMain.handle('file:saveGeneratedAnimation', async (event, { filename, content }) => {
  try {
    const outputDir = path.join(process.cwd(), 'generated_animations');
    if (!fs.existsSync(outputDir)) {
      await fs.promises.mkdir(outputDir, { recursive: true });
    }
    const safeName = (filename || 'motion-animation')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const finalFilename = safeName.endsWith('.html') ? safeName : `${safeName}.html`;
    const targetPath = path.join(outputDir, finalFilename);
    await fs.promises.writeFile(targetPath, content, 'utf-8');
    return { success: true, filePath: targetPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler: Save HTML with Dialog
ipcMain.handle('dialog:saveHtmlFile', async (event, { defaultFilename, content }) => {
  if (!mainWindow) return { success: false, canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Generated Animation HTML',
    defaultPath: defaultFilename || 'generated-animation.html',
    filters: [
      { name: 'HTML Web Animation', extensions: ['html', 'htm'] }
    ]
  });
  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }
  try {
    await fs.promises.writeFile(result.filePath, content, 'utf-8');
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
    if (mainWindow) {
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
  const outputDir = settings.outputDir;
  const metadataRecordsForCsv = [];
  let successfulRenders = 0;
  let failedRenders = 0;

  mainWindow.webContents.send('render:status', {
    status: 'rendering',
    totalQueue: items.length,
    activeFileIndex: 0
  });

  mainWindow.webContents.send('render:log', `[Batch] Starting batch queue: ${items.length} items`);
  mainWindow.webContents.send('render:log', `[Batch] Output directory: ${outputDir}`);

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

    const isProRes = preset === 'prores4444' || preset === 'prores' || preset === 'mov';
    const ext = isProRes ? '.mov' : '.mp4';
    const baseName = path.basename(item.filePath, path.extname(item.filePath));
    const outputFilename = `${baseName}_${preset}_${width}x${height}_${fps}fps${ext}`;
    const outputPath = path.join(outputDir, outputFilename);

    mainWindow.webContents.send('render:status', {
      status: 'rendering',
      activeFile: baseName,
      queueIndex: idx + 1,
      totalQueue: items.length
    });

    mainWindow.webContents.send('render:log', `--------------------------------------------------`);
    mainWindow.webContents.send('render:log', `[Batch] (${idx + 1}/${items.length}) Rendering: ${baseName}`);

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

      // 2. Execute render with In-File Metadata Embedding permanently in container
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
          metadata: mergedMeta
        },
        (progress) => {
          if (mainWindow) {
            mainWindow.webContents.send('render:progress', {
              ...progress,
              fileIndex: idx,
              filename: baseName
            });
          }
        },
        (logMsg) => {
          if (mainWindow) {
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

      successfulRenders++;

      mainWindow.webContents.send('render:fileComplete', {
        fileIndex: idx,
        filename: baseName,
        outputPath,
        success: true
      });
      mainWindow.webContents.send('render:log', `[Batch] Successfully exported: ${outputFilename}`);
    } catch (err) {
      failedRenders++;
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

  // 3. Export & safe-append CSV metadata
  let csvPath = null;
  if (metadataRecordsForCsv.length > 0) {
    try {
      const csvResult = await exportMetadataToCsv(outputDir, metadataRecordsForCsv);
      csvPath = typeof csvResult === 'object' ? csvResult.csvPath : csvResult;
      const totalRows = typeof csvResult === 'object' ? csvResult.totalRows : metadataRecordsForCsv.length;
      mainWindow.webContents.send('render:log', `[Auto-Metadata CSV] Berhasil append ${metadataRecordsForCsv.length} video ke: ${csvPath} (Total di CSV: ${totalRows} baris). Data lama tersimpan aman!`);
    } catch (csvErr) {
      mainWindow.webContents.send('render:log', `[Metadata Error] CSV export error: ${csvErr.message}`);
    }
  }

  isBatchRunning = false;

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

  return {
    success: true,
    total: items.length,
    successful: successfulRenders,
    failed: failedRenders,
    csvPath
  };
});
