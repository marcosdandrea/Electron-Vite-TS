import type { Server } from 'http';
import type socketIo from 'socket.io';
import { Log } from '@utils/log.js';
import { env } from '@utils/envLoader.js';
import { contextIsolationMiddleware } from './middlewares/isolation.middleware';
import { authenticationMiddleware } from './middlewares/authentication.middleware';
import { channelsMiddleware } from './middlewares/channels.middleware';

const log = new Log('socket', true);

const init = async ({ httpServer, cors }: { httpServer: Server, cors?: any }) => {

    return new Promise<socketIo.Server>(async (resolve, reject) => {
        try {

            const { Server } = await import("socket.io");
            const isIsolationEnabled = false; // No hay MAIN_SERVER_ISOLATION en env
            const isContextIsolationEnabled = env.USE_CONTEXT_ISOLATION;

            // Configurar CORS basado en el aislamiento
            let corsConfig = {
                origin: "*",
                methods: ["GET", "POST"],
                ...(cors || {})
            };

            if (isIsolationEnabled || isContextIsolationEnabled) {

                if (isContextIsolationEnabled)
                    log.info('Context isolation enabled - only authorized clients on localhost are allowed');
                else 
                    log.info('Socket isolation enabled - only localhost connections allowed');

                corsConfig = {
                    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5123", "http://127.0.0.1:5123"],
                    methods: ["GET", "POST"],
                    ...(cors || {})
                };
            } else {
                log.info('Socket isolation disabled - all connections allowed');
            }

            const io = new Server(httpServer, {cors: corsConfig});          

            //para autenticar usuarios de aplicación
            io.use(authenticationMiddleware)
            io.use(channelsMiddleware)

            io.on('connection', (socket) => {
                contextIsolationMiddleware(socket, () => {
                    log.info(`Socket client connected: ${socket.id}`);
                });
            });

            resolve(io);
        } catch (error) {
            reject(error);
        }
    });
};

export { init };