import { APP_CHANNELS } from '@common/channels/app.channels';
import { Socket } from 'socket.io';
import { env } from '@utils/envLoader.js';

type Ack = (response: { ok: boolean; data?: unknown; error?: string }) => void;

let interactiveContent = 'Contenido inicial';

const withAckError = (ack: unknown, error: unknown) => {
    if (typeof ack !== 'function') {
        return;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    (ack as Ack)({ ok: false, error: message });
};

const withAckSuccess = (ack: unknown, data?: unknown) => {
    if (typeof ack !== 'function') {
        return;
    }

    (ack as Ack)({ ok: true, data });
};

export const channelsMiddleware = (socket: Socket, next: (error?: Error) => void) => {
    socket.use(async (packet, packetNext) => {
        const [channel, payload, ack] = packet;

        try {
            switch (channel) {
                case APP_CHANNELS.GET_SYSTEM_TIME:
                    withAckSuccess(ack, Date.now());
                    return;

                case APP_CHANNELS.MAIN_GET_CONTENT:
                    withAckSuccess(ack, { content: interactiveContent });
                    return;

                case APP_CHANNELS.PANEL_AUTHENTICATE: {
                    const password = payload?.password;
                    const isValid = typeof password === 'string' && password === env.PANEL_ACCESS_PASSWORD;

                    if (!isValid) {
                        throw new Error('Invalid panel password');
                    }

                    socket.data.isPanelAuthenticated = true;
                    withAckSuccess(ack, { authenticated: true });
                    return;
                }

                case APP_CHANNELS.PANEL_SET_CONTENT: {
                    if (!socket.data.isPanelAuthenticated) {
                        throw new Error('Panel authentication required');
                    }

                    const content = payload?.content;
                    if (typeof content !== 'string') {
                        throw new Error('Invalid content payload');
                    }

                    interactiveContent = content;
                    socket.broadcast.emit(APP_CHANNELS.MAIN_CONTENT_UPDATED, { content: interactiveContent });
                    withAckSuccess(ack, { saved: true });
                    return;
                }

                default:
                    packetNext();
                    return;
            }
        } catch (error) {
            withAckError(ack, error);
        }
    });

    next();
};
