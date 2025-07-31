import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if ([401, 403].includes(err.status) && this.accountService.accountValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();
            }

            // Better error message extraction
            let error = '';
            if (err.error && err.error.message) {
                error = err.error.message;
            } else if (err.message) {
                error = err.message;
            } else if (err.statusText) {
                error = err.statusText;
            } else {
                error = 'An unexpected error occurred';
            }
            
            console.error('HTTP Error:', err);
            return throwError(error);
        }))
    }
}