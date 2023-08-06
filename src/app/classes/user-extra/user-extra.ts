export class UserExtra {

    public id: number;
    public user: number;
    public avatar: string;
    public thirteen_age_coppa_compliant: boolean;
    public ban_reason: string;
    public ban_date: string;
    public ban_admin: any;

    constructor(id: number, user: number, avatar: string, thirteen_age_coppa_compliant: boolean, ban_reason: string, 
        ban_date: string, ban_admin: any) {
        this.id = id;
        this.user = user;
        this.avatar = avatar;
        this.thirteen_age_coppa_compliant = thirteen_age_coppa_compliant;
        this.ban_reason = ban_reason;
        this.ban_date = ban_date;
        this.ban_admin = ban_admin;
    }
}
