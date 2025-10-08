import type { Server } from 'http';
import type socketIo from 'socket.io';

const init = async ({ httpServer, cors}: { httpServer: Server, cors?: any }) => {

    return new Promise<socketIo.Server>(async (resolve, reject) => {
        try {

            const { Server } = await import("socket.io");
            const io = new Server(httpServer, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"],
                    ...(cors || {})
                }
            });
            resolve(io);
        } catch (error) {
            reject(error);
        }
    });
};

export { init };