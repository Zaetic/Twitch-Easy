import { GET_GAMES, GET_GAMES_TOP } from '../defaults';
import { Game, GamesSearchOnline } from '../types/games';
import { IHttp } from '../services/http/http.declaration';
import { IAuth } from '../services/auth/auth.declaration';

class Games {
    private FETCH_QTY = 100;
    private PARAM_QTY = 20;

    constructor(private readonly http: IHttp, private readonly auth: IAuth) {}

    public async getTopGames(quantity: number): Promise<Game[] | null> {
        if (quantity < 1) throw new Error('The parameter "quantity" was malformed: the value must be greater than or equal to 1');

        let cursor: string | null = null;
        let games: Game[] = [];
        let finish = false;

        if (quantity < this.FETCH_QTY) {
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
                    const quantityLeft = left < this.FETCH_QTY ? left : this.FETCH_QTY;

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

    private async fetchTopGames({
        quantity = this.PARAM_QTY,
        paginator,
    }: {
        quantity: number;
        paginator?: string;
    }): Promise<GamesSearchOnline | null> {
        await this.auth.getToken();
        const headers = this.auth.createHeader();

        const url = paginator ? `${GET_GAMES_TOP}?first=${quantity}&after=${paginator}` : `${GET_GAMES_TOP}?first=${quantity}`;

        const games: GamesSearchOnline = await this.http
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

    private async fetchGames({
        quantity = this.PARAM_QTY,
        name,
        id,
        paginator,
    }: {
        quantity: number;
        name?: string;
        id?: string;
        paginator?: string;
    }): Promise<GamesSearchOnline | null> {
        await this.auth.getToken();
        const headers = this.auth.createHeader();

        let url = `${GET_GAMES}?`;

        if (name) url += `name=${name}&quantity=${quantity}`;
        if (id) url += `id=${id}&quantity=${quantity}`;
        if (paginator) url += `&after=${paginator}`;

        const games: GamesSearchOnline = await this.http
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

    public async getGameByName(name: string): Promise<Game | null> {
        if (!name) throw new Error('Name is null, pass a value');

        let cursor: string | null = null;
        let game: Game | null = null;
        let finish = false;

        while (finish === false) {
            let games: GamesSearchOnline | null = null;

            if (!cursor) games = await this.fetchGames({ name, quantity: this.FETCH_QTY });
            else if (cursor) games = await this.fetchGames({ name, quantity: this.FETCH_QTY, paginator: cursor });

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
        if (!id) throw new Error('Id is null, pass a value');

        let cursor: string | null = null;
        let game: Game | null = null;
        let finish = false;

        while (finish === false) {
            let games: GamesSearchOnline | null = null;

            if (!cursor) games = await this.fetchGames({ id, quantity: this.FETCH_QTY });
            else if (cursor) games = await this.fetchGames({ id, quantity: this.FETCH_QTY, paginator: cursor });

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

export { Games };
