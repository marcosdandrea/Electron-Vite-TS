import { createWindowOptions, WindowManager } from "./WindowManager";
import { Log } from "@src/utils/log";

const log = new Log("WindowsService", true)
const windowManager = WindowManager.getInstance();


export const createMainWindow = async () => {
    
    const options = {
        name: "MainWindow",
        fullscreen: false,
        frame: true,
        resizable: true,
        size: { width: 1200, height: 800 },
        url: "/"
    } as createWindowOptions

    log.info("Main window created");
    return await windowManager.createWindow(options);
}

export default {
    createMainWindow
};