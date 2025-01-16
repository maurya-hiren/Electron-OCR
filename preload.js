const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  convertPdf: (filePath) => ipcRenderer.invoke('convertPdfToImage', filePath),
  openImageWindow: () => ipcRenderer.invoke('openImageWindow'),
});
