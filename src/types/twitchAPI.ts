import { Clips, Games, Streamers } from '../modules';

export interface ITwitchAPI {
    get games(): Games;
    get streamers(): Streamers;
    get clips(): Clips;
}
