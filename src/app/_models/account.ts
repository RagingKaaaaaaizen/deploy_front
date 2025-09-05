import { Role } from './role';

export class Account {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    status?: string;
    jwtToken?: string;
    verified?: Date;
}