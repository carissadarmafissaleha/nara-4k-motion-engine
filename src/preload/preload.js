/**
 * Motion Studio Engine - Preload Script
 * Secure IPC Bridge between Electron Main Process and Renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // File dialogs
  selectHtmlFiles: () => ipcRenderer.invoke('dialog:selectHtmlFiles'),
  selectHtmlDirectory: () => ipcRenderer.invoke('dialog:selectHtmlDirectory'),
  selectOutputDirectory: () => ipcRenderer.invoke('dialog:selectOutputDirectory'),
  getDefaultOutputDir: () => ipcRenderer.invoke('system:getDefaultOutputDir'),

  // Metadata & File loading
  parseMetadata: (filePath) => ipcRenderer.invoke('engine:parseMetadata', filePath),
  readHtmlFile: (filePath) => ipcRenderer.invoke('file:readHtmlContent', filePath),
  saveGeneratedAnimation: (payload) => ipcRenderer.invoke('file:saveGeneratedAnimation', payload),
  saveHtmlWithDialog: (payload) => ipcRenderer.invoke('dialog:saveHtmlFile', payload),

  // Render operations
  startBatchRender: (payload) => ipcRenderer.invoke('engine:startBatchRender', payload),
  cancelBatchRender: () => ipcRenderer.invoke('engine:cancelBatchRender'),
  openFolder: (dirPath) => ipcRenderer.invoke('system:openFolder', dirPath),

  // System Tray & Window Visibility
  hideToTray: () => ipcRenderer.invoke('system:hideToTray'),
  showWindow: () => ipcRenderer.invoke('system:showWindow'),
  isWindowVisible: () => ipcRenderer.invoke('system:isWindowVisible'),

  // Live event listeners from Main Process
  onRenderProgress: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('render:progress', subscription);
    return () => ipcRenderer.removeListener('render:progress', subscription);
  },

  onRenderLog: (callback) => {
    const subscription = (event, log) => callback(log);
    ipcRenderer.on('render:log', subscription);
    return () => ipcRenderer.removeListener('render:log', subscription);
  },

  onRenderStatusChange: (callback) => {
    const subscription = (event, status) => callback(status);
    ipcRenderer.on('render:status', subscription);
    return () => ipcRenderer.removeListener('render:status', subscription);
  },

  onFileRenderComplete: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('render:fileComplete', subscription);
    return () => ipcRenderer.removeListener('render:fileComplete', subscription);
  },

  onBatchComplete: (callback) => {
    const subscription = (event, summary) => callback(summary);
    ipcRenderer.on('render:batchComplete', subscription);
    return () => ipcRenderer.removeListener('render:batchComplete', subscription);
  }
});
