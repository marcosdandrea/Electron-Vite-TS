import { ElectronAPI } from './src/common/types/electron.types';

interface Window {
  electronAPI: ElectronAPI;
  ELECTRON_SESSION_TOKEN: string;
}