import APP_TOKENS from '@common/tokens/app.tokens';
import { env } from '@utils/envLoader.js';

export const getSystemTime = (event: Electron.IpcMainInvokeEvent, arg: any[]): Promise<number> => {
    return Promise.resolve(Date.now());
}

export const getAuthToken = async (event: Electron.IpcMainInvokeEvent, arg: any[]): Promise<string | Error> => {
    const {TokenManager} = await import('@services/TokenManager/index.js');
    const token = TokenManager.getInstance();
    return Promise.resolve(token.getToken(APP_TOKENS.AUTH_TOKEN));
}

export const getContextIsolationStatus = (event: Electron.IpcMainInvokeEvent, arg: any[]): Promise<boolean> => {
    const useContextIsolation = env.USE_CONTEXT_ISOLATION;
    return Promise.resolve(useContextIsolation);
}

export default {
    getSystemTime,
    getAuthToken,
    getContextIsolationStatus
}