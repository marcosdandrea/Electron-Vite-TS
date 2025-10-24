import { getStaticDir } from '@src/utils/pathResolver';
import { Log } from '@utils/log.js';
import { env } from '@utils/envLoader.js';
const log = new Log('coreProcesses', true);

const ioProcesses = async () => {
    log.info('Starting I/O processes...');
    try {

        const MAIN_SERVER_PORT = env.MAIN_SERVER_PORT;
        
        const { init: initServer } = await import('@services/Server/index.js')
        const staticDirectory = await getStaticDir();
        log.info(`Static directory: ${staticDirectory}`);
        
        const { httpServer } = await initServer({ 
            serverPort: MAIN_SERVER_PORT,
            staticDir: staticDirectory
        });
        log.info(`Server initialized on port ${MAIN_SERVER_PORT}`);

        const { init: initSocket } = await import('@services/Socket/index.js')
        const io = await initSocket({ httpServer });
        log.info('Socket initialized.');

        log.info('I/O processes started successfully.');
    } catch (error) {
        log.error('Error starting I/O processes:', error);
        throw error;
    }
}


export { ioProcesses }