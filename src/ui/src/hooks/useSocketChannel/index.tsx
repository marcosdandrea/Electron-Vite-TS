import { APP_CHANNELS } from '@common/channels/app.channels';
import { useCallback, useContext } from 'react';
import { SocketContext } from '../../contexts/socket';

type AckResponse<T = unknown> = {
    ok: boolean;
    data?: T;
    error?: string;
};

const useSocketChannel = () => {
    const context = useContext(SocketContext);

    if (!context || !context.socket) {
        throw new Error('useSocketChannel must be used within a SocketContextProvider');
    }

    const { socket, isConnected, serverUrl } = context;

    const emit = useCallback((channel: string, payload?: unknown) => {
        socket.emit(channel, payload);
    }, [socket]);

    const request = useCallback(<T = unknown>(channel: string, payload?: unknown): Promise<T> => {
        return new Promise((resolve, reject) => {
            socket.timeout(5000).emit(channel, payload, (err: unknown, response: AckResponse<T>) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!response?.ok) {
                    reject(new Error(response?.error || 'Channel request failed'));
                    return;
                }

                resolve(response.data as T);
            });
        });
    }, [socket]);

    return {
        channels: APP_CHANNELS,
        emit,
        request,
        socket,
        isConnected,
        serverUrl
    };
};

export default useSocketChannel;
