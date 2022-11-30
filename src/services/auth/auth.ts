import { Token } from '../../types/twitchAPI';
import { twitchAouth2 } from '../../defaults';
import { Http } from '..';
import { IAuth, Headers } from './auth.declaration';

class Auth implements IAuth {
    private readonly CLIENT_ID: string;
    private readonly CLIENT_SECRET: string;
    private _ratelimit_reset?: Date;
    private token: { access_token: string; expires_in: number; time: number; token_type: string };

    constructor(private readonly http: Http, private readonly clientId: string, private readonly clientSecret: string) {
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

        const body = {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            grant_type: 'client_credentials',
        };

        const token: Token = await this.http
            .post({
                url: twitchAouth2,
                headers: { 'Content-type': 'application/json' },
                body,
            })
            .then((res) => res.data);

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

export { Auth };
