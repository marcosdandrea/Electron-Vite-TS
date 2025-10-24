import { APP_CHANNELS } from "@common/channels/app.channels";
import { ElectronAPI } from "@common/types/electron.types";
import React, { useEffect } from "react";
import { createContext } from "react";

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export const ipcContext = createContext(null);

const IpcContextProvider = ({ children }) => {
    const ipcAvailable = window.electronAPI !== undefined;
    const [authToken, setAuthToken] = React.useState(null);
    const [contextIsolation, setContextIsolation] = React.useState(null);

    if (!ipcAvailable)
        console.warn('IPC is not available')

    const ipc = {
        send: ipcAvailable ? window.electronAPI.send : () => {console.warn('IPC is not available')},
        on: ipcAvailable ? window.electronAPI.on : () => {console.warn('IPC is not available')},
        once: ipcAvailable ? window.electronAPI.once : () => {console.warn('IPC is not available')},
        invoke: ipcAvailable ? window.electronAPI.invoke : () => {console.warn('IPC is not available')},
        off: ipcAvailable ? window.electronAPI.off : () => {console.warn('IPC is not available')},
    } as ElectronAPI

    const fetchContextIsolation = async () => {
        const isolation = await ipc.invoke(APP_CHANNELS.GET_CONTEXT_ISOLATION_STATUS);
        setContextIsolation(isolation);
    }

    const fetchAuthToken = async () => {
        const token = await ipc.invoke(APP_CHANNELS.GET_AUTH_TOKEN);
        setAuthToken(token);
    }

    useEffect(() => {
        fetchContextIsolation();
    }, []);

    useEffect(() => {
        if (!ipcAvailable) return
        if (contextIsolation == null) return
        if (!contextIsolation) return
        fetchAuthToken();
    }, [contextIsolation]);
            
    if (contextIsolation === null)
        return (<>loading</>)

    return (
        <ipcContext.Provider value={{ ipc, authToken, contextIsolation }}>
            {children}
        </ipcContext.Provider>);
}

export default IpcContextProvider;