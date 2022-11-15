import axios from 'axios';
import { GET_CHANNEL, GET_STREAM } from '../defaults';
import { ChannelSearchName, ITwitchAPI, StreamerByName, StreamerOnline, StreamerSearchOnline } from '../types/twitchAPI';

class Streamers {
    private core: ITwitchAPI;

    constructor(TwitchAPI: ITwitchAPI) {
        this.core = TwitchAPI;
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
        await this.core.getToken();
        const headers = this.core.createHeader();

        const url = paginator
            ? `${GET_CHANNEL}?first=${quantity}&query=${name}&after=${paginator}`
            : `${GET_CHANNEL}?first=${quantity}&query=${name}`;

        const streamers: ChannelSearchName | null = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                this.core.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.core.ratelimit}`);
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
        await this.core.getToken();
        const headers = this.core.createHeader();

        const url = paginator ? `${GET_STREAM}?first=${quantity}&user_id=${id}&after=${paginator}` : `${GET_STREAM}?first=${quantity}&user_id=${id}`;

        const streamers: StreamerSearchOnline = await axios({
            url,
            method: 'GET',
            headers,
        })
            .then((res) => {
                this.core.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.core.ratelimit}`);
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

export { Streamers };
