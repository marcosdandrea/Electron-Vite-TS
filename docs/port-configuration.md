# Ejemplo de Configuración del Puerto del Servidor

Este ejemplo muestra cómo configurar diferentes puertos para el servidor y cómo el sistema se adapta automáticamente.

## Configuración en .env

```env
# Ejemplo 1: Puerto personalizado con aislamiento
MAIN_SERVER_PORT=8080
MAIN_SERVER_ISOLATION=true

# Ejemplo 2: Puerto estándar sin aislamiento  
MAIN_SERVER_PORT=3000
MAIN_SERVER_ISOLATION=false

# Ejemplo 3: Puerto alternativo para desarrollo
MAIN_SERVER_PORT=4000
MAIN_SERVER_ISOLATION=true
```

## Comportamiento del Sistema

### En Modo Desarrollo (Vite)
```bash
npm run dev:electron
```

1. **Vite Dev Server**: Corre en `http://localhost:5123`
2. **Backend Server**: Corre en el puerto configurado (ej: `http://localhost:8080`)
3. **Socket.IO**: Se conecta automáticamente al backend server consultando `/api/config`

### En Modo Producción
```bash
npm run dist:win
```

1. **Express Server**: Sirve tanto archivos estáticos como API en el puerto configurado
2. **Socket.IO**: Se conecta al mismo host y puerto de la aplicación

## API de Configuración

El servidor expone un endpoint para obtener su configuración:

```bash
GET http://localhost:{PUERTO}/api/config
```

**Respuesta:**
```json
{
  "serverPort": 8080,
  "isolation": true,
  "mode": "electron"
}
```

## Logs de Conexión

El sistema registra automáticamente las conexiones:

```
[socket] Socket isolation enabled - only localhost connections allowed
[socket] Socket.IO client connected from ::ffff:127.0.0.1
Socket.IO connecting to: http://localhost:8080
Socket connected to: http://localhost:8080
```

## Verificación de Puerto

Para verificar que el puerto se está aplicando correctamente:

1. **Cambiar el puerto en .env:**
   ```env
   MAIN_SERVER_PORT=9000
   ```

2. **Ejecutar el test:**
   ```bash
   npm run test:isolation
   ```

3. **Verificar los logs:**
   ```
   📡 Server Port: 9000
   🔒 Isolation Enabled: true
   🔧 Server Mode: electron
   ```

## Troubleshooting

### Socket.IO no se conecta
- Verificar que el puerto en `.env` coincide con el puerto del servidor
- Revisar los logs del navegador para ver la URL de conexión
- Verificar que no hay firewalls bloqueando el puerto

### Puerto en uso
```bash
Error: listen EADDRINUSE: address already in use :::8080
```
- Cambiar el puerto en `.env` a uno disponible
- Verificar qué proceso está usando el puerto: `netstat -ano | findstr :8080`

### Configuración no se aplica
- Reiniciar la aplicación después de cambiar `.env`
- Verificar que el archivo `.env` está en la raíz del proyecto
- Confirmar que no hay espacios en las variables de entorno