import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { createContext } from "react";
import useIpc from "../../hooks/useIpc";
import { useLocation } from "react-router-dom";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

interface SocketContextProviderProps {
    children: React.ReactNode;
}

export const SocketContext = createContext<SocketContextType | null>(null);
const url = 'http://localhost:3000';

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const location = useLocation()
    const { authToken, contextIsolation } = useIpc() as { authToken: string, contextIsolation: boolean };

    useEffect(() => {
        // Crear la conexión del socket
        const newSocket = io(url, {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            forceNew: true
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);


    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setIsConnected(true);
            console.log(`Socket connected to: ${url}`);
        };

        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            console.log("Socket disconnected:", reason);
        };

        const handleConnectError = (error: any) => {
            console.error("Socket connection error:", error.message);
            // Si es un error de acceso denegado (isolation), informar al usuario
            if (error.message.includes('Access denied')) {
                console.error("Server isolation is enabled - connection rejected");
            }
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        console.log (`Location changed to ${location.pathname}, updating socket auth payload`);
        socket.auth = {
            authToken: contextIsolation ? authToken : null,
            currentPath: location.pathname
        };
    }, [authToken, contextIsolation, location.pathname, socket]);

    if (!socket) 
        return <div>Connecting to socket...</div>;
    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}



export default SocketContextProvider;
