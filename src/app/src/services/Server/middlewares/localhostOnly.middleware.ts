import { Log } from '@utils/log.js';

const log = new Log('LocalhostOnlyMiddleware', true); 
 
 // Middleware para verificar si las solicitudes provienen de localhost
export const useOnlyLocalhost = (req: any, res: any, next: any) => {
    
    const isLocalhostOnly = process.env.LOCALHOST_ONLY === 'true';

    if (!isLocalhostOnly) {
        return next();
    }

    const remoteAddress = req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
    const isLocalhost = remoteAddress === '::1' || 
                       remoteAddress === '127.0.0.1' || 
                       remoteAddress === '::ffff:127.0.0.1' ||
                       req.hostname === 'localhost' ||
                       req.hostname === '127.0.0.1';
    
    if (!isLocalhost) {
        log.warn(`Rejected request from ${remoteAddress} - Server isolation is enabled`);
        return res.status(403).json({ 
            error: 'Access denied', 
            message: 'Server is configured to accept connections from localhost only' 
        });
    }
    
    next();
};