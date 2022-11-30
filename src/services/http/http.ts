/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { IHttp } from './http.declaration';

class Http implements IHttp {
    public async post({ url, headers, body }: { url: string; headers: Record<string, string>; body: Record<string, any> }) {
        return axios({
            url,
            method: 'post',
            headers,
            data: body,
        });
    }

    public async get({ url, headers }: { url: string; headers: Record<string, string> }) {
        return axios({
            url,
            method: 'get',
            headers,
        });
    }
}

export { Http };
