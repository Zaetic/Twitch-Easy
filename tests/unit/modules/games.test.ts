import { Games } from '../../../src/modules';
import { AuthMemory } from '../../../src/services/auth/auth.memory';
import { HttpMemory } from '../../../src/services/http/http.memory';
import { IAuth } from '../../../src/services/auth/auth.declaration';
import { IHttp } from '../../../src/services/http/http.declaration';

describe('Games', () => {
    const dataMockTop = [
        {
            id: '509658',
            name: 'Just Chatting',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/509658-{width}x{height}.jpg',
            igdb_id: '',
        },
        {
            id: '838226069',
            name: 'The Callisto Protocol',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/838226069_IGDB-{width}x{height}.jpg',
            igdb_id: '141538',
        },
        {
            id: '21779',
            name: 'League of Legends',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/21779-{width}x{height}.jpg',
            igdb_id: '115',
        },
        {
            id: '32982',
            name: 'Grand Theft Auto V',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-{width}x{height}.jpg',
            igdb_id: '1020',
        },
        {
            id: '512710',
            name: 'Call of Duty: Warzone',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/512710-{width}x{height}.jpg',
            igdb_id: '131800',
        },
    ];

    const dataMockName = [
        {
            id: '65876',
            name: 'Cyberpunk 2077',
            box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/65876_IGDB-{width}x{height}.jpg',
            igdb_id: '1877',
        },
    ];

    it('[getTopGames] Should call getTopGames and return a array of 5 top games', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 200,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '799',
                'ratelimit-reset': '1670004777',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: { data: dataMockTop },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        const findGames = await games.getTopGames(5);
        expect(findGames).not.toBeNaN();
        expect(findGames).not.toBeNull();
        expect(findGames).toHaveLength(5);
        expect(findGames).toEqual(dataMockTop);
    });

    it('[getTopGames] Should call getTopGames and return a rate limit error', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 429,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '0',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: {},
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        await expect(games.getTopGames(5)).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getTopGames] Should call getTopGames and return a unexpected error', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 500,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        const findGames = await games.getTopGames(5);
        expect(findGames).not.toEqual(dataMockTop);
        expect(findGames).not.toBeNaN();
        expect(findGames).toBeNull();
    });

    it('[getTopGames] Should call getTopGames with a number equal 0 and return a throw', async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        await expect(games.getTopGames(0)).rejects.toThrow('The parameter "quantity" was malformed: the value must be greater than or equal to 1');
    });

    it('[getGameByName] Should call getGameByName and return a game by name', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 200,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '799',
                'ratelimit-reset': '1670004777',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: { data: dataMockName },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        const findGame = await games.getGameByName('cyberpunk 2077');
        expect(findGame).not.toBeNaN();
        expect(findGame).not.toBeNull();
        expect(typeof findGame).toBe('object');
        expect(findGame).toEqual(dataMockName[0]);
    });

    it('[getGameByName] Should call getGameByName and return a rate limit error', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 429,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '0',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: {},
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        await expect(games.getGameByName('cyberpunk 2077')).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getGameByName] Should call getGameByName and return a unexpected error', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 500,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        const findGame = await games.getGameByName('cyberpunk 2077');
        expect(findGame).not.toEqual(dataMockName[0]);
        expect(findGame).not.toBeNaN();
        expect(findGame).toBeNull();
    });

    it(`[getGameByName] Should call getGameByName with a string equal '' or null and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const games = new Games(_http, _auth);

        await expect(games.getGameByName('')).rejects.toThrow('Name is null, pass a value');
    });
});
