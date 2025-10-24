import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../src/common/types/electron.types'



const electronAPI: ElectronAPI = {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },

  on: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback)
  },

  once: (channel: string, callback: (event: any, ...args: any[]) => void) => {
   
    ipcRenderer.once(channel, callback)
  },

  // Modern IPC methods
  invoke: async (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },

  off: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.off(channel, listener)
  },

}

// Exponer API al contexto del renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Prevenir que el renderer acceda a Node.js APIs directamente
delete (globalThis as any).require
delete (globalThis as any).exports  
delete (globalThis as any).module