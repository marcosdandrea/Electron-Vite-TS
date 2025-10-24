import '@utils/envLoader.js'
import { env } from '@utils/envLoader.js';
import { Log } from '@utils/log.js';

const isDev = env.NODE_ENV === 'development';
const isHeadless = process.env.HEADLESS === 'true'

const log = new Log('main', true);
log.info('Starting app...');
log.info(`Logs directory: ${log.getLogDirectory()}`);

(async () => {

  //I/O Processes: servidores, sockets, etc.
  const {ioProcesses} = await import('./src/main/ioProcesses.js')
  await ioProcesses()

  //Electron Process: solo si no es headless
  if (!isHeadless) {
    const {electronProcess} = await import('./src/main/electronProcess.js')
    await electronProcess()
  }

  //en AppProcess van los procesos dedicados a la logica de la applicación
  const {appProcess} = await import('./src/main/appProcess.js')
  await appProcess()

  log.info(`App started in ${isDev ? 'development' : 'production'} mode${isHeadless ? ' (headless)' : ''}.`);
})()
