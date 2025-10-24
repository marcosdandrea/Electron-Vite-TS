# 📘 Documentación Completa del Boilerplate Electron-Vite-TS

## 🎯 Descripción General

Este boilerplate proporciona una arquitectura completa para aplicaciones Electron con React, TypeScript, Vite, Express y Socket.IO. Su característica principal es la **capacidad de ejecutarse en dos modos diferentes**: como una aplicación de escritorio tradicional (Electron) o como un servidor headless (sin interfaz gráfica).

### Características Principales

- ⚡ **Vite** - Desarrollo ultra rápido con HMR (Hot Module Replacement)
- 🖥️ **Electron** - Aplicaciones de escritorio multiplataforma
- ⚛️ **React 18** - UI moderna con TypeScript
- 🌐 **Express Server** - Servidor HTTP integrado
- 🔌 **Socket.IO** - Comunicación en tiempo real
- 🔒 **Sistema de Seguridad** - Múltiples capas de protección
- 📝 **Sistema de Logs** - Registro detallado de eventos
- 🎭 **Modo Dual** - Electron o Headless
- 🔐 **Autenticación** - Sistema de tokens integrado

---

## 🔧 Variables de Entorno (.env)

El archivo `.env` es el corazón de la configuración del boilerplate. Cada bandera controla aspectos específicos del comportamiento de la aplicación.

### 📱 APP - Configuración de Aplicación

#### `USE_AUTHENTICATION`
```env
USE_AUTHENTICATION=true
```

**Tipo:** Boolean (`true` | `false`)

**Propósito:** Activa o desactiva el sistema de autenticación mediante tokens.

**Funcionamiento:**
- Cuando está en `true`:
  - Se genera un token único al iniciar el servidor
  - Las conexiones de Socket.IO requieren este token para autenticarse
  - El middleware de autenticación valida cada conexión
  - Se registran logs de intentos de conexión autorizados/denegados
  
- Cuando está en `false`:
  - Las conexiones Socket.IO se aceptan sin validación
  - No se genera token de autenticación
  - **⚠️ Solo recomendado para desarrollo local**

**Uso en código:**
```typescript
// El TokenManager genera y valida tokens
const tokenManager = TokenManager.getInstance();
const token = tokenManager.generateToken(APP_TOKENS.AUTH_TOKEN);
```

---

### 🔒 SECURITY - Configuración de Seguridad

#### `LOCALHOST_ONLY`
```env
LOCALHOST_ONLY=true
```

**Tipo:** Boolean (`true` | `false`)

**Propósito:** Restringe el acceso al servidor para que solo acepte conexiones desde localhost.

**Funcionamiento:**
- Cuando está en `true`:
  - El middleware `useOnlyLocalhost` valida cada request HTTP
  - Solo permite conexiones desde:
    - `127.0.0.1`
    - `::1` (localhost IPv6)
    - `::ffff:127.0.0.1`
    - hostname `localhost`
  - Responde con 403 Forbidden a conexiones externas
  - Registra intentos de conexión rechazados

- Cuando está en `false`:
  - Acepta conexiones desde cualquier IP
  - **⚠️ Usar con precaución en producción**

**Casos de uso:**
- ✅ Desarrollo local
- ✅ Aplicaciones Electron de escritorio
- ⚠️ Servidores headless en entornos controlados
- ❌ Aplicaciones web públicas (usar configuración adicional)

---

#### `USE_CONTEXT_ISOLATION`
```env
USE_CONTEXT_ISOLATION=true
```

**Tipo:** Boolean (`true` | `false`)

**Propósito:** Implementa aislamiento de contexto, permitiendo solo conexiones desde clientes autorizados (principalmente Electron).

**Funcionamiento:**
- Cuando está en `true`:
  - Valida que las requests HTTP provengan de clientes Electron
  - Detecta mediante:
    - User-Agent (busca la palabra "Electron")
    - Header personalizado `x-electron: true`
  - Permite endpoints públicos definidos en `PUBLIC_ENDPOINTS`
  - Bloquea navegadores web normales (excepto endpoints públicos)
  - Registra todos los intentos de acceso

- Cuando está en `false`:
  - Permite acceso desde cualquier cliente
  - Los navegadores web pueden acceder a todos los endpoints

**Interacción con autenticación:**
```typescript
// Si USE_CONTEXT_ISOLATION=true, se genera un token automáticamente
if (useContextIsolation) {
    const tokenManager = TokenManager.getInstance();
    tokenManager.generateToken(APP_TOKENS.AUTH_TOKEN);
}
```

**Casos de uso:**
- ✅ Proteger APIs internas de la aplicación
- ✅ Prevenir acceso directo desde navegadores
- ✅ Aplicaciones que requieren ejecutarse solo en Electron

---

#### `PUBLIC_ENDPOINTS`
```env
PUBLIC_ENDPOINTS=[/public,/api/config]
```

**Tipo:** Array de strings (formato: `[/ruta1,/ruta2]`)

**Propósito:** Define qué rutas son accesibles públicamente incluso con `USE_CONTEXT_ISOLATION=true`.

**Funcionamiento:**
- Los endpoints listados son accesibles desde cualquier cliente (navegadores incluidos)
- Los endpoints **siempre públicos** por defecto:
  - `/assets` - Archivos estáticos (CSS, JS, imágenes)
- Soporta rutas exactas y con subdirectorios:
  ```typescript
  // Verifica ruta exacta o que comience con el endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.path === endpoint || req.path.startsWith(endpoint + '/')
  );
  ```

**Ejemplos:**
```env
# Solo una ruta pública
PUBLIC_ENDPOINTS=[/public]

# Múltiples rutas públicas
PUBLIC_ENDPOINTS=[/public,/api/health,/docs]

# Sin rutas públicas (solo assets)
PUBLIC_ENDPOINTS=[]
```

**Casos de uso:**
- Páginas de login públicas
- Endpoints de health check
- Documentación de API
- Recursos compartibles externamente

---

### 🚀 DEVELOPMENT - Configuración de Desarrollo

#### `VITE_DEV_PORT`
```env
VITE_DEV_PORT=5123
```

**Tipo:** Number (1024-65535)

**Propósito:** Define el puerto en el que Vite Dev Server ejecuta la interfaz de usuario durante el desarrollo.

**Funcionamiento:**
- En modo desarrollo (`npm run dev:electron` o `npm run dev:headless`):
  - Vite inicia el servidor de desarrollo en este puerto
  - Soporta Hot Module Replacement (HMR)
  - La aplicación Electron o el navegador apuntan a este puerto
  
**⚠️ Nota importante:**
```
"VITE_DEV_PORT requiere modificaciones adicionales en la ui para funcionar"
```
- Requiere configuración en `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5123,
    strictPort: true,
  }
})
```

**Casos de uso:**
- Evitar conflictos con otros servicios en puerto 5173 (default de Vite)
- Desarrollo con múltiples proyectos simultáneos
- Configuraciones de red específicas

---

#### `INCREMENT_PATCH_VERSION_ON_BUILD`
```env
INCREMENT_PATCH_VERSION_ON_BUILD=true
```

**Tipo:** Boolean (`true` | `false`)

**Propósito:** Incrementa automáticamente la versión patch del `package.json` en cada build de distribución.

**Funcionamiento:**
- Cuando está en `true`:
  - Script `increment-version.mjs` se ejecuta antes de cada `dist:*`
  - Lee la versión actual del `package.json`
  - Incrementa el tercer número (patch): `1.0.5` → `1.0.6`
  - Guarda el nuevo `package.json`
  - Continúa con el build

- Cuando está en `false`:
  - La versión permanece sin cambios
  - Útil para builds de prueba

**Versionamiento Semántico:**
```
MAJOR.MINOR.PATCH
  1  .  0  .  5

PATCH (+1 automático) - Bug fixes, cambios menores
MINOR (manual) - Nuevas features compatibles
MAJOR (manual) - Breaking changes
```

**Logs:**
```bash
[increment-version] Version incremented: 1.0.5 → 1.0.6
```

**Casos de uso:**
- ✅ Builds automáticos con versionamiento
- ✅ CI/CD pipelines
- ❌ Desarrollo local (dejar en `false`)

---

### 🌐 SERVER - Configuración del Servidor

#### `MAIN_SERVER_PORT`
```env
MAIN_SERVER_PORT=3000
```

**Tipo:** Number (1024-65535)

**Propósito:** Puerto en el que Express Server y Socket.IO escuchan las conexiones.

**Funcionamiento:**
- Tanto el servidor HTTP como Socket.IO usan este puerto
- Disponible en toda la aplicación mediante:
```typescript
import { env } from '@utils/envLoader.js';
const MAIN_SERVER_PORT = env.MAIN_SERVER_PORT;
```

**Arquitectura:**
```
Cliente → http://localhost:3000 → Express Server
                                   ↓
                                Socket.IO
```

**Endpoints automáticos:**
- `GET /` - Página principal (index.html o mensaje de servidor)
- `GET /api/config` - Configuración del servidor:
```json
{
  "serverPort": 3000,
  "isolation": true,
  "mode": "electron" // o "headless"
}
```

**Casos de uso:**
- Cambiar puerto por conflictos con otros servicios
- Configuración por entorno (dev/prod)
- Múltiples instancias de la aplicación

---

### 📝 LOGGING - Configuración de Logs

#### `WRITE_LOG_TO_FILE`
```env
WRITE_LOG_TO_FILE=true
```

**Tipo:** Boolean (`true` | `false`)

**Propósito:** Activa o desactiva la escritura de logs en archivos del sistema.

**Funcionamiento:**
- Cuando está en `true`:
  - Crea directorio `logs/` automáticamente
  - Genera un archivo por día: `DD-MM-YYYY.log`
  - Mantiene los últimos 50 archivos (configurable)
  - Escribe logs en formato:
    ```
    2025-10-24T10:30:45.123Z [INFO] [server] Server initialized on port 3000
    ```

- Cuando está en `false`:
  - Solo muestra logs en consola
  - No guarda archivos

**Gestión automática:**
```typescript
// El sistema mantiene máximo 50 archivos
private manageLogFiles(): void {
    while (files.length > WRITE_LOG_MAX_FILE_COUNT) {
        fs.unlinkSync(oldestFile.path); // Elimina el más antiguo
    }
}
```

**Ubicación de logs:**
- **Desarrollo:** `./logs/` (raíz del proyecto)
- **Producción (Electron):** Junto al ejecutable
- **Producción (Headless):** `./logs/` (donde se ejecute)

**Casos de uso:**
- ✅ Debugging en producción
- ✅ Auditoría de eventos
- ✅ Análisis de errores históricos
- ❌ Desarrollo activo (puede generar muchos archivos)

---

#### `WRITE_LOG_LEVEL`
```env
WRITE_LOG_LEVEL=info
```

**Tipo:** String (`debug` | `info` | `warn` | `error`)

**Propósito:** Define el nivel mínimo de logs que se escribirán en archivos.

**Jerarquía de niveles:**
```
debug → info → warn → error
  ↓      ↓      ↓      ↓
 Todo   Normal Avisos Errores
```

**Comportamiento por nivel:**

| Nivel | Escribe | Casos de uso |
|-------|---------|--------------|
| `debug` | debug, info, warn, error | Desarrollo profundo, debugging detallado |
| `info` | info, warn, error | Producción normal, monitoreo general |
| `warn` | warn, error | Atención a warnings importantes |
| `error` | solo error | Solo errores críticos |

**Uso en código:**
```typescript
const log = new Log('MyService', true);

log.debug('Detalles técnicos'); // Solo si level=debug
log.info('Operación normal');   // Si level=debug|info
log.warn('Advertencia');         // Si level=debug|info|warn
log.error('Error crítico');      // Siempre se escribe
```

**Ejemplo de salida:**
```log
# WRITE_LOG_LEVEL=info
2025-10-24T10:30:45.123Z [INFO] [server] Server initialized on port 3000
2025-10-24T10:30:46.456Z [WARN] [socket] Rejected unauthorized connection
2025-10-24T10:30:47.789Z [ERROR] [database] Connection failed

# WRITE_LOG_LEVEL=error (solo el error se escribe)
2025-10-24T10:30:47.789Z [ERROR] [database] Connection failed
```

**Recomendaciones:**
- **Desarrollo:** `debug` - Ver todo
- **Producción:** `info` - Balance entre información y performance
- **Producción crítica:** `warn` o `error` - Reducir I/O

---

## 🎭 Modos de Distribución

El boilerplate soporta dos modos de ejecución completamente diferentes, cada uno con su propósito específico.

### 🖥️ Modo Electron (Aplicación de Escritorio)

**Descripción:** Aplicación completa de escritorio con interfaz gráfica, servidor Express integrado y Socket.IO.

#### Características:
- ✅ Ventana de Electron con UI React
- ✅ Servidor Express interno
- ✅ Socket.IO para comunicación
- ✅ Menú de aplicación
- ✅ Bandeja del sistema (opcional)
- ✅ Autoactualización (opcional)
- ✅ Acceso completo al sistema (filesystem, etc.)

#### Comandos:

```bash
# Desarrollo con hot reload
npm run dev:electron

# Build de distribución
npm run dist:win    # Windows (NSIS + portable)
npm run dist:mac    # macOS (DMG, ARM64)
npm run dist:linux  # Linux (AppImage)
```

#### Proceso de Build:
1. **Incrementa versión** (si `INCREMENT_PATCH_VERSION_ON_BUILD=true`)
2. **Limpia distribuciones** anteriores
3. **Transpila Electron** (`build:electron` → `dist-electron/`)
   - Compila TypeScript con esbuild
   - Bundle de `main.ts` y `preload.ts`
   - Excluye módulos nativos de Electron
4. **Build UI** (`build:vite` → `dist-ui/`)
   - Compila React con Vite
   - Optimiza assets (minify, tree-shaking)
5. **Empaqueta con electron-builder**
   - Crea instaladores nativos
   - Incluye: `dist-electron/`, `dist-ui/`, `.env`
   - Aplica iconos por plataforma
   - Genera archivos en `dist/`

#### Estructura del ejecutable:
```
MiApp.exe (o .app / .AppImage)
├── dist-electron/
│   ├── main.js
│   └── preload.js
├── dist-ui/
│   ├── index.html
│   └── assets/
└── .env
```

#### Flujo de ejecución:
```
1. Usuario ejecuta MiApp.exe
2. main.js → Inicia Electron
3. ioProcesses() → Levanta Express (puerto 3000) y Socket.IO
4. electronProcess() → Crea BrowserWindow
5. Ventana carga → http://localhost:3000 (dist-ui/index.html)
6. appProcess() → Lógica de negocio de la aplicación
```

#### Configuración (electron-builder.json):
```json
{
  "appId": "com.marcosdandrea.boilerplate",
  "productName": "Boilerplate",
  "files": ["dist-electron", "dist-ui", ".env"],
  "asar": true, // Empaquetado en ASAR
  "win": {
    "target": ["nsis", "dir"] // Instalador + portable
  }
}
```

---

### 🔧 Modo Headless (Servidor Sin UI)

**Descripción:** Servidor Node.js puro que ejecuta Express y Socket.IO sin interfaz gráfica de Electron. Ideal para servicios backend, APIs y servidores.

#### Características:
- ✅ Solo servidor Express + Socket.IO
- ✅ Sin dependencias de Electron
- ✅ Menor consumo de recursos
- ✅ Ejecutable Node.js estándar
- ✅ Ideal para servidores remotos
- ✅ Puede servir la UI como SPA
- ❌ Sin ventanas ni UI nativa

#### Comandos:

```bash
# Desarrollo headless
npm run dev:headless

# Build headless
npm run build:headless

# Distribución completa
npm run dist:headless
```

#### Proceso de Build:
1. **Incrementa versión**
2. **Limpia distribución**
3. **Build UI** (Vite)
4. **Transpila con headless config** (`build-headless.mjs` → `dist/headless/`)
   - Define `process.env.HEADLESS="true"`
   - Excluye Electron completamente
   - Minifica código (`minify: true`)
   - Tree-shaking agresivo
5. **Copia archivos necesarios**
   - `headless-package.json` → `dist/headless/package.json`
   - `dist-ui/` → `dist/headless/dist-ui/`
   - `.env` (manual o script)

#### Estructura del build:
```
dist/headless/
├── main.js              # Servidor compilado
├── package.json         # Dependencias mínimas
├── dist-ui/             # UI estática (opcional)
│   ├── index.html
│   └── assets/
└── .env
```

#### Ejecución en producción:
```bash
# 1. Navegar al directorio
cd dist/headless

# 2. Instalar dependencias (solo producción)
npm install --production

# 3. Iniciar servidor
npm start  # O: node main.js
```

#### headless-package.json:
```json
{
  "name": "boilerplate-headless",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  },
  "dependencies": {
    "dotenv": "^16.5.0"  // Solo dependencias runtime
  }
}
```

#### Flujo de ejecución:
```
1. node main.js
2. Lee .env → Carga configuración
3. isHeadless = true → Salta electronProcess()
4. ioProcesses() → Express + Socket.IO
5. Servidor escucha en MAIN_SERVER_PORT
6. Opcional: Sirve dist-ui/ como SPA
```

#### Variables de entorno específicas:
```env
# Configuración headless
HEADLESS=true
MAIN_SERVER_PORT=3000
LOCALHOST_ONLY=false     # Para acceso remoto
USE_CONTEXT_ISOLATION=false  # No hay Electron
```

---

### 📊 Comparación Electron vs Headless

| Aspecto | Electron | Headless |
|---------|----------|----------|
| **UI** | Ventana nativa de escritorio | Solo servidor HTTP (opcional SPA) |
| **Tamaño** | ~150-300 MB | ~5-20 MB |
| **Inicio** | 2-5 segundos | <1 segundo |
| **Memoria** | 150-500 MB | 30-100 MB |
| **Electron APIs** | ✅ Disponibles | ❌ No disponibles |
| **Filesystem** | ✅ Acceso completo | ✅ Solo Node.js |
| **Distribución** | Instaladores (.exe, .dmg) | Archivo + node_modules |
| **Updates** | electron-builder | Manual o PM2 |
| **Casos de uso** | Apps de escritorio | APIs, servidores, servicios |

---

### 🚦 Detección del Modo en Código

El código detecta automáticamente en qué modo está ejecutándose:

```typescript
// src/app/main.ts
const isHeadless = process.env.HEADLESS === 'true';

if (!isHeadless) {
    // Solo en Electron: crear ventanas
    const {electronProcess} = await import('./src/main/electronProcess.js');
    await electronProcess();
}

// Siempre: iniciar servidor
const {ioProcesses} = await import('./src/main/ioProcesses.js');
await ioProcesses();
```

---

## 🏗️ Arquitectura del Sistema

### 📂 Estructura de Procesos

La aplicación se divide en tres procesos principales:

#### 1️⃣ **ioProcesses** (I/O Processes)
```typescript
// src/app/src/main/ioProcesses.ts
```
**Responsabilidad:** Inicializar servidor Express y Socket.IO

**Secuencia:**
1. Obtener puerto del servidor (`MAIN_SERVER_PORT`)
2. Determinar directorio estático (dev: Vite, prod: dist-ui)
3. Inicializar Express Server
4. Inicializar Socket.IO sobre el HTTP Server
5. Registrar listeners de Socket.IO

**Se ejecuta en:** Ambos modos (Electron y Headless)

---

#### 2️⃣ **electronProcess** (Electron Process)
```typescript
// src/app/src/main/electronProcess.ts
```
**Responsabilidad:** Gestionar el ciclo de vida de Electron

**Secuencia:**
1. Esperar evento `app.ready`
2. Crear ventana principal (`WindowManager`)
3. Cargar URL del servidor (localhost:3000 o Vite dev)
4. Registrar listeners IPC
5. Manejar cierre de ventanas

**Se ejecuta en:** Solo modo Electron (`!isHeadless`)

---

#### 3️⃣ **appProcess** (Application Process)
```typescript
// src/app/src/main/appProcess.ts
```
**Responsabilidad:** Lógica de negocio de la aplicación

**Contenido:** Actualmente vacío - placeholder para:
- Tareas programadas (cron jobs)
- Procesamiento en background
- Inicialización de módulos de negocio
- Conexión a bases de datos
- Etc.

**Se ejecuta en:** Ambos modos

---

### 🔄 Flujo de Comunicación

```
┌─────────────────────────────────────────────────┐
│              React UI (Frontend)                │
│  - Componentes React                            │
│  - Contexts (IPC, Socket)                       │
│  - Hooks personalizados                         │
└─────────┬───────────────────────────┬───────────┘
          │ HTTP                      │ Socket.IO
          │                           │
┌─────────▼───────────────────────────▼───────────┐
│           Express Server (Backend)              │
│  - Middlewares de seguridad                     │
│  - API REST endpoints                           │
│  - Servidor de archivos estáticos               │
└─────────┬───────────────────────────┬───────────┘
          │                           │
          │                      ┌────▼─────┐
          │                      │ Socket.IO│
          │                      │  Server  │
          │                      └────┬─────┘
          │                           │
┌─────────▼───────────────────────────▼───────────┐
│         Electron Main Process (si !headless)    │
│  - Window Manager                               │
│  - IPC Handlers                                 │
│  - Sistema de archivos                          │
└─────────────────────────────────────────────────┘
```

---

### 🔐 Capas de Seguridad

El boilerplate implementa un sistema de seguridad en capas:

#### Capa 1: Localhost Only
```typescript
// middlewares/localhostOnly.middleware.ts
```
**Propósito:** Filtro más básico - solo localhost

**Configuración:** `LOCALHOST_ONLY=true`

**Validación:**
```typescript
const isLocalhost = remoteAddress === '::1' || 
                   remoteAddress === '127.0.0.1' || 
                   remoteAddress === '::ffff:127.0.0.1';
```

**Respuesta:** 403 si no es localhost

---

#### Capa 2: Context Isolation
```typescript
// middlewares/isolation.middleware.ts
```
**Propósito:** Solo clientes autorizados (Electron)

**Configuración:** `USE_CONTEXT_ISOLATION=true`

**Validación:**
```typescript
// Detectar Electron
const isElectron = userAgent.includes('Electron') || 
                  customElectronHeader === 'true';

// Permitir endpoints públicos
const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.path.startsWith(endpoint)
);

if (!isElectron && !isPublicEndpoint) {
    return res.status(403).json({ error: 'Access denied' });
}
```

---

#### Capa 3: Authentication (Socket.IO)
```typescript
// middlewares/authentication.middleware.ts
```
**Propósito:** Validar tokens de autenticación en WebSocket

**Configuración:** `USE_AUTHENTICATION=true`

**Flujo:**
```typescript
// Cliente debe enviar token en handshake
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!USE_AUTHENTICATION) return next();
    
    if (tokenManager.validateToken(APP_TOKENS.AUTH_TOKEN, token)) {
        next(); // Conexión autorizada
    } else {
        next(new Error('Invalid token')); // Rechazada
    }
});
```

---

### 🔑 Sistema de Tokens

#### TokenManager (Singleton)
```typescript
// services/TokenManager/index.ts
```

**Métodos:**
```typescript
// Generar token único (nanoid)
generateToken(key: string): string

// Validar token
validateToken(key: string, token: string): boolean

// Obtener token existente
getToken(key: string): string | Error

// Revocar token
revokeToken(key: string): void
```

**Uso:**
```typescript
// En servidor (main)
const tokenManager = TokenManager.getInstance();
const authToken = tokenManager.generateToken(APP_TOKENS.AUTH_TOKEN);

// En cliente (React)
const token = await window.electron.getAuthToken();
socket.auth = { token };
socket.connect();
```

---

## 📝 Sistema de Logs

### Clase Log

**Ubicación:** `src/app/src/utils/log.ts`

**Instanciación:**
```typescript
const log = new Log('ServiceName', verbose);
// verbose = true → logs en consola también
// verbose = false → solo archivo (si WRITE_LOG_TO_FILE=true)
```

### Métodos Disponibles

```typescript
// Niveles de log
log.debug('Mensaje de debug', objeto);  // Más detallado
log.info('Información general', datos);  // Normal
log.warn('Advertencia', error);          // Atención
log.error('Error crítico', exception);   // Crítico

// Utilidades
log.getLogDirectory();     // Ruta absoluta de logs/
log.getCurrentLogFile();   // Ruta del archivo actual
```

### Formato de Logs

```log
2025-10-24T10:30:45.123Z [LEVEL] [source] Message {optional: "data"}
│                         │       │        │
│                         │       │        └─ Mensaje y datos
│                         │       └────────── Fuente (nombre del logger)
│                         └────────────────── Nivel (DEBUG/INFO/WARN/ERROR)
└──────────────────────────────────────────── Timestamp ISO 8601
```

### Gestión Automática de Archivos

- **1 archivo por día:** `24-10-2025.log`
- **Máximo 50 archivos** (más antiguos se eliminan)
- **Creación automática** del directorio `logs/`
- **Rotación silenciosa** (no afecta performance)

### Ubicaciones por Entorno

| Entorno | Ubicación |
|---------|-----------|
| **Desarrollo** | `./logs/` (raíz del proyecto) |
| **Electron (producción)** | Junto al .exe (`AppFolder/logs/`) |
| **Headless (producción)** | `./logs/` (donde se ejecute) |

---

## 🛠️ Configuración de TypeScript

El proyecto usa múltiples configuraciones de TypeScript para diferentes targets:

### tsconfig.json (Base)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@common/*": ["./src/common/*"],
      "@src/*": ["./src/app/src/*"],
      "@utils/*": ["./src/app/src/utils/*"]
    }
  }
}
```

### tsconfig-electron.json
Para compilación de Electron (main + preload)

### tsconfig-headless.json
Para compilación headless (sin Electron)

### tsconfig-vite.json
Para la UI React con Vite

---

## 📦 Scripts NPM Completos

### Desarrollo
```bash
# Solo UI (sin backend)
npm run dev:react

# Electron completo (UI + Backend)
npm run dev:electron

# Solo proceso Electron (requiere Vite corriendo)
npm run dev:electron:only

# Headless completo
npm run dev:headless

# Solo proceso headless (requiere Vite corriendo)
npm run dev:headless:only
```

### Build
```bash
# Build UI (Vite)
npm run build:vite

# Build Electron (esbuild)
npm run build:electron

# Build Headless (esbuild)
npm run build:headless
```

### Distribución
```bash
# Crear ejecutables
npm run dist:win      # Windows (.exe)
npm run dist:mac      # macOS (.dmg, ARM64)
npm run dist:linux    # Linux (.AppImage)
npm run dist:headless # Headless (dist/headless/)
```

### Limpieza
```bash
npm run clean:dist      # Borra dist/
npm run clean:electron  # Borra dist-electron/
npm run clean:headless  # Borra dist/headless/
```

### Utilidades
```bash
npm run increment:version  # Incrementa versión patch
npm run transpile:electron # Limpia + build Electron
npm run transpile:headless # Limpia + build Headless
```

---

## 🎯 Casos de Uso Recomendados

### ✅ Usar Modo Electron Cuando:
- Necesitas una aplicación de escritorio tradicional
- Requieres acceso completo al sistema de archivos
- Quieres menús nativos, notificaciones, bandejas
- La aplicación debe ejecutarse offline
- Necesitas empaquetado para distribución (instaladores)

**Ejemplos:**
- Editores de código
- Clientes de chat
- Herramientas de desarrollo
- Apps de productividad

---

### ✅ Usar Modo Headless Cuando:
- Solo necesitas un servidor backend/API
- La UI será un SPA accesible desde navegador
- Despliegue en servidores remotos (VPS, cloud)
- Necesitas menor consumo de recursos
- Arquitectura microservicios

**Ejemplos:**
- APIs REST
- Servidores de juegos
- Servicios de procesamiento
- Backends para apps móviles

---

## 🔒 Configuraciones de Seguridad Recomendadas

### Desarrollo Local
```env
USE_AUTHENTICATION=false
LOCALHOST_ONLY=true
USE_CONTEXT_ISOLATION=false
PUBLIC_ENDPOINTS=[/public]
```

### Producción Electron
```env
USE_AUTHENTICATION=true
LOCALHOST_ONLY=true
USE_CONTEXT_ISOLATION=true
PUBLIC_ENDPOINTS=[/public]
```

### Producción Headless (Servidor Privado)
```env
USE_AUTHENTICATION=true
LOCALHOST_ONLY=true
USE_CONTEXT_ISOLATION=false  # No hay Electron
PUBLIC_ENDPOINTS=[/api/health,/docs]
```

### Producción Headless (Servidor Público)
```env
USE_AUTHENTICATION=true
LOCALHOST_ONLY=false  # ⚠️ Permite acceso externo
USE_CONTEXT_ISOLATION=false
PUBLIC_ENDPOINTS=[/api/v1,/docs]
```

---

## 🚀 Próximos Pasos

### Para Empezar a Desarrollar:

1. **Clonar y configurar:**
```bash
git clone <repo>
cd Electron-Vite-TS
npm install
cp .env.example .env  # Configurar variables
```

2. **Desarrollo:**
```bash
# Opción 1: Todo en uno
npm run dev:electron

# Opción 2: Separado (dos terminales)
npm run dev:react        # Terminal 1
npm run dev:electron:only  # Terminal 2
```

3. **Personalizar:**
- Modificar `.env` según necesidades
- Editar `src/ui/` para la interfaz
- Agregar lógica en `src/app/src/services/`
- Implementar rutas en `src/app/src/services/Server/`

4. **Distribuir:**
```bash
# Electron
npm run dist:win  # o mac/linux

# Headless
npm run dist:headless
cd dist/headless
npm install --production
node main.js
```

---

## 📚 Recursos Adicionales

### Documentación de Dependencias:
- [Electron](https://www.electronjs.org/docs)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/docs/)
- [electron-builder](https://www.electron.build/)

### Herramientas de Desarrollo:
- [Electron DevTools](https://www.electronjs.org/docs/latest/tutorial/devtools-extension)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Socket.IO Admin UI](https://socket.io/docs/v4/admin-ui/)

---

## 🐛 Troubleshooting

### Problema: Puerto en uso
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución:** Cambiar `MAIN_SERVER_PORT` en `.env`

### Problema: Electron no abre ventana
**Verificar:**
1. `HEADLESS` no esté en `true`
2. Logs en consola (`[electronProcess]`)
3. Permisos de ejecución

### Problema: Socket.IO no conecta
**Verificar:**
1. `USE_AUTHENTICATION` y token válido
2. `USE_CONTEXT_ISOLATION` y headers correctos
3. CORS configurado en `init` de Socket.IO
4. Puerto correcto en cliente

### Problema: Logs no se crean
**Verificar:**
1. `WRITE_LOG_TO_FILE=true`
2. Permisos de escritura en `logs/`
3. `WRITE_LOG_LEVEL` apropiado

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Contribuir

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/usuario/repo/issues)
- **Email:** soporte@proyeccionesdigitales.com
- **Documentación:** Este archivo y código fuente

---

**Última actualización:** Octubre 2025  
**Versión del boilerplate:** 1.0.0  
**Autor:** Proyecciones Digitales
