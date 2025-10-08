// App types for the application
export interface AppConfig {
    isDevelopment: boolean;
    isHeadless: boolean;
    version: string;
}

export interface AppState {
    isInitialized: boolean;
    isRunning: boolean;
}