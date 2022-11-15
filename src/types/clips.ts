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

export interface IClips {
    /**
     * Get clips by id, gameid, broadcasterId.
     * - You may specify only one of these parameters.
     * @param id - Optional
     * @param gameId - Optional
     * @param broadcasterId - Optional
     * @param quantity - Optional
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
