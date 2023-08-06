import { PublicUser } from "../public-user/public-user";

export class EpisodeComment {

    public id: number;
    public episode: number;
    public episode_detail: any;
    public censored: boolean;
    public user: PublicUser;
    public reports: number;
    public spoiler: boolean;
    public created_at: string;
    public comment: string;

    // constructor(id: number, episode: number, user: PublicUser, created_at: string, comment: string) {
    //     this.id = id;
    //     this.episode = episode;
    //     this.user = user;
    //     this.created_at = created_at;
    //     this.comment = comment;
    // }
}
