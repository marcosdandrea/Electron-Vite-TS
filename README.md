# Electron-Vite-TS Boilerplate

Electron + React + Vite + TypeScript boilerplate with an integrated Express + Socket.IO backend.

This project is now socket-only for frontend-backend communication.
IPC is not used in the current architecture.

## Agent Guide

Operational guide for agents and automated workflows:
- [AGENTS.md](./AGENTS.md)

Detailed reference:
- [DOCUMENTATION.md](./DOCUMENTATION.md)

## Key Architecture Rules

- Communication between frontend and backend is done only through Socket.IO channels.
- Channels are defined centrally in `src/common/channels/app.channels.ts`.
- Frontend channel usage must go through the socket hook inside `SocketContextProvider`.
- Backend channel endpoint handling is implemented in socket middleware.
- User-facing UI should use Ant Design components by default.

## Main UI Flow

- Default route redirects to `/main`.
- Main view consumes interactive content and system time through socket channels.
- Panel view is protected with password authentication from `.env`.
- Panel can update interactive content shown in Main.

## Runtime Modes

- Development:
  - Opens frontend with DevTools.
- Production:
  - Opens frontend without DevTools.
- Kiosk mode (`KIOSK_MODE=true`):
  - Opens in fullscreen kiosk by default.

## Environment Variables

Core runtime variables:

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
- `MAIN_SERVER_PORT` is the backend socket/http port.
- The default port is set to `43123` (less common than `3000`).
- In dev, `VITE_MAIN_SERVER_PORT` must point to the backend port used by the socket provider.
- In packaged Electron builds, an external `.config` file is created next to the `.exe`.
- When `.config` exists, its values override values from `.env`.

## Installed Runtime Files

For Windows packaged installers, the app installation directory includes:

- `.config` (user-editable runtime configuration)
- `database/` (runtime data directory)

Both are shipped next to the executable to allow per-install customization without rebuilding the app.

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
git clone <repository-url>
cd Electron-Vite-TS
pnpm install
```

Create `.env` from `.env-ref` and customize values.

## Development

```bash
pnpm run dev:electron
pnpm run dev:headless
pnpm run dev:react
```

## Build

```bash
pnpm run build:vite
pnpm run build:electron
pnpm run build:headless
```

## Distribution

```bash
pnpm run dist:win
pnpm run dist:mac
pnpm run dist:linux
pnpm run dist:headless
```

## Important Source Paths

- `src/common/channels/app.channels.ts`
- `src/app/src/services/Socket/middlewares/channels.middleware.ts`
- `src/ui/src/contexts/socket/index.tsx`
- `src/ui/src/hooks/useSocketChannel/index.tsx`
- `src/ui/src/views/Main/index.tsx`
- `src/ui/src/views/Panel/index.tsx`
- `src/app/src/services/Windows/WindowManager.ts`
