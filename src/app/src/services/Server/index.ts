
import type { Express } from 'express';
import type { Server } from 'http';
import cors from 'cors';
import { Log } from '@utils/log.js';
import { env } from '@utils/envLoader.js';
import { useOnlyLocalhost } from './middlewares/localhostOnly.middleware';
import APP_TOKENS from '@common/tokens/app.tokens';
import { contextIsolationMiddleware } from './middlewares/isolation.middleware';

const log = new Log('server', true);

interface ServerParams {
    serverPort: number;
    staticDir?: string;
}

const init = async ({ serverPort, staticDir }: ServerParams) => {

    return new Promise<{ app: Express; httpServer: Server }>(async (resolve, reject) => {
        try {

            const useContextIsolation = env.USE_CONTEXT_ISOLATION;
            log.info(`Context Isolation is ${useContextIsolation ? 'enabled' : 'disabled'}`);

            const express = (await import("express")).default;
            const { createServer } = await import("http");
            const path = (await import('path')).default;

            const app = express();
            const httpServer = createServer(app);

            app.use(cors())
            app.use(express.json());
            app.use(express.urlencoded({ extended: true }));

            app.use(useOnlyLocalhost);
            app.use(contextIsolationMiddleware)

            if (useContextIsolation) {
                const {TokenManager} = await import('@services/TokenManager/index.js');
                const tokenManager = TokenManager.getInstance();
                tokenManager.generateToken(APP_TOKENS.AUTH_TOKEN)
            }
    
            // Servir archivos estáticos si se proporciona un directorio
            if (staticDir) {
                app.use(express.static(staticDir));
            }

            // API endpoint para obtener la configuración del servidor
            app.get('/api/config', (req, res) => {
                res.json({
                    serverPort: serverPort,
                    isolation: env.USE_CONTEXT_ISOLATION,
                    mode: process.env.HEADLESS === 'true' ? 'headless' : 'electron'
                });
            });


            app.get("/", (req, res) => {
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

            // Catch-all handler: send back React's index.html file for client-side routing
            // This must be the last route defined to catch all unmatched routes
            app.use((req, res) => {
                if (staticDir) {
                    res.sendFile(path.join(staticDir, 'index.html'), (err) => {
                        if (err) {
                            res.status(404).send(`
                                <h1>Server Running</h1>
                                <p>Static directory: ${staticDir}</p>
                                <p>No index.html found</p>
                                <p>Requested path: ${req.path}</p>
                            `);
                        }
                    });
                } else {
                    res.send(`
                        <h1>Headless Server Running</h1>
                        <p>Port: ${serverPort}</p>
                        <p>No static directory configured</p>
                        <p>Requested path: ${req.path}</p>
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
