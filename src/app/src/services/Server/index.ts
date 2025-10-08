
import type { Express } from 'express';
import type { Server } from 'http';

interface ServerParams {
    serverPort: number;
    staticDir?: string;
}

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
            
            // Servir archivos estáticos si se proporciona un directorio
            if (staticDir) {
                app.use(express.static(staticDir));
            }

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
