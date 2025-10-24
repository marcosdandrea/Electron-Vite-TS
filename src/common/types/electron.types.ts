
export interface ElectronAPI {
  // Legacy IPC methods (mantener compatibilidad)
  send: (channel: string, data?: any) => void
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void
  once: (channel: string, callback: (event: any, ...args: any[]) => void) => void
  
  // Modern IPC methods
  invoke: (channel: string, ...args: any[]) => Promise<any>
  off: (channel: string, listener: (...args: any[]) => void) => void
}


