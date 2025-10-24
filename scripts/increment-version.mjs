import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el directorio raíz
const rootDir = join(__dirname, '..');
dotenv.config({ path: join(rootDir, '.env') });

// Leer la bandera
const shouldIncrement = process.env.INCREMENT_PATCH_VERSION_ON_BUILD === 'true';

if (!shouldIncrement) {
    console.log('[increment-version] INCREMENT_PATCH_VERSION_ON_BUILD is disabled. Skipping version increment.');
    process.exit(0);
}

try {
    // Leer package.json desde el directorio raíz
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Obtener la versión actual
    const currentVersion = packageJson.version;
    const versionParts = currentVersion.split('.');

    if (versionParts.length !== 3) {
        throw new Error(`Invalid version format: ${currentVersion}. Expected format: major.minor.patch`);
    }

    // Incrementar el patch
    const major = parseInt(versionParts[0]);
    const minor = parseInt(versionParts[1]);
    const patch = parseInt(versionParts[2]) + 1;

    const newVersion = `${major}.${minor}.${patch}`;

    // Actualizar package.json
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');

    console.log(`[increment-version] Version incremented: ${currentVersion} → ${newVersion}`);
    process.exit(0);
} catch (error) {
    console.error('[increment-version] Error incrementing version:', error.message);
    process.exit(1);
}
