/* eslint-disable class-methods-use-this */
import { AxiosResponse } from 'axios';
import { IHttp } from './http.declaration';

class HttpMemory implements IHttp {
    public async post({
        url,
        headers,
        body,
    }: {
        url: string;
        headers: Record<string, string>;
        body: Record<string, any>;
    }): Promise<AxiosResponse<any, any>> {
        const config: any = { headers: {} };
        return { data: {}, headers: {}, status: 200, statusText: 'ok', config };
    }

    public async get({ url, headers }: { url: string; headers: Record<string, string> }): Promise<AxiosResponse<any, any>> {
        const config: any = { headers: {} };
        return { data: {}, headers: {}, status: 200, statusText: 'ok', config };
    }
}

export { HttpMemory };
