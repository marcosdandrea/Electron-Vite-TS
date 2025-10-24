import APP_TOKENS from '@common/tokens/app.tokens';
import { Log } from '@utils/log.js';
import { env } from '@utils/envLoader.js';
import { Socket, ExtendedError } from 'socket.io';

const log = new Log('SocketIsolationMiddleware', true);
const useContextIsolation = env.USE_CONTEXT_ISOLATION;

export const contextIsolationMiddleware = async (socket: Socket, next: (middleware: Socket | Error) => void) => {
    console.log (`New client connected: ${socket.id}`);

    if (!useContextIsolation) {
        return next(socket);
    }

    // Obtenemos información de la ruta desde el cliente (React Router)
    const clientPath = socket.handshake.auth?.currentPath || socket.handshake.query?.currentPath;
    const referer = socket.handshake.headers.referer || '';
    const url = socket.handshake.url || '';
    const origin = socket.handshake.headers.origin || '';
    
    // Usamos la ruta enviada por el cliente, fallback a extraer del referer
    let currentPath = '/';
    if (clientPath && typeof clientPath === 'string') {
        currentPath = clientPath;
    } else {
        try {
            if (referer) {
                const refererUrl = new URL(referer);
                currentPath = refererUrl.pathname;
            }
        } catch (error) {
            log.warn('Could not parse referer URL, defaulting to root path');
        }
    }

    // Definimos rutas públicas que no requieren autenticación
    const publicPaths = ['/public', '/about'];
    const isPublicPath = publicPaths.includes(currentPath);

    if (isPublicPath) {
        log.info(`Public path accessed: ${currentPath} - allowing connection without auth`);
        return next(socket);
    }

    log.info(`Socket connection attempt from endpoint: ${socket.handshake.address}, Current path: ${currentPath}, URL: ${url}, Origin: ${origin}`);


    //chequeamos que el payload tenga el token de autenticación para rutas protegidas
    const authToken = socket.handshake.auth?.authToken;

    const {TokenManager} = await import('@services/TokenManager/index.js');
    const tokenManager = TokenManager.getInstance();
    const validToken = tokenManager.validateToken(APP_TOKENS.AUTH_TOKEN, authToken);
    
    if (!validToken) {
        log.warn(`Context isolation enabled - invalid auth token for protected path: ${currentPath}`);
        socket.disconnect();
        return next(new Error('Unauthorized'));
    }

    log.info(`Context isolation enabled - valid auth token for protected path: ${currentPath}`);


    next(socket);
};