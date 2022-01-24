import fetch, { Response } from 'node-fetch';
import { ChannelSearchName, StreamerByName, StreamerOnline, StreamerSearchOnline, Token } from './declarations';
import { GET_CHANNEL, GET_STREAM, twitchAouth2 } from './defaults';

export default class TwitchAPI {
    private CLIENT_ID: string;
    private CLIENT_SECRET: string;
    private ratelimit_reset?: Date | null;
    private token: { access_token: string; expires_in: number; time: number; token_type: string };

    constructor(clientId: string, clientSecret: string) {
        this.CLIENT_ID = clientId;
        this.CLIENT_SECRET = clientSecret;
        this.token = {
            access_token: '',
            expires_in: 0,
            time: 0,
            token_type: 'bearer',
        };
    }

    public async getToken(): Promise<void> {
        if ((await this.checkToken()) === false) return;

        const body = {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            grant_type: 'client_credentials',
        };

        const token: Token = await fetch(twitchAouth2, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-type': 'application/json' },
        }).then((res) => res.json());

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

    private updateRateReset(rate: string | null) {
        if (!rate) return;
        this.ratelimit_reset = new Date(parseInt(rate, 10) * 1000);
    }

    private createHeader() {
        const headers = {
            'Content-Type': 'application/json',
            'Client-ID': this.CLIENT_ID,
            Authorization: `Bearer ${this.token.access_token}`,
        };

        return headers;
    }

    private async getStreamersByName({
        name,
        quantity = 20,
        paginator,
    }: {
        name: string;
        quantity: number;
        paginator?: string;
    }): Promise<ChannelSearchName | null> {
        if (!name) throw new Error('Name is null, pass a value');
        await this.getToken();
        const headers = this.createHeader();

        const url = paginator
            ? `${GET_CHANNEL}?first=${quantity}&query=${name}&after=${paginator}`
            : `${GET_CHANNEL}?first=${quantity}&query=${name}`;

        const streamers: ChannelSearchName | null = await fetch(url, {
            method: 'GET',
            headers,
        })
            .then((res: Response) => {
                this.updateRateReset(res.headers.get('ratelimit-reset'));

                if (res.status === 200 && res.ok) {
                    return res.json();
                }
                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.ratelimit_reset}`);
                }

                return null;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });

        return streamers;
    }

    public async getStreamerByName(name: string): Promise<StreamerByName | null> {
        if (!name) throw new Error('Name is null, pass a value');

        let cursor: string | null = null;
        let streamer: StreamerByName | null = null;
        let finish = false;

        while (finish === false) {
            let streamers: ChannelSearchName | null = null;

            if (!cursor) streamers = await this.getStreamersByName({ name, quantity: 100 });
            else if (cursor) streamers = await this.getStreamersByName({ name, quantity: 100, paginator: cursor });

            if (!streamers) finish = true;
            else if (!streamer && cursor) finish = true;
            else {
                const search = streamers.data.find((s) => s.display_name.toLowerCase() === name.toLowerCase());
                if (search) {
                    streamer = search;
                    finish = true;
                } else if (streamers.pagination.cursor) cursor = streamers.pagination.cursor;
                else if (!streamers.pagination.cursor && !search) finish = true;
            }
        }

        return streamer;
    }

    private async getStreamersOnline({
        id,
        quantity,
        paginator,
    }: {
        id: string;
        quantity: number;
        paginator?: string;
    }): Promise<StreamerSearchOnline | null> {
        if (!id) throw new Error('ID is null, pass a value');
        await this.getToken();
        const headers = this.createHeader();

        const url = paginator ? `${GET_STREAM}?first=${quantity}&user_id=${id}&after=${paginator}` : `${GET_STREAM}?first=${quantity}&user_id=${id}`;

        const streamers: StreamerSearchOnline = await fetch(url, {
            method: 'GET',
            headers,
        })
            .then((res: Response) => {
                this.updateRateReset(res.headers.get('ratelimit-reset'));

                if (res.status === 200 && res.ok) {
                    return res.json();
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.ratelimit_reset}`);
                }

                return null;
            })
            .catch((err: Error) => {
                throw new Error(err.message);
            });

        return streamers;
    }

    public async getStreamerOnline(id: string): Promise<StreamerOnline | null> {
        if (!id) throw new Error('ID is null, pass a value');

        let cursor: string | null = null;
        let streamer: StreamerOnline | null = null;
        let finish = false;

        while (finish === false) {
            let streamers: StreamerSearchOnline | null = null;

            if (!cursor) streamers = await this.getStreamersOnline({ id, quantity: 100 });
            else if (cursor) streamers = await this.getStreamersOnline({ id, quantity: 100, paginator: cursor });

            if (!streamers) finish = true;
            else if (!streamer && cursor) finish = true;
            else {
                const search = streamers.data.find((s) => s.user_id.toString() === id.toLowerCase());
                if (search) {
                    streamer = search;
                    finish = true;
                } else if (streamers.pagination.cursor) cursor = streamers.pagination.cursor;
                else if (!streamers.pagination.cursor && !search) finish = true;
            }
        }

        return streamer;
    }
}
