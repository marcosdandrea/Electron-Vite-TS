import path from 'path';
import { env } from './envLoader';

const isDev = env.NODE_ENV === 'development'
const isHeadless = process.env.HEADLESS === 'true'

const getAppPath = async () => {
  if (isHeadless) {
    return process.cwd();
  } else {
    const { app } = await import('electron');
    return app.getAppPath();    
  }
}

export async function getStaticDir() {
  const appPath = await getAppPath();
  return path.join(appPath, 'dist-ui');
}

export async function getAssetPath() {
  const appPath = await getAppPath();
  return path.join(appPath, isDev ? '.' : '..', '/src/assets');
}

export const getLogDirectory = (): string => {
    if (isHeadless) {
        // Para modo headless, usar el directorio de trabajo actual
        return path.join(process.cwd(), 'logs');
    } else {
        // Para Electron, usar el directorio donde está el ejecutable
        const exeDir = path.dirname(process.execPath);
        return path.join(exeDir, 'logs');
    }
};