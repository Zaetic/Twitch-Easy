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

export type FetchTopGamesParams = {
    quantity: number;
    paginator?: string;
    retry?: boolean;
};

export type FetchGamesParams = {
    quantity: number;
    name?: string;
    id?: string;
    paginator?: string;
    retry?: boolean;
};

export interface IGames {
    /**
     * Get top games of twitch
     * @param quantity -
     */
    getTopGames(quantity: number): Promise<Game[] | null>;
    /**
     * Get a game by the name
     * @param name
     */
    getGameByName(name: string): Promise<Game | null>;
    /**
     * Get a game by the id
     * @param id
     */
    getGameById(id: string): Promise<Game | null>;
}
