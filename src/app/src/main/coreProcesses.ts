import { getStaticDir } from '@src/utils/pathResolver';
import { Log } from '@utils/log.js';
const log = new Log('coreProcesses', true);

const coreProcesses = async () => {
    log.info('Starting core processes...');
    try {
        const MAIN_SERVER_PORT = process.env.MAIN_SERVER_PORT ? parseInt(process.env.MAIN_SERVER_PORT) : 3000;
        
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

        log.info('Core processes completed.');
    } catch (error) {
        log.error('Error in core processes:', error);
        throw error;
    }
}


export { coreProcesses }