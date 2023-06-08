import { IHttp } from '../index';
import { IAuth, Headers, Token } from './auth.declaration';

class AuthMemory implements IAuth {
    private readonly CLIENT_ID: string;
    private readonly CLIENT_SECRET: string;
    private _ratelimit_reset?: Date;
    private token: { access_token: string; expires_in: number; time: number; token_type: string };

    constructor(private readonly http: IHttp, private readonly clientId: string, private readonly clientSecret: string) {
        this.CLIENT_ID = clientId;
        this.CLIENT_SECRET = clientSecret;
        this.token = {
            access_token: '',
            expires_in: 0,
            time: 0,
            token_type: 'bearer',
        };
    }

    public get ratelimit_reset(): Date | undefined {
        return this._ratelimit_reset;
    }

    public async getToken(): Promise<void> {
        if ((await this.checkToken()) === false) return;

        const token: Token = {
            access_token: '18323984',
            expires_in: 600000,
            token_type: 'bearer',
        };

        this.token.access_token = token.access_token;
        this.token.expires_in = token.expires_in;
        this.token.token_type = token.token_type;
        this.token.time = new Date().getTime();
    }

    public async checkToken(): Promise<Boolean> {
        const errorMargin = 1000;

        if (this.token.time + this.token.expires_in + errorMargin >= new Date().getTime()) {
            return false;
        }

        return true;
    }

    public updateRateReset(rate: string | null): void {
        if (!rate) return;
        this._ratelimit_reset = new Date(parseInt(rate, 10) * 1000);
    }

    public createHeader(): Headers {
        const headers = {
            'Content-Type': 'application/json',
            'Client-ID': this.CLIENT_ID,
            Authorization: `Bearer ${this.token.access_token}`,
        };

        return headers;
    }
}

export { AuthMemory };
