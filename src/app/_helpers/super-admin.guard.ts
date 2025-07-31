import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const account = this.accountService.accountValue;
        if (account && account.role === 'SuperAdmin') {
            return true;
        }

        // not authorized, redirect to home page
        this.router.navigate(['/']);
        return false;
    }
} 