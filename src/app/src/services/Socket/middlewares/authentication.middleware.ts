import { Socket } from "socket.io";


export const authenticationMiddleware = (socket: Socket, next: any) => {
    
    next();
};