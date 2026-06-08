// Cargar variables de entorno
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const hasDevFlag = process.argv.includes('--dev');
const isPackagedElectron = Boolean(process.versions.electron) && !process.defaultApp;

if (isPackagedElectron) {
  process.env.NODE_ENV = hasDevFlag ? 'development' : 'production';
  console.log(`[envLoader] Packaged mode detected. NODE_ENV forced to ${process.env.NODE_ENV}.`);
}

// Determinar el path del .env basado en si existe NODE_ENV
const isDev = process.env.NODE_ENV === 'development'
const envPath = isDev
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, "..", '.env');

const executableDir = process.env.PORTABLE_EXECUTABLE_DIR ?? path.dirname(process.execPath);
const configPath = path.join(executableDir, '.config');

console.log(`[envLoader] Base environment path: ${envPath}`);
console.log(`[envLoader] External config path: ${configPath}`);

// Base config from .env
dotenv.config({ path: envPath });

// External .config (next to executable) overrides .env when present
if (fs.existsSync(configPath)) {
  dotenv.config({ path: configPath, override: true });
  console.log('[envLoader] Loaded external .config with override enabled.');
}

// Validar variables de entorno (convirtiendo strings a los tipos correctos)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  USE_AUTHENTICATION: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  LOCALHOST_ONLY: z.string().transform(val => val === 'true').pipe(z.boolean()).default(true),
  USE_CONTEXT_ISOLATION: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  PUBLIC_ENDPOINTS: z.string().optional(),
  MAIN_SERVER_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(43123),
  VITE_DEV_PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number()).default(5123),
  PANEL_ACCESS_PASSWORD: z.string().default('change-me'),
  KIOSK_MODE: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  WRITE_LOGS_TO_FILE: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
  WRITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  INCREMENT_PATCH_VERSION_ON_BUILD: z.string().transform(val => val === 'true').pipe(z.boolean()).default(false),
});

const envValidation = envSchema.safeParse(process.env);
if (!envValidation.success) {
  console.error(`[envLoader] Invalid environment variables: ${JSON.stringify(envValidation.error.format())}`);
  process.exit(1);
}

// Exportar las variables validadas y tipadas
export const env = envValidation.data;

console.log(`[envLoader] USE_CONTEXT_ISOLATION loaded: ${env.USE_CONTEXT_ISOLATION}`);
