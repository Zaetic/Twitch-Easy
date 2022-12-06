import { GET_CLIPS } from '../defaults';
import { Clip, ClipsSearchOnline } from '../types/clips';
import { IHttp } from '../services/http/http.declaration';
import { IAuth } from '../services/auth/auth.declaration';

class Clips {
    private FETCH_QTY = 100;
    private PARAM_QTY = 20;

    constructor(private readonly http: IHttp, private readonly auth: IAuth) {}

    public async getClips({
        quantity = this.PARAM_QTY,
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
        if (quantity <= 0 || quantity >= Number.MAX_SAFE_INTEGER)
            throw new Error('The parameter "quantity" was malformed: the value must be greater than or equal to 1');

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

        if (quantity < this.FETCH_QTY) {
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
                    const quantityLeft = left < this.FETCH_QTY ? left : this.FETCH_QTY;
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
        quantity = this.PARAM_QTY,
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
        await this.auth.getToken();
        const headers = this.auth.createHeader();

        let url = `${GET_CLIPS}?`;

        if (id) url += `id=${id}`;
        if (gameId) url += `game_id=${gameId}`;
        if (broadcasterId) url += `broadcaster_id=${broadcasterId}`;

        url += `&first=${quantity}`;
        if (paginator) url += `&after=${paginator}`;

        const games: ClipsSearchOnline = await this.http
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

                return null;
            })
            .catch((err: Error) => {
                throw err;
            });

        return games;
    }
}

export { Clips };
