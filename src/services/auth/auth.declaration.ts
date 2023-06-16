export type Headers = {
    'Content-Type': string;
    'Client-ID': string;
    Authorization: string;
};

export type Token = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export interface IAuth {
    get ratelimit_reset(): Date | undefined;
    /**
     * Get auth token
     */
    getToken(): Promise<void>;
    /**
     * Check if token is not expired
     */
    checkToken(): Promise<Boolean>;
    /**
     * Update reset rate
     * @param rate String
     */
    updateRateReset(rate: string | null): void;
    /**
     * Create base headers
     */
    createHeader(): Headers;
}
