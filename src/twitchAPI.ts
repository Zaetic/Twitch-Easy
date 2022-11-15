import axios from 'axios';
import { GET_CHANNEL, GET_CLIPS, GET_STREAM, twitchAouth2 } from './defaults';
import Games from './modules/games';
import {
    ITwitchAPI,
    ChannelSearchName,
    StreamerByName,
    StreamerOnline,
    StreamerSearchOnline,
    Token,
    ClipsSearchOnline,
    Clip,
} from './types/twitchAPI';

export default class TwitchAPI implements ITwitchAPI {
    private CLIENT_ID: string;
    private CLIENT_SECRET: string;
    private ratelimit_reset?: Date;
    private token: { access_token: string; expires_in: number; time: number; token_type: string };
    private _games: Games;

    constructor(clientId: string, clientSecret: string) {
        this.CLIENT_ID = clientId;
        this.CLIENT_SECRET = clientSecret;
        this.token = {
            access_token: '',
            expires_in: 0,
            time: 0,
            token_type: 'bearer',
        };

        this._games = new Games(this);
    }

    public get games(): Games {
        return this._games;
    }

    public get ratelimit(): Date | undefined {
        return this.ratelimit_reset;
    }

    public async getToken(): Promise<void> {
        if ((await this.checkToken()) === false) return;

        const body = {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            grant_type: 'client_credentials',
        };

        const token: Token = await axios({
            url: twitchAouth2,
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            data: body,
        }).then((res) => res.data);

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
        this.ratelimit_reset = new Date(parseInt(rate, 10) * 1000);
    }

    public createHeader() {
        const headers = {
            'Content-Type': 'application/json',
            'Client-ID': this.CLIENT_ID,
            Authorization: `Bearer ${this.token.access_token}`,
        };

        return headers;
    }

    public async getStreamersByName({
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

        const streamers: ChannelSearchName | null = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                this.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
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

    public async getStreamersOnline({
        id,
        quantity = 20,
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

        const streamers: StreamerSearchOnline = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                this.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
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

    public async getClips({
        quantity = 20,
        id,
        gameId,
        broadcasterId,
    }: {
        quantity?: number;
        id?: string | Array<string>;
        gameId?: string;
        broadcasterId?: string;
    }): Promise<Clip[] | null> {
        if (!id && !gameId && !broadcasterId) throw new Error('id (one or more), broadcasterId, or gameId must be specified');

        let cursor: string | null = null;
        let clips: Clip[] = [];
        let finish = false;
        const objFetch: {
            id?: string | Array<string>;
            gameId?: string;
            broadcasterId?: string;
            quantity: number;
        } = {
            id: id || undefined,
            gameId: gameId || undefined,
            broadcasterId: broadcasterId || undefined,
            quantity,
        };

        if (quantity < 100) {
            const clipsFetch = await this.fetchClips(objFetch);
            if (!clipsFetch) return null;
            clips = clipsFetch.data;
        } else {
            while (finish === false) {
                let clipsFetch: ClipsSearchOnline | null = null;
                const left = quantity - clips.length;

                if (left <= 0) {
                    finish = true;
                } else {
                    const quantityLeft = left < 100 ? left : 100;
                    objFetch.quantity = quantityLeft;

                    if (!cursor) clipsFetch = await this.fetchClips(objFetch);
                    else if (cursor) clipsFetch = await this.fetchClips(objFetch);

                    if (!clipsFetch || clipsFetch.data.length === 0) finish = true;
                    else {
                        clips = Array.prototype.concat(clips, clipsFetch.data);

                        if (clipsFetch.pagination.cursor) cursor = clipsFetch.pagination.cursor;
                        else if (!clipsFetch.pagination.cursor) finish = true;
                    }
                }
            }
        }

        return clips;
    }

    private async fetchClips({
        quantity = 20,
        id,
        gameId,
        broadcasterId,
        paginator,
    }: {
        quantity: number;
        id?: string | Array<string>;
        gameId?: string;
        broadcasterId?: string;
        paginator?: string;
    }): Promise<ClipsSearchOnline | null> {
        await this.getToken();
        const headers = this.createHeader();

        let url = `${GET_CLIPS}?`;

        if (id) url += `id=${id}`;
        if (gameId) url += `game_id=${gameId}`;
        if (broadcasterId) url += `broadcaster_id=${broadcasterId}`;

        url += `&first=${quantity}`;
        if (paginator) url += `&after=${paginator}`;

        const games: ClipsSearchOnline = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                this.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.ratelimit_reset}`);
                }

                return null;
            })
            .catch((err: Error) => {
                throw err;
            });

        return games;
    }
}
