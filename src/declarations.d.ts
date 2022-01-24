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
