import fetch from 'node-fetch';

export class TwitchAPI {
    private CLIENT_ID: string;
    private CLIENT_SECRET: string;
    private twitchAouth2: string;
    private token: { access_token: string; expires_in: number; time: number; token_type: string; };
    private twitch: { GET_CHANNEL: string, GET_STREAM: string };

    constructor(clientId: string, clientSecret: string) {
        this.CLIENT_ID = clientId;
        this.CLIENT_SECRET = clientSecret;
        this.twitchAouth2 = 'https://id.twitch.tv/oauth2/token';
        this.twitch = {
            GET_CHANNEL: 'https://api.twitch.tv/helix/search/channels',
            GET_STREAM: 'https://api.twitch.tv/helix/streams',
        };
        this.token = {
            access_token: '',
            expires_in: 0,
            time: 0,
            token_type: 'bearer',
        };
    }

    private async getToken(): Promise<void> {
        if (await this.checkToken() === false) return;
        const body = {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            grant_type: 'client_credentials',
        };

        const token = await fetch(this.twitchAouth2, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-type': 'application/json' },
        }).then((res) => res.json());

        this.token.access_token = token.access_token;
        this.token.expires_in = token.expires_in;
        this.token.token_type = token.token_type;
        this.token.time = new Date().getTime();
    }

    private async checkToken(): Promise<Boolean> {
        const errorMargin = 1000;
        if ((this.token.time + this.token.expires_in + errorMargin) >= new Date().getTime()) {
            return false;
        }
        return true;
    }

    public async getStreamersByName(name: string, quantity: number = 20) {
        if (!name) throw new Error('Name is null, pass a value');
        await this.getToken();
        const url = `${this.twitch.GET_CHANNEL}?first=${quantity}&query=${name}`;

        const streamers = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Client-ID': this.CLIENT_ID,
                Authorization: `Bearer ${this.token.access_token}`,
            },
        }).then((res) => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        }).catch((err) => {
            throw new Error(err);
        });

        return streamers;
    }

    public async getStreamersById(id: number, quantity: number = 20) {
        if (!id) throw new Error('ID is null, pass a value');
        await this.getToken();
        const url = `${this.twitch.GET_STREAM}?first=${quantity}&user_id=${id}`;

        const streamers = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Client-ID': this.CLIENT_ID,
                Authorization: `Bearer ${this.token.access_token}`,
            },
        }).then((res) => {
            if (res.status === 200) {
                return res.json();
            }
            return null;
        }).catch((err) => {
            throw new Error(err);
        });

        return streamers;
    }
}
