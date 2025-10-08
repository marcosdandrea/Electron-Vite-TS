import { WindowManager } from "@domain/entities/windowManager/index.js"
import { Log } from "@utils/log.js";

const log = new Log("windowManagerUseCase", true)
const isDev = process.env.NODE_ENV === 'development'

let mainWindow: import('electron').BrowserWindow | null = null

export const getWebContents = () => mainWindow?.webContents || null;

export const getMainWindow = () => mainWindow;

const setMainWindow = (window: import('electron').BrowserWindow) => {
    mainWindow = window
}

interface CreateMainWindowParams {
    enableMenuBar: boolean,
    startFullscreen?: boolean,
    defaultSize?: { width: number, height: number },
    defaultPosition?: { x: number, y: number }
}

export const createMainWindow = async ({ enableMenuBar, startFullscreen, defaultSize, defaultPosition }: CreateMainWindowParams) => {
    log.info("Creating main window")

    if (mainWindow) {
        log.info("Main window already exists")
        mainWindow.show()
        return mainWindow
    }
    
    const WM = WindowManager.getInstance()

    const {width, height} = defaultSize || {width: 800, height: 600}
    const {x, y} = defaultPosition || {}
    
    const windowOptions: any = {
        name: "main",
        width,
        height,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    }
    
    // Solo agregar posición si está definida
    if (x !== undefined) windowOptions.x = x
    if (y !== undefined) windowOptions.y = y
    
    const win = await WM.createWindow(windowOptions)

    
    if (isDev) {
        win.loadURL('http://localhost:5123');
        win.webContents.openDevTools({ mode: "detach" })
    } else {
        const MAIN_SERVER_PORT = process.env.MAIN_SERVER_PORT ? parseInt(process.env.MAIN_SERVER_PORT) : 3000;
        win.loadURL(`http://localhost:${MAIN_SERVER_PORT}`);
    }

    setMainWindow(win)
    const appTitle: string = process.env.APP_TITLE || ""
    win.setTitle(appTitle)

    win.setMenuBarVisibility(enableMenuBar)
    import ("./mainWindowMenuManager.js")
    import ("./mainWindowTitleManager.js")

    if (startFullscreen) {
        win.maximize()
        win.setFullScreen(true)
    } 

    log.info("Main window created")


    win.on("close", async (event) => {
        event.preventDefault()
        win.destroy()
    })
}