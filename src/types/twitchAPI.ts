import { Clips, Games, Streamers } from '../modules';

export interface ITwitchAPI {
    /**
     * Get games module
     */
    get games(): Games;
    /**
     * Get streamers module
     */
    get streamers(): Streamers;
    /**
     * Get clips module
     */
    get clips(): Clips;
}
