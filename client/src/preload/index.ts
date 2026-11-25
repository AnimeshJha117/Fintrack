import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Api } from './api'

// Custom APIs for renderer
const api: Api = {
  session: {
    save: (token: string): Promise<boolean> => ipcRenderer.invoke('session:save', token),
    load: (): Promise<string | null> => ipcRenderer.invoke('session:load'),
    clear: (): Promise<void> => ipcRenderer.invoke('session:clear')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
