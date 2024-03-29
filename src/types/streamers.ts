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

export type getStreamersByNameParams = {
    name: string;
    quantity: number;
    paginator?: string;
    retry?: boolean;
};

export type getStreamersOnlineParams = {
    id: string;
    quantity: number;
    paginator?: string;
    retry?: boolean;
};

export interface IStreamers {
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
    getStreamersByName({ name, quantity, paginator }: getStreamersByNameParams): Promise<ChannelSearchName | null>;
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
    getStreamersOnline({ id, quantity, paginator }: getStreamersOnlineParams): Promise<StreamerSearchOnline | null>;
}
