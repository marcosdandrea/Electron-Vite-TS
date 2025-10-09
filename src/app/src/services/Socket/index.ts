import type { Server } from 'http';
import type socketIo from 'socket.io';
import { Log } from '@utils/log.js';

const log = new Log('socket', true);

const init = async ({ httpServer, cors}: { httpServer: Server, cors?: any }) => {

    return new Promise<socketIo.Server>(async (resolve, reject) => {
        try {

            const { Server } = await import("socket.io");
            const isIsolationEnabled = process.env.MAIN_SERVER_ISOLATION === 'true';
            
            // Configurar CORS basado en el aislamiento
            let corsConfig = {
                origin: "*",
                methods: ["GET", "POST"],
                ...(cors || {})
            };

            if (isIsolationEnabled) {
                log.info('Socket isolation enabled - only localhost connections allowed');
                corsConfig = {
                    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5123", "http://127.0.0.1:5123"],
                    methods: ["GET", "POST"],
                    ...(cors || {})
                };
            } else {
                log.info('Socket isolation disabled - all connections allowed');
            }

            const io = new Server(httpServer, {
                cors: corsConfig
            });

            // Middleware de conexión para verificar el origen si el aislamiento está habilitado
            if (isIsolationEnabled) {
                io.use((socket, next) => {
                    const clientAddress = socket.handshake.address;
                    const origin = socket.handshake.headers.origin;
                    
                    // Verificar si la conexión proviene de localhost
                    const isLocalhost = clientAddress === '::1' || 
                                       clientAddress === '127.0.0.1' || 
                                       clientAddress === '::ffff:127.0.0.1' ||
                                       (origin && (
                                           origin.includes('localhost') || 
                                           origin.includes('127.0.0.1')
                                       ));
                    
                    if (!isLocalhost) {
                        log.warn(`Rejected Socket.IO connection from ${clientAddress} with origin ${origin} - Server isolation is enabled`);
                        return next(new Error('Access denied: Server is configured to accept connections from localhost only'));
                    }
                    
                    log.info(`Accepted Socket.IO connection from ${clientAddress}`);
                    next();
                });
            }

            // Event listeners para monitorear conexiones
            io.on('connection', (socket) => {
                const clientAddress = socket.handshake.address;
                log.info(`Socket.IO client connected from ${clientAddress}`);
                
                socket.on('disconnect', () => {
                    log.info(`Socket.IO client disconnected from ${clientAddress}`);
                });
            });

            resolve(io);
        } catch (error) {
            reject(error);
        }
    });
};

export { init };