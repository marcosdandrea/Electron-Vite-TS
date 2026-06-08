import React, { useEffect, useMemo, useState } from "react";
import io, { Socket } from "socket.io-client";
import { createContext } from "react";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    serverUrl: string;
}

interface SocketContextProviderProps {
    children: React.ReactNode;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketContextProvider: React.FC<SocketContextProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const serverUrl = useMemo(() => {
        if (import.meta.env.DEV) {
            const port = import.meta.env.VITE_MAIN_SERVER_PORT || '43123';
            return `http://localhost:${port}`;
        }

        return window.location.origin;
    }, []);

    useEffect(() => {
        const newSocket = io(serverUrl, {
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
    }, [serverUrl]);


    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setIsConnected(true);
            console.log(`Socket connected to: ${serverUrl}`);
        };

        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            console.log("Socket disconnected:", reason);
        };

        const handleConnectError = (error: any) => {
            console.error("Socket connection error:", error.message);
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
    }, [serverUrl, socket]);

    if (!socket) 
        return <div>Connecting to socket...</div>;
    return (
        <SocketContext.Provider value={{ socket, isConnected, serverUrl }}>
            {children}
        </SocketContext.Provider>
    );
}



export default SocketContextProvider;
