
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getLogDirectory } from './pathResolver';
import { env } from './envLoader';

const WRITE_LOG_TO_FILE = env.WRITE_LOGS_TO_FILE;
const WRITE_LOG_LEVEL = env.WRITE_LOG_LEVEL;
const WRITE_LOG_MAX_FILE_COUNT = 50;

const WRITE_LOG_DIR_PATH = getLogDirectory();

export class Log {
    source: string;
    verbose: boolean;

    constructor(source: string, verbose: boolean = false) {
        this.source = source;
        this.verbose = verbose;
        
        // Crear directorio de logs siempre
        this.ensureLogDirectory();
        
        // Mostrar la ubicación de logs solo para el primer logger creado
        if (source === 'main') {
            const absolutePath = path.resolve(WRITE_LOG_DIR_PATH);
            const isDev = env.NODE_ENV === 'development';
            console.log(`[${source}] Environment: ${isDev ? 'development' : 'production'}`);
            console.log(`[${source}] Executable path: ${process.execPath}`);
            console.log(`[${source}] Working directory: ${process.cwd()}`);
            console.log(`[${source}] Logs directory: ${absolutePath}`);
            console.log(`[${source}] Write logs to file: ${WRITE_LOG_TO_FILE}`);
        }
    }

    private ensureLogDirectory(): void {
        if (!fs.existsSync(WRITE_LOG_DIR_PATH)) {
            fs.mkdirSync(WRITE_LOG_DIR_PATH, { recursive: true });
        }
    }

    private getCurrentLogFileName(): string {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}-${month}-${year}.log`;
    }

    private getCurrentLogFilePath(): string {
        return path.join(WRITE_LOG_DIR_PATH, this.getCurrentLogFileName());
    }

    private manageLogFiles(): void {
        try {
            const files = fs.readdirSync(WRITE_LOG_DIR_PATH)
                .filter(file => file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(WRITE_LOG_DIR_PATH, file),
                    stats: fs.statSync(path.join(WRITE_LOG_DIR_PATH, file))
                }))
                .sort((a, b) => a.stats.mtime.getTime() - b.stats.mtime.getTime());

            // Eliminar archivos antiguos si excede el límite
            while (files.length > WRITE_LOG_MAX_FILE_COUNT) {
                const oldestFile = files.shift();
                if (oldestFile) {
                    fs.unlinkSync(oldestFile.path);
                }
            }
        } catch (error) {
            console.error('Error managing log files:', error);
        }
    }

    private writeToFile(level: string, message: string, ...args: any[]): void {
        if (!WRITE_LOG_TO_FILE) return;

        try {
            // Verificar nivel de log
            const levels = ['debug', 'info', 'warn', 'error'];
            const currentLevelIndex = levels.indexOf(WRITE_LOG_LEVEL.toLowerCase());
            const messageLevelIndex = levels.indexOf(level.toLowerCase());
            
            if (messageLevelIndex < currentLevelIndex) return;

            const timestamp = new Date().toISOString();
            const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ') : '';
            
            const logEntry = `${timestamp} [${level.toUpperCase()}] [${this.source}] ${message}${formattedArgs}\n`;
            
            // Gestionar archivos antes de escribir
            this.manageLogFiles();
            
            // Escribir al archivo
            fs.appendFileSync(this.getCurrentLogFilePath(), logEntry, 'utf8');
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.verbose) {
            console.log(`[${this.source}] ${message}`, ...args);
        }
        this.writeToFile('info', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[${this.source}] ${message}`, ...args);
        this.writeToFile('warn', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`[${this.source}] ${message}`, ...args);
        this.writeToFile('error', message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (this.verbose) {
            console.debug(`[${this.source}] ${message}`, ...args);
        }
        this.writeToFile('debug', message, ...args);
    }

    // Método público para obtener la ruta absoluta de logs
    getLogDirectory(): string {
        return path.resolve(WRITE_LOG_DIR_PATH);
    }

    // Método público para obtener la ruta del archivo de log actual
    getCurrentLogFile(): string {
        return path.resolve(this.getCurrentLogFilePath());
    }
}