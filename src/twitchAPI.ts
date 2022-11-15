import { Clips, Games, Streamers } from './modules';
import { ITwitchAPI } from './types/twitchAPI';
import { Auth } from './services';

export default class TwitchAPI implements ITwitchAPI {
    private _games: Games;
    private _streamers: Streamers;
    private _clips: Clips;
    private _auth: Auth;

    constructor(clientId: string, clientSecret: string) {
        this._auth = new Auth(clientId, clientSecret);
        this._streamers = new Streamers(this._auth);
        this._clips = new Clips(this._auth);
        this._games = new Games(this._auth);
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
