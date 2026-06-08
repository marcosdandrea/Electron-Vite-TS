# DOCUMENTATION

Detailed technical reference for Electron-Vite-TS.

Primary operational rules for agents are in AGENTS.md.
This file provides expanded architectural context.

## 1. Communication Model

The application uses socket-only communication between frontend and backend.

- No IPC contract is exposed to the renderer.
- Browser windows do not inject preload IPC APIs.
- Shared channel names are defined in `src/common/channels/app.channels.ts`.

### Channel Catalog

Current channels:

- `system:get-time`
- `main:get-content`
- `main:content-updated`
- `panel:authenticate`
- `panel:set-content`

## 2. Frontend Architecture

Core pieces:

- Socket provider: `src/ui/src/contexts/socket/index.tsx`
- Socket hook: `src/ui/src/hooks/useSocketChannel/index.tsx`
- Routing: `src/ui/src/components/Navigation/index.tsx`
- Main view: `src/ui/src/views/Main/index.tsx`
- Panel view: `src/ui/src/views/Panel/index.tsx`

Rules:

- Channel operations must be done via the socket hook.
- The hook must run inside `SocketContextProvider`.
- Default navigation goes to `/main`.

## 3. Backend Architecture

Socket stack:

- Socket init: `src/app/src/services/Socket/index.ts`
- Channel endpoint middleware: `src/app/src/services/Socket/middlewares/channels.middleware.ts`
- Auth middleware: `src/app/src/services/Socket/middlewares/authentication.middleware.ts`
- Isolation middleware: `src/app/src/services/Socket/middlewares/isolation.middleware.ts`

Server bootstrap:

- I/O process bootstrap: `src/app/src/main/ioProcesses.ts`
- Express server init: `src/app/src/services/Server/index.ts`

## 4. Main and Panel Behavior

Main (`/main`):

- Requests system time through socket.
- Requests interactive content through socket.
- Listens for content updates broadcast from backend.

Panel (`/panel`):

- Requires password authentication (`PANEL_ACCESS_PASSWORD`).
- Can update interactive content via socket channel.
- Updates are broadcast to connected Main clients.

## 5. Electron Window Behavior

Window logic: `src/app/src/services/Windows/WindowManager.ts`

- Dev mode: opens with DevTools.
- Production mode: no DevTools.
- Kiosk mode (`KIOSK_MODE=true`): opens fullscreen kiosk by default.

## 6. Environment Variables

Configured and validated in `src/app/src/utils/envLoader.ts`.

Key variables:

```env
NODE_ENV=development

MAIN_SERVER_PORT=43123
VITE_DEV_PORT=5123
VITE_MAIN_SERVER_PORT=43123

PANEL_ACCESS_PASSWORD=change-me
KIOSK_MODE=false

USE_AUTHENTICATION=true
LOCALHOST_ONLY=true
USE_CONTEXT_ISOLATION=true
PUBLIC_ENDPOINTS=[/public]

WRITE_LOG_TO_FILE=true
WRITE_LOG_LEVEL=info
INCREMENT_PATCH_VERSION_ON_BUILD=true
```

Notes:

- Default backend port is `43123`.
- In dev, frontend socket target comes from `VITE_MAIN_SERVER_PORT`.
- In packaged Electron apps, `.env` is loaded first and `.config` (next to the executable) overrides values when present.

## 7. Installed Runtime Artifacts

For packaged Electron distributions, these artifacts must exist next to the executable:

- `.config`: user-editable runtime settings (port, auth, kiosk, etc.).
- `database/`: runtime data directory.

Packaging implementation detail:

- `electron-builder.json` ships both using `extraFiles` from `resources/runtime`.

## 8. Build and Run

Using pnpm:

```bash
pnpm install
pnpm run dev:electron
pnpm run dev:headless
pnpm run dev:react
pnpm run build:vite
pnpm run build:electron
pnpm run build:headless
pnpm run dist:win
pnpm run dist:mac
pnpm run dist:linux
pnpm run dist:headless
```

## 9. Extension Guidance

When adding new communication flows:

1. Add channel constant in `src/common/channels/app.channels.ts`.
2. Implement backend handling in channels middleware.
3. Consume channel through `useSocketChannel` in frontend.
4. Keep payload contracts stable and typed.
5. Validate with the smallest relevant build command.
