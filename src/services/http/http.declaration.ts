import { AxiosResponse } from 'axios';

export interface IHttp {
    /**
     * Http Post
     * @param Object
     */
    post({ url, headers, body }: { url: string; headers: Record<string, string>; body: Record<string, any> }): Promise<AxiosResponse<any, any>>;
    /**
     * Http Get
     * @param Object
     */
    get({ url, headers }: { url: string; headers: Record<string, string> }): Promise<AxiosResponse<any, any>>;
}
