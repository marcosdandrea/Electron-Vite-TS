import { app } from 'electron';
import { Log } from '@utils/log.js';

const log = new Log('electronProcess', true);

const electronProcess = async () => {
    app.on('ready', async () => {

        const { createMainWindow } = await import('@domain/useCases/windowManager/index.js')
        await createMainWindow({
            enableMenuBar: false,
            /* 
            startFullscreen: false,
            defaultSize: { width: 300, height: 300 },
            defaultPosition: { x: 200, y: 200 } 
            */
        })

        log.info('App is ready');

    });

    app.on('window-all-closed', async () => {
        app.quit();
    })
}

export { electronProcess }
