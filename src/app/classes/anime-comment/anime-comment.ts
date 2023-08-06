import { PublicUser } from "../public-user/public-user";

export class AnimeComment {

    public id: number;
    public anime: number;
    public anime_detail: any;
    public censored: boolean;
    public user: PublicUser;
    public reports: number;
    public spoiler: boolean;
    public created_at: string;
    public comment: string;

    // constructor(id: number, anime: number, user: PublicUser, created_at: string, comment: string) {
    //     this.id = id;
    //     this.anime = anime;
    //     this.user = user;
    //     this.created_at = created_at;
    //     this.comment = comment;
    // }
}
