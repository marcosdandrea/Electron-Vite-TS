import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { createContext } from "react";

export const SocketContext = createContext<any>(null);

export const SocketContextProvider = ({children}) => {
    const socket = io("http://localhost:3000"); // Cambia la URL según sea necesario
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
            console.log("Socket connected");
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        }
    }, [socket]);

    return ( 
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
     );
}



export default SocketContextProvider;
