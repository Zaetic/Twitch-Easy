import { IClips, IGames, IStreamers } from './types';
import { Clips, Games, Streamers } from './modules';
import { IClient } from './types/client';
import { Auth, Http, IAuth, IHttp } from './services';

class Client implements IClient {
    private readonly _games: IGames;
    private readonly _streamers: IStreamers;
    private readonly _clips: IClips;
    private readonly _auth: IAuth;
    private readonly _http: IHttp;

    constructor(private readonly clientId: string, private readonly clientSecret: string) {
        this._http = new Http();
        this._auth = new Auth(this._http, clientId, clientSecret);
        this._streamers = new Streamers(this._http, this._auth);
        this._clips = new Clips(this._http, this._auth);
        this._games = new Games(this._http, this._auth);
    }

    public get games(): IGames {
        return this._games;
    }

    public get streamers(): IStreamers {
        return this._streamers;
    }

    public get clips(): IClips {
        return this._clips;
    }
}

export { Client };
