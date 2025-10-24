import { Socket } from "socket.io";

export const appListeners = (socket: Socket | Error) => {
    if (socket instanceof Error) {
        console.error("Socket connection error:", socket.message);
        return;
    }
    
    /*
    socket.on('some-event', someService);
    socket.on('another-event', anotherService);
    */


    socket.on('ping', () => {
        console.log ('Received ping from client');
    });

    // Aquí puedes agregar lógica adicional para manejar la comunicación IPC
}