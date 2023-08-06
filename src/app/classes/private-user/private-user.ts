import { UserExtra } from "../user-extra/user-extra";
import { UserGroups } from "../user-groups/user-groups";

export class PrivateUser {

    public id: number;
    public username: string;
    public email: string;
    public first_name: string;
    public last_name: string;
    public token: string;
    public is_active: boolean;
    public is_staff: boolean;
    public is_superuser: boolean;
    public date_joined: string;
    public last_login: string;
    public created_with_google: boolean;
    public groups: UserGroups;
    public user_extra: UserExtra;
    public reports: number;

    constructor(id: number, username: string, email: string, first_name: string, last_name: string, 
        token: string, is_active: boolean, is_staff: boolean, is_superuser: boolean, date_joined: string, 
        last_login: string, created_with_google: boolean, groups: UserGroups, user_extra: UserExtra, reports: number) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.token = token;
        this.is_active = is_active;
        this.is_staff = is_staff;
        this.is_superuser = is_superuser;
        this.date_joined = date_joined;
        this.last_login = last_login;
        this.created_with_google = created_with_google;
        this.groups = groups;
        this.user_extra = user_extra;
        this.reports = reports;
    }
}
