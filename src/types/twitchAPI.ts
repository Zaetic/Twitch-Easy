/* eslint-disable no-unused-vars */
export type Token = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export type Header = {
    'Content-Type': string;
    'Client-ID': string;
    Authorization: string;
};

export interface ITwitchAPI {}
