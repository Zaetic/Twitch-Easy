import { Clips } from '../../../src/modules';
import { AuthMemory } from '../../../src/services/auth/auth.memory';
import { HttpMemory } from '../../../src/services/http/http.memory';
import { IAuth } from '../../../src/services/auth/auth.declaration';
import { IHttp } from '../../../src/services/http/http.declaration';

describe('Clips', () => {
    const dataMock = [
        {
            id: 'DeliciousDelightfulPickles',
            url: 'https://clips.twitch.tv/DeliciousDelightfulPickles',
            embed_url: 'https://clips.twitch.tv/embed?clip=DeliciousDelightfulPickles',
            broadcaster_id: '10000000',
            broadcaster_name: 'tester',
            creator_id: '20000000',
            creator_name: 'test_creator',
            video_id: '300000000',
            game_id: '65876',
            language: 'en',
            title: 'Makes the wrong choice',
            view_count: 759492,
            created_at: '2020-12-09T19:18:10Z',
            thumbnail_url: 'https://clips-media-assets2.twitch.tv/AT-cm%7C100000000-preview-480x272.jpg',
            duration: 44.9,
            vod_offset: null,
        },
        {
            id: 'AnnoyingDepressedEmuKappa',
            url: 'https://clips.twitch.tv/AnnoyingDepressedEmuKappa',
            embed_url: 'https://clips.twitch.tv/embed?clip=AnnoyingDepressedEmuKappa',
            broadcaster_id: '10000001',
            broadcaster_name: 'tester1',
            creator_id: '20000001',
            creator_name: 'test_creator1',
            video_id: '400000000',
            game_id: '65876',
            language: 'en',
            title: 'Cyberpunk 2077 driving',
            view_count: 662569,
            created_at: '2018-08-27T17:26:43Z',
            thumbnail_url: 'https://clips-media-assets2.twitch.tv/AT-cm%7C200000000-preview-480x272.jpg',
            duration: 44,
            vod_offset: 33977,
        },
    ];

    it('[getClips] Should call getClips and return a array of clips', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 200,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '799',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: { data: dataMock },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const clips = new Clips(_http, _auth);

        const findClips = await clips.getClips({ gameId: '65876' });
        expect(findClips).not.toBeNaN();
        expect(findClips).not.toBeNull();
        expect(findClips).toHaveLength(2);
        expect(findClips).toEqual(dataMock);
    });

    it('[getClips] Should call getClips and return a rate limit error', async () => {
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
        const clips = new Clips(_http, _auth);

        await expect(clips.getClips({ gameId: '65876' })).rejects.toThrow('Excess rate limit, will be reset at');
    });

    it('[getClips] Should call getClips and return a unexpected error', async () => {
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
        const clips = new Clips(_http, _auth);

        const findClips = await clips.getClips({ gameId: '65876' });
        expect(findClips).not.toEqual(dataMock);
        expect(findClips).not.toBeNaN();
        expect(findClips).toBeNull();
    });

    it('[getClips] Should call getClips without params and return a throw', async () => {
        const _http: IHttp = new HttpMemory();
        const mock = {
            status: 200,
            statusText: 'OK',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'ratelimit-limit': '800',
                'ratelimit-remaining': '799',
                'ratelimit-reset': '1669809433',
                'timing-allow-origin': 'https://www.twitch.tv',
            },
            data: { data: dataMock },
        };

        _http.get = jest.fn().mockImplementationOnce(() => Promise.resolve(mock));

        const _auth: IAuth = new AuthMemory(_http, '', '');
        const clips = new Clips(_http, _auth);

        await expect(clips.getClips({})).rejects.toThrow('id (one or more), broadcasterId, or gameId must be specified');
    });

    it('[getClips] Should call getClips with a invalid number and return a throw', async () => {
        const _http: IHttp = new HttpMemory();
        const _auth: IAuth = new AuthMemory(_http, '', '');
        const clips = new Clips(_http, _auth);

        const errorMessage = 'The parameter "quantity" was malformed: the value must be greater than or equal to 1';
        await expect(clips.getClips({ gameId: '65876', quantity: -1 })).rejects.toThrow(errorMessage);
        await expect(clips.getClips({ gameId: '65876', quantity: Number.MAX_SAFE_INTEGER })).rejects.toThrow(errorMessage);
    });
});
