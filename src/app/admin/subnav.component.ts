import { Component } from '@angular/core';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Component({ templateUrl: 'subnav.component.html' })
export class SubNavComponent {
    Role = Role;

    constructor(public accountService: AccountService) { }

    hasRole(roles: Role[]): boolean {
        const account = this.accountService.accountValue;
        if (!account) return false;
        return roles.some(role => role === account.role);
    }
}