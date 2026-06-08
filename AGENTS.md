# AGENTS Guide

This file replaces `DOCUMENTATION.md` as the primary operational guide for coding agents in this repository.

## Mission

Maintain and extend this Electron + Vite + TypeScript boilerplate safely.
Prioritize small, reversible changes and keep Electron mode and Headless mode working.

## Stack

- Runtime: Node.js 18+
- Package manager: pnpm
- Desktop: Electron
- UI: React + Vite + TypeScript
- UI components: Ant Design (default for user-facing UI)
- Backend: Express + Socket.IO
- Build tools: esbuild, Vite, electron-builder

## Repo Map

- `src/app/main.ts`: app entrypoint, mode switch (`HEADLESS=true`)
- `src/app/src/main/ioProcesses.ts`: Express + Socket.IO bootstrap
- `src/app/src/main/electronProcess.ts`: Electron process lifecycle
- `src/app/src/main/appProcess.ts`: app-level orchestration hooks
- `src/app/src/services/`: infrastructure services (Server, Socket, Auth, TokenManager, Windows)
- `src/ui/`: React app and UI logic
- `src/common/`: shared channels, tokens, types
- `src/ui/src/views/Main/`: default interactive view
- `src/ui/src/views/Panel/`: protected configuration panel
- `scripts/build-electron.mjs`: Electron transpilation
- `scripts/build-headless.mjs`: Headless transpilation
- `scripts/increment-version.mjs`: version bump for distribution

## Standard Commands (pnpm)

- `pnpm install`
- `pnpm run dev` (runs Electron by default)
- `pnpm run dev:headless` (runs only the core process, no Electron)
- `pnpm run dist:win`
- `pnpm run dist:mac`
- `pnpm run dist:linux`

## Environment Contract

Respect `.env` flags used by the runtime:

- `MAIN_SERVER_PORT`
- `VITE_DEV_PORT`
- `VITE_MAIN_SERVER_PORT`
- `PANEL_ACCESS_PASSWORD`
- `KIOSK_MODE`
- `LOCALHOST_ONLY`
- `USE_CONTEXT_ISOLATION`
- `PUBLIC_ENDPOINTS`
- `USE_AUTHENTICATION`
- `WRITE_LOG_TO_FILE`
- `WRITE_LOG_LEVEL`
- `INCREMENT_PATCH_VERSION_ON_BUILD`

Runtime config precedence (Electron packaged apps):

- Base values are loaded from `.env`.
- If `.config` exists next to the executable, it overrides `.env` values.

Packaged runtime files (required next to `.exe`):

- `.config`
- `database/`

When changing behavior, document required env changes in `README.md`.

## Agent Rules

- Keep edits minimal and scoped to the request.
- Do not break dual-mode behavior (Electron + Headless).
- Avoid moving files unless required.
- Use Ant Design components by default for user-facing UI.
- Preserve existing socket channel contracts in `src/common/channels/app.channels.ts` unless explicitly requested.
- Prefer typed interfaces and `zod` validation where input boundaries change.
- If you change scripts/build flow, validate at least one execution path.

## Validation Checklist

After meaningful code changes, run the smallest relevant checks:

1. `pnpm run build:vite` for UI changes.
2. `pnpm run build:electron` for Electron main/process changes.
3. `pnpm run build:headless` for backend/headless flow changes.
4. `pnpm run test:unit` when touching domain logic.

## Notes

- `DOCUMENTATION.md` may still exist for historical context, but this file is the active guide for agents.
- Keep this file updated when architecture, scripts, or workflow conventions change.
