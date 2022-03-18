import axios from 'axios';
import { GET_CHANNEL, GET_GAMES, GET_GAMES_TOP, GET_STREAM, twitchAouth2 } from './defaults';
import {
    ITwitchAPI,
    ChannelSearchName,
    StreamerByName,
    StreamerOnline,
    StreamerSearchOnline,
    Token,
    GamesSearchOnline,
    Game,
} from './types/twitchAPI';

export default class TwitchAPI implements ITwitchAPI {
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

    private updateRateReset(rate: string | null): void {
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

    public async getTopGames(quantity: number): Promise<Game[] | null> {
        if (quantity < 1) throw new Error('The parameter "quantity" was malformed: the value must be greater than or equal to 1');

        let cursor: string | null = null;
        let games: Game[] = [];
        let finish = false;

        if (quantity < 100) {
            const gamesFetch = await this.fetchTopGames({ quantity });
            if (!gamesFetch) return null;
            games = gamesFetch.data;
        } else {
            while (finish === false) {
                let gamesFetch: GamesSearchOnline | null = null;
                const left = quantity - games.length;

                if (left <= 0) {
                    finish = true;
                } else {
                    const quantityLeft = left < 100 ? left : 100;

                    if (!cursor) gamesFetch = await this.fetchTopGames({ quantity: quantityLeft });
                    else if (cursor) gamesFetch = await this.fetchTopGames({ quantity: quantityLeft, paginator: cursor });

                    if (!gamesFetch || gamesFetch.data.length === 0) finish = true;
                    else {
                        games = Array.prototype.concat(games, gamesFetch.data);

                        if (gamesFetch.pagination.cursor) cursor = gamesFetch.pagination.cursor;
                        else if (!gamesFetch.pagination.cursor) finish = true;
                    }
                }
            }
        }

        return games;
    }

    private async fetchTopGames({ quantity = 20, paginator }: { quantity: number; paginator?: string }): Promise<GamesSearchOnline | null> {
        await this.getToken();
        const headers = this.createHeader();

        const url = paginator ? `${GET_GAMES_TOP}?first=${quantity}&after=${paginator}` : `${GET_GAMES_TOP}?first=${quantity}`;

        const games: GamesSearchOnline = await axios({
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

    private async fetchGames({
        quantity = 20,
        name,
        id,
        paginator,
    }: {
        quantity: number;
        name?: string;
        id?: string;
        paginator?: string;
    }): Promise<GamesSearchOnline | null> {
        await this.getToken();
        const headers = this.createHeader();

        let url = `${GET_GAMES}?`;

        if (name) url += `name=${name}&quantity=${quantity}`;
        if (id) url += `id=${id}&quantity=${quantity}`;
        if (paginator) url += `&after=${paginator}`;

        const games: GamesSearchOnline = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                console.log(res);
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

    public async getGameByName(name: string): Promise<Game | null> {
        if (!name) throw new Error('Name is null, pass a value');

        let cursor: string | null = null;
        let game: Game | null = null;
        let finish = false;

        while (finish === false) {
            let games: GamesSearchOnline | null = null;

            if (!cursor) games = await this.fetchGames({ name, quantity: 100 });
            else if (cursor) games = await this.fetchGames({ name, quantity: 100, paginator: cursor });

            if (!games || (games.data && Array.isArray(games.data) && games.data.length === 0)) finish = true;
            else if (!game && cursor) finish = true;
            else {
                const search = games.data.find((s) => s.name.toLowerCase() === name.toLowerCase());
                if (search) {
                    game = search;
                    finish = true;
                } else if (games.pagination.cursor) cursor = games.pagination.cursor;
                else if (!games.pagination.cursor && !search) finish = true;
            }
        }

        return game;
    }

    public async getGameById(id: string): Promise<Game | null> {
        if (!id) throw new Error('Name is null, pass a value');

        let cursor: string | null = null;
        let game: Game | null = null;
        let finish = false;

        while (finish === false) {
            let games: GamesSearchOnline | null = null;

            if (!cursor) games = await this.fetchGames({ id, quantity: 100 });
            else if (cursor) games = await this.fetchGames({ id, quantity: 100, paginator: cursor });

            if (!games || (games.data && Array.isArray(games.data) && games.data.length === 0)) finish = true;
            else if (!game && cursor) finish = true;
            else {
                const search = games.data.find((s) => s.id === id);
                if (search) {
                    game = search;
                    finish = true;
                } else if (games.pagination.cursor) cursor = games.pagination.cursor;
                else if (!games.pagination.cursor && !search) finish = true;
            }
        }

        return game;
    }
}
