import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountService } from '@app/_services';
import { Role } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class ApprovalRedirectGuard {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const account = this.accountService.accountValue;
        if (account) {
            // If user is Staff, redirect to my-requests
            if (account.role === Role.Staff) {
                this.router.navigate(['/approvals/my-requests']);
                return false;
            }
            
            // For SuperAdmin and Admin, allow access to main approval list
            if (account.role === Role.SuperAdmin || account.role === Role.Admin) {
                return true;
            }
        }

        // Not logged in so redirect to login page
        this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
