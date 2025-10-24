import { useContext } from "react";
import { ipcContext } from "../../contexts/ipc";
import { ElectronAPI } from "@common/types/electron.types";

const useIpc = () => {
    if (!ipcContext) {
        throw new Error("ipcContext is not defined");
    }
    const {ipc, authToken, contextIsolation} = useContext(ipcContext) as {ipc: ElectronAPI | null, authToken: string | null, contextIsolation: boolean | null};

    if (!ipc) {
        throw new Error("useIpc must be used within an IpcContextProvider");
    }

    return {
        authToken,
        contextIsolation,
        send: ipc.send,
        on: ipc.on,
        once: ipc.once,
        invoke: ipc.invoke,
        off: ipc.off,
    };
}
 
export default useIpc;