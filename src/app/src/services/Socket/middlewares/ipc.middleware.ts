import { appListeners } from "@src/services/Socket/listeners/app.listeners";
import { Socket } from "socket.io";

export const ipcMiddleware = (socket: Socket, next: any) => {
    appListeners(socket);
    next();
}