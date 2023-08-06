import { UserGroups } from "../user-groups/user-groups";

export class PublicUser {

    public id: number;
    public url: string;
    public username: string;
    public is_staff: boolean;
    public is_superuser: boolean;
    public email: string;
    public is_active: boolean;
    public user_extra: any;
    public groups: UserGroups;

    constructor(id: number, url: string, username: string, is_staff: boolean, is_superuser: boolean, email: string, is_active: boolean, user_extra: any, groups: UserGroups) {
        this.id = id;
        this.url = url;
        this.username = username;
        this.is_staff = is_staff;
        this.is_superuser = is_superuser;
        this.email = email;
        this.is_active = is_active;
        this.user_extra = user_extra;
        this.groups = groups;
    }

}
