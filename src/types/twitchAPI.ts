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

export interface ITwitchAPI {
    ratelimit: Date | undefined;

    /**
     * Get and update token
     */
    getToken(): Promise<void>;
    /**
     * Check if the token is valid
     */
    checkToken(): Promise<Boolean>;
    getToken(): Promise<void>;
    checkToken(): Promise<Boolean>;
    updateRateReset(rate: string | null): void;
    createHeader(): Header;
}
