/* eslint-disable no-unused-vars */
export type Token = {
    access_token: string;
    expires_in: number;
    token_type: string;
};

export type StreamerByName = {
    broadcaster_language: string;
    broadcaster_login: string;
    display_name: string;
    game_id: number;
    game_name: string;
    id: number;
    is_live: true;
    tags_ids: string[];
    thumbnail_url: string;
    title: string;
    started_at: string;
};

export type ChannelSearchName = {
    data: StreamerByName[];
    pagination: {
        cursor?: string;
    };
};

export type StreamerOnline = {
    id: number;
    user_id: number;
    user_login: string;
    user_name: string;
    game_id: number;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
    is_mature: boolean;
};

export type StreamerSearchOnline = {
    data: StreamerOnline[];
    pagination: {
        cursor?: string;
    };
};

export type Game = {
    id: string;
    name: string;
    box_art_url: string;
};

export type GamesSearchOnline = {
    data: Game[];
    pagination: {
        cursor?: string;
    };
};

export type Clip = {
    id: string;
    url: string;
    embed_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_id: string;
    creator_name: string;
    video_id: string;
    game_id: string;
    language: string;
    title: string;
    view_count: number;
    created_at: Date;
    thumbnail_url: string;
    duration: number;
};

export type ClipsSearchOnline = {
    data: Clip[];
    pagination: {
        cursor?: string;
    };
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
    /**
     * Get a streamer by the name
     * @param name -
     */
    getStreamerByName(name: string): Promise<StreamerByName | null>;
    /**
     * Get a streamers by the name
     * @param name -
     * @param quantity -
     * @param paginator - Optional
     */
    getStreamersByName({ name, quantity, paginator }: { name: string; quantity: number; paginator?: string }): Promise<ChannelSearchName | null>;
    /**
     * Get a online streamer by the id
     * @param id -
     */
    getStreamerOnline(id: string): Promise<StreamerOnline | null>;
    /**
     * Get a online streamers by the id
     * @param id -
     * @param quantity -
     * @param paginator - Optional
     */
    getStreamersOnline({ id, quantity, paginator }: { id: string; quantity: number; paginator?: string }): Promise<StreamerSearchOnline | null>;
    /**
     * Get top games of twitch
     * @param quantity -
     */
    getClips({
        quantity,
        id,
        gameId,
        broadcasterId,
    }: {
        quantity?: number;
        id?: string | Array<string>;
        gameId?: string;
        broadcasterId?: string;
    }): Promise<Clip[] | null>;
}
