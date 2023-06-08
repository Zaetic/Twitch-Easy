import { GET_CHANNEL, GET_STREAM } from '../defaults';
import { IAuth } from '../services/auth/auth.declaration';
import { IHttp } from '../services/http/http.declaration';
import {
    ChannelSearchName,
    IStreamers,
    StreamerByName,
    StreamerOnline,
    StreamerSearchOnline,
    getStreamersByNameParams,
    getStreamersOnlineParams,
} from '../types/streamers';

class Streamers implements IStreamers {
    private readonly FETCH_QTY = 100;
    private readonly PARAM_QTY = 20;

    constructor(private readonly http: IHttp, private readonly auth: IAuth) {}

    public async getStreamersByName({
        name,
        quantity = this.PARAM_QTY,
        paginator,
        retry = true,
    }: getStreamersByNameParams): Promise<ChannelSearchName | null> {
        if (!name) throw new Error('Name is null, pass a value');
        if (quantity <= 0 || quantity >= Number.MAX_SAFE_INTEGER)
            throw new Error('The parameter "quantity" was malformed: the value must be greater than or equal to 1');

        await this.auth.getToken();
        const headers = this.auth.createHeader();

        const url = paginator
            ? `${GET_CHANNEL}?first=${quantity}&query=${name}&after=${paginator}`
            : `${GET_CHANNEL}?first=${quantity}&query=${name}`;

        const streamers: ChannelSearchName | null = await this.http
            .get({
                url,
                headers,
            })
            .then((res) => {
                this.auth.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.auth.ratelimit_reset}`);
                }

                if (res.status === 503) {
                    if (!retry) throw new Error(`Service Unavailable`);
                    return this.getStreamersByName({ name, quantity, paginator, retry: false });
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

            if (!cursor) streamers = await this.getStreamersByName({ name, quantity: this.FETCH_QTY });
            else if (cursor) streamers = await this.getStreamersByName({ name, quantity: this.FETCH_QTY, paginator: cursor });

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
        quantity = this.PARAM_QTY,
        paginator,
        retry = true,
    }: getStreamersOnlineParams): Promise<StreamerSearchOnline | null> {
        if (!id) throw new Error('ID is null, pass a value');
        if (quantity <= 0 || quantity >= Number.MAX_SAFE_INTEGER)
            throw new Error('The parameter "quantity" was malformed: the value must be greater than or equal to 1');

        await this.auth.getToken();
        const headers = this.auth.createHeader();

        const url = paginator ? `${GET_STREAM}?first=${quantity}&user_id=${id}&after=${paginator}` : `${GET_STREAM}?first=${quantity}&user_id=${id}`;

        const streamers: StreamerSearchOnline = await this.http
            .get({
                url,
                headers,
            })
            .then((res) => {
                this.auth.updateRateReset(res.headers['ratelimit-reset']);

                if (res.status === 200) {
                    return res.data;
                }

                if (res.status === 429) {
                    throw new Error(`Excess rate limit, will be reset at ${this.auth.ratelimit_reset}`);
                }

                if (res.status === 503) {
                    if (!retry) throw new Error(`Service Unavailable`);
                    return this.getStreamersOnline({ id, quantity, paginator, retry: false });
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

            if (!cursor) streamers = await this.getStreamersOnline({ id, quantity: this.FETCH_QTY });
            else if (cursor) streamers = await this.getStreamersOnline({ id, quantity: this.FETCH_QTY, paginator: cursor });

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
