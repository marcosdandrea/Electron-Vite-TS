import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { createContext } from "react";

export const SocketContext = createContext<any>(null);

export const SocketContextProvider = ({children}) => {
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [socketUrl, setSocketUrl] = useState<string>('');

    useEffect(() => {
        const initializeSocket = async () => {
            // Detectar si estamos en desarrollo basándonos en el puerto actual
            const currentPort = window.location.port;
            let url: string;
            
            if (currentPort === '5123') {
                // Estamos en el servidor de desarrollo de Vite
                try {
                    // Intentar obtener la configuración del servidor
                    const response = await fetch('http://localhost:3000/api/config');
                    if (response.ok) {
                        const config = await response.json();
                        url = `http://localhost:${config.serverPort}`;
                    } else {
                        // Fallback al puerto por defecto
                        url = 'http://localhost:3000';
                    }
                } catch (error) {
                    console.warn('Could not fetch server config, using default port 3000');
                    url = 'http://localhost:3000';
                }
            } else {
                // En producción, conectar al mismo host y puerto desde donde se sirve la página
                url = `${window.location.protocol}//${window.location.host}`;
            }
            
            setSocketUrl(url);
            console.log(`Socket.IO connecting to: ${url}`);
            
            const newSocket = io(url, {
                transports: ['websocket', 'polling'],
                timeout: 5000,
                forceNew: true
            });
            
            setSocket(newSocket);
            setIsConnected(newSocket.connected);
        };

        initializeSocket();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setIsConnected(true);
            console.log(`Socket connected to: ${socketUrl}`);
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
    }, [socket, socketUrl]);

    // Cleanup cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return ( 
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
     );
}



export default SocketContextProvider;
