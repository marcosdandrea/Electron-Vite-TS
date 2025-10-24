import { Log } from '@utils/log.js';
import { Request, Response, NextFunction } from 'express';

const log = new Log('ServerIsolationMiddleware', true);
const useContextIsolation = process.env.USE_CONTEXT_ISOLATION === 'true';
const defaultPublicEndpoints = ['/assets'];
const publicEndpoints = process.env.PUBLIC_ENDPOINTS ? 
    process.env.PUBLIC_ENDPOINTS
      .replace("[", "")
      .replace("]", "")
      .split(',') 
      .concat(defaultPublicEndpoints)
    : [...defaultPublicEndpoints];

log.info(`Context Isolation Middleware initialized - ${useContextIsolation ? 'enabled' : 'disabled'}`);
if (useContextIsolation) {
  log.info(`Public endpoints: ${publicEndpoints.length > 0 ? publicEndpoints.join(', ') : 'None'}`);
}

export const contextIsolationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Si el aislamiento está deshabilitado, permitir todas las conexiones
  if (!useContextIsolation) {
    log.info(`Context Isolation is disabled - allowing all connections`);
    return next();
  }

  // Detectar si la request viene de Electron
  const userAgent = req.get('User-Agent') || '';
  const customElectronHeader = req.get('x-electron');
  const origin = req.get('Origin') || '';

  const isElectron = userAgent.includes('Electron') || 
                    customElectronHeader === 'true' 

  // Log de información de la request
  log.info(`HTTP Request from: ${req.ip}, User-Agent: ${userAgent}, Origin: ${origin}, Path: ${req.path}`);

  // Verificar si es un endpoint público (permitir subdirectorios)
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.path === endpoint || req.path.startsWith(endpoint + '/')
  );
  
  // Si NO es Electron, denegar el acceso
  if (!isElectron && !isPublicEndpoint) {
    log.warn(`Access denied to path: ${req.path} from IP: ${req.ip} - Not an app client`);
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Only app clients are allowed' 
    });
  }

  log.info(`HTTP Request authorized from ${isElectron ? 'app' : 'public endpoint'} - Path: ${req.path}, IP: ${req.ip}`);
  next();
};