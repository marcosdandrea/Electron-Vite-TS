import { nanoid } from "nanoid";
import { Log } from "@src/utils/log";
const log = new Log('TokenManager', true);

export class TokenManager {
    private tokens: Record<string, string>;
    private static instance: TokenManager;

    private constructor() {
        this.tokens = {};
    }

    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }
    public generateToken(key: string): string {
        if (!key)
            throw new Error("Key is required to generate a token.");

        if (this.tokens[key]) 
            throw new Error("Token already exists for this key.");

        const token = this.createToken();
        this.tokens[key] = token;
        log.info(`Generated token for key: ${key}`);
        return token;
    }

    public validateToken(key: string, token: string): boolean {
        return this.tokens[key] === token;
    }

    public getToken(key: string): string | Error {
        if (!this.tokens[key]) 
           throw new Error(`No token found for key: ${key}`);

        return this.tokens[key];
    }

    public revokeToken(key: string): void {

        if (!this.tokens[key]) {
            log.warn(`No token found for key: ${key}`);
            return;
        }

        log.info(`Revoking token for user: ${key}`);
        delete this.tokens[key];
    }

    private createToken(): string {
        return nanoid(32);
    }
}

export default TokenManager.getInstance();