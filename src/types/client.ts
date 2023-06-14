import { IClips, IGames, IStreamers } from '.';

export interface IClient {
    /**
     * Get games module
     */
    get games(): IGames;
    /**
     * Get streamers module
     */
    get streamers(): IStreamers;
    /**
     * Get clips module
     */
    get clips(): IClips;
}
