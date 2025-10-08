import 'dotenv/config'
import { Log } from '@utils/log.js';
const log = new Log('main', true);

const isDev = process.env.NODE_ENV === 'development'
const isHeadless = process.env.HEADLESS === 'true'

log.info('Starting app...');

(async () => {
  const {coreProcesses} = await import('./src/main/coreProcesses.js')
  await coreProcesses()

  if (!isHeadless) {
    const {electronProcess} = await import('./src/main/electronProcess.js')
    await electronProcess()
  }

  log.info(`App started in ${isDev ? 'development' : 'production'} mode${isHeadless ? ' (headless)' : ''}.`);
})()
