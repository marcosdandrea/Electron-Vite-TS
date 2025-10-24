import { APP_CHANNELS } from '@common/channels/app.channels'
import { ipcMain } from 'electron'
import systemListener from './listeners/system.listener'

ipcMain.handle(APP_CHANNELS.GET_SYSTEM_TIME, systemListener.getSystemTime)
ipcMain.handle(APP_CHANNELS.GET_AUTH_TOKEN, systemListener.getAuthToken)
ipcMain.handle(APP_CHANNELS.GET_CONTEXT_ISOLATION_STATUS, systemListener.getContextIsolationStatus)