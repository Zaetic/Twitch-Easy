import { Clips, Games, Streamers } from './modules';
import { ITwitchAPI } from './types/twitchAPI';
import { Auth, Http } from './services';

export default class TwitchAPI implements ITwitchAPI {
    private readonly _games: Games;
    private readonly _streamers: Streamers;
    private readonly _clips: Clips;
    private readonly _auth: Auth;
    private readonly _http: Http;

    constructor(clientId: string, clientSecret: string) {
        this._http = new Http();
        this._auth = new Auth(this._http, clientId, clientSecret);
        this._streamers = new Streamers(this._http, this._auth);
        this._clips = new Clips(this._http, this._auth);
        this._games = new Games(this._http, this._auth);
    }

    public get games(): Games {
        return this._games;
    }

    public get streamers(): Streamers {
        return this._streamers;
    }

    public get clips(): Clips {
        return this._clips;
    }
}
