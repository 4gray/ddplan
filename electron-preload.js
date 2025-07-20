const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendQuit: () => ipcRenderer.send('quit'),
});
