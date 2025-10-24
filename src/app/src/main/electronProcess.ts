import { app } from 'electron';
import { Log } from '@utils/log.js';
import '@services/Ipc/index.js';

const log = new Log('electronProcess', true);

const electronProcess = async () => {
    app.on('ready', async () => {

        const { createMainWindow } = await import('@services/Windows/index.js')
        await createMainWindow()

        log.info('App is ready');

    });

    app.on('window-all-closed', async () => {
        app.quit();
    })
}

export { electronProcess }
