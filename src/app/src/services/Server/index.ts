
import type { Express } from 'express';
import type { Server } from 'http';
import { Log } from '@utils/log.js';

const log = new Log('server', true);

interface ServerParams {
    serverPort: number;
    staticDir?: string;
}

// Middleware para verificar si las solicitudes provienen de localhost
const localhostOnlyMiddleware = (req: any, res: any, next: any) => {
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

const init = async ({ serverPort, staticDir }: ServerParams) => {

    return new Promise<{ app: Express; httpServer: Server }>(async (resolve, reject) => {
        try {
            
            const express = (await import("express")).default;
            const { createServer } = await import("http");
            const path = (await import('path')).default;
            
            const app = express();
            const httpServer = createServer(app);

            app.use(express.json());
            app.use(express.urlencoded({ extended: true }));

            // Aplicar middleware de aislamiento si está habilitado
            const isIsolationEnabled = process.env.MAIN_SERVER_ISOLATION === 'true';
            if (isIsolationEnabled) {
                log.info('Server isolation enabled - only localhost connections allowed');
                app.use(localhostOnlyMiddleware);
            } else {
                log.info('Server isolation disabled - all connections allowed');
            }
            
            // Servir archivos estáticos si se proporciona un directorio
            if (staticDir) {
                app.use(express.static(staticDir));
            }

            // API endpoint para obtener la configuración del servidor
            app.get('/api/config', (req, res) => {
                res.json({
                    serverPort: serverPort,
                    isolation: process.env.MAIN_SERVER_ISOLATION === 'true',
                    mode: process.env.HEADLESS === 'true' ? 'headless' : 'electron'
                });
            });

            // Ruta por defecto
            app.get('/', (req, res) => {
                if (staticDir) {
                    res.sendFile(path.join(staticDir, 'index.html'), (err) => {
                        if (err) {
                            res.status(404).send(`
                                <h1>Server Running</h1>
                                <p>Static directory: ${staticDir}</p>
                                <p>No index.html found</p>
                            `);
                        }
                    });
                } else {
                    res.send(`
                        <h1>Headless Server Running</h1>
                        <p>Port: ${serverPort}</p>
                        <p>No static directory configured</p>
                    `);
                }
            });

            httpServer.listen(serverPort, () => {
                resolve({ app, httpServer });
            });

            httpServer.on('error', (error: any) => {
                reject(error);
            });

        } catch (error) {
            reject(error)
        }
    })
}

export { init }
