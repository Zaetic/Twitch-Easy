import { Streamers } from '../../../src/modules';
import { IAuth, IHttp } from '../../../src/services';
import { AuthMemory } from '../../../src/services/auth/auth.memory';
import { HttpMemory } from '../../../src/services/http/http.memory';

describe('Streamers', () => {
    const dataMockStreamer = {
        data: [
            {
                broadcaster_language: 'en',
                broadcaster_login: 'test',
                display_name: 'Test',
                game_id: '509658',
                game_name: 'Just Chatting',
                id: '200000000',
                is_live: false,
                tag_ids: [],
                thumbnail_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/0-profile_image-300x300.png',
                title: 'Live',
                started_at: '',
            },
            {
                broadcaster_language: 'en',
                broadcaster_login: 'test2',
                display_name: 'Test2',
                game_id: '509658',
                game_name: 'Just Chatting',
                id: '200000001',
                is_live: false,
                tag_ids: [],
                thumbnail_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/0-profile_image-300x300.png',
                title: 'Live',
                started_at: '',
            },
            {
                broadcaster_language: '',
                broadcaster_login: 'test3',
                display_name: 'Test3',
                game_id: '0',
                game_name: '',
                id: '200000002',
                is_live: false,
                tag_ids: [],
                thumbnail_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/0-profile_image-300x300.png',
                title: '',
                started_at: '',
            },
            {
                broadcaster_language: '',
                broadcaster_login: 'test4',
                display_name: 'Test4',
                game_id: '0',
                game_name: '',
                id: '200000003',
                is_live: false,
                tag_ids: [],
                thumbnail_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/0-profile_image-300x300.png',
                title: '',
                started_at: '',
            },
        ],
        pagination: { cursor: 'MTAw' },
    };

    const dataMockOnlineStreamer = {
        data: [
            {
                id: '40000000000',
                user_id: '111111111',
                user_login: 'test',
                user_name: 'test',
                game_id: '509658',
                game_name: 'Just Chatting',
                type: 'live',
                title: 'Live title',
                viewer_count: 500,
                started_at: '2022-12-05T21:05:40Z',
                language: 'pt',
                thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_test-{width}x{height}.jpg',
                tag_ids: [''],
                is_mature: false,
            },
            {
                id: '50000000000',
                user_id: '111111112',
                user_login: 'test1',
                user_name: 'test1',
                game_id: '509658',
                game_name: 'Just Chatting',
                type: 'live',
                title: 'Live title 2',
                viewer_count: 1000,
                started_at: '2022-12-05T21:05:40Z',
                language: 'pt',
                thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_test-{width}x{height}.jpg',
                tag_ids: [''],
                is_mature: false,
            },
        ],
        pagination: {
            cursor: 'ciI6ImV5SnpJam94TmpRME1TNDNOVGcxT',
        },
    };

    it('[getStreamerByName] Should call getStreamerByName and return a streamer by name', async () => {
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
            data: dataMockStreamer,
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const findStreamer = await streamers.getStreamerByName('Test2');
        expect(findStreamer).not.toBeNaN();
        expect(findStreamer).not.toBeNull();
        expect(typeof findStreamer).toBe('object');
        expect(findStreamer).toEqual(dataMockStreamer.data[1]);
    });

    it('[getStreamerByName] Should call getStreamerByName and return a rate limit error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerByName('Test2')).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getStreamerByName] Should call getStreamerByName and return a unexpected error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        const findStreamer = await streamers.getStreamerByName('Test2');
        expect(findStreamer).not.toEqual(dataMockStreamer.data[1]);
        expect(findStreamer).not.toBeNaN();
        expect(findStreamer).toBeNull();
    });

    it(`[getStreamerByName] Should call getStreamerByName with a string equal '' or null and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerByName('')).rejects.toThrow('Name is null, pass a value');
    });

    it('[getStreamerByName] Should call getStreamerByName and return a Service Unavailable error after called 2x', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 503,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementation(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerByName('Test2')).rejects.toThrow('Service Unavailable');
    });

    it('[getStreamersByName] Should call getStreamersByName and return a array of 4 streamers', async () => {
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
            data: dataMockStreamer,
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const findStreamers = await streamers.getStreamersByName({ name: 'test', quantity: 4 });
        const streamersData = findStreamers?.data;
        expect(streamersData).not.toBeNaN();
        expect(streamersData).not.toBeNull();
        expect(streamersData).toHaveLength(4);
        expect(streamersData).toEqual(dataMockStreamer.data);
    });

    it('[getStreamersByName] Should call getStreamersByName and return a rate limit error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersByName({ name: 'test', quantity: 4 })).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getStreamersByName] Should call getStreamersByName and return a unexpected error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        const findStreamers = await streamers.getStreamersByName({ name: 'test', quantity: 4 });
        expect(findStreamers).not.toEqual(dataMockStreamer.data);
        expect(findStreamers).not.toBeNaN();
        expect(findStreamers).toBeNull();
    });

    it(`[getStreamersByName] Should call getStreamersByName with a string equal '' or null and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersByName({ name: '', quantity: 4 })).rejects.toThrow('Name is null, pass a value');
    });

    it(`[getStreamersByName] Should call getStreamersByName with a invalid number and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const errorMessage = 'The parameter "quantity" was malformed: the value must be greater than or equal to 1';
        await expect(streamers.getStreamersByName({ name: 'Test2', quantity: -1 })).rejects.toThrow(errorMessage);
        await expect(streamers.getStreamersByName({ name: 'Test2', quantity: Number.MAX_SAFE_INTEGER })).rejects.toThrow(errorMessage);
    });

    it('[getStreamersByName] Should call getStreamersByName and return a Service Unavailable error after called 2x', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 503,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementation(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersByName({ name: 'Test2', quantity: 10 })).rejects.toThrow('Service Unavailable');
    });

    it('[getStreamersOnline] Should call getStreamersOnline and return a array of 2 online streamers', async () => {
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
            data: dataMockOnlineStreamer,
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const findStreamers = await streamers.getStreamersOnline({ id: '111111111', quantity: 2 });
        const streamersData = findStreamers?.data;
        expect(streamersData).not.toBeNaN();
        expect(streamersData).not.toBeNull();
        expect(streamersData).toHaveLength(2);
        expect(streamersData).toEqual(dataMockOnlineStreamer.data);
    });

    it('[getStreamersOnline] Should call getStreamersOnline and return a rate limit error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersOnline({ id: '111111111', quantity: 2 })).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getStreamersOnline] Should call getStreamersOnline and return a unexpected error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        const findStreamers = await streamers.getStreamersOnline({ id: '111111111', quantity: 2 });
        expect(findStreamers).not.toEqual(dataMockOnlineStreamer.data);
        expect(findStreamers).not.toBeNaN();
        expect(findStreamers).toBeNull();
    });

    it(`[getStreamersOnline] Should call getStreamersOnline with a string equal '' or null and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersOnline({ id: '', quantity: 2 })).rejects.toThrow('ID is null, pass a value');
    });

    it(`[getStreamersOnline] Should call getStreamersOnline with a invalid number and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const errorMessage = 'The parameter "quantity" was malformed: the value must be greater than or equal to 1';
        await expect(streamers.getStreamersOnline({ id: '111111111', quantity: -1 })).rejects.toThrow(errorMessage);
        await expect(streamers.getStreamersOnline({ id: '111111111', quantity: Number.MAX_SAFE_INTEGER })).rejects.toThrow(errorMessage);
    });

    it('[getStreamersOnline] Should call getStreamersOnline and return a Service Unavailable error after called 2x', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 503,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementation(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamersOnline({ id: '111111111', quantity: 10 })).rejects.toThrow('Service Unavailable');
    });

    it('[getStreamerOnline] Should call getStreamerOnline and return a streamer by id', async () => {
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
            data: dataMockOnlineStreamer,
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        const findStreamer = await streamers.getStreamerOnline('111111111');
        expect(findStreamer).not.toBeNaN();
        expect(findStreamer).not.toBeNull();
        expect(typeof findStreamer).toBe('object');
        expect(findStreamer).toEqual(dataMockOnlineStreamer.data[0]);
    });

    it('[getStreamerOnline] Should call getStreamerOnline and return a rate limit error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerOnline('111111111')).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getStreamerOnline] Should call getStreamerOnline and return a unexpected error', async () => {
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
        const streamers = new Streamers(_http, _auth);

        const findStreamer = await streamers.getStreamerOnline('111111111');
        expect(findStreamer).not.toEqual(dataMockStreamer.data[0]);
        expect(findStreamer).not.toBeNaN();
        expect(findStreamer).toBeNull();
    });

    it(`[getStreamerOnline] Should call getStreamerOnline with a string equal '' or null and return a throw`, async () => {
        const _http: IHttp = new HttpMemory();

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerOnline('')).rejects.toThrow('ID is null, pass a value');
    });

    it('[getStreamerOnline] Should call getStreamerOnline and return a Service Unavailable error after called 2x', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 503,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '20',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
        };

        _http.get = jest.fn().mockImplementation(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const streamers = new Streamers(_http, _auth);

        await expect(streamers.getStreamerOnline('111111111')).rejects.toThrow('Service Unavailable');
    });
});
