import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // Don't auto-logout for analytics endpoints that require admin role or are accessible to all roles
            const isAnalyticsRestrictedEndpoint = request.url.includes('/analytics/') && (
                request.url.includes('/automated-schedule') ||
                request.url.includes('/low-stock-items') ||
                request.url.includes('/out-of-stock-items') ||
                request.url.includes('/pending-requests') ||
                request.url.includes('/stock-by-location') ||
                request.url.includes('/monthly-stock-additions') ||
                request.url.includes('/monthly-disposals') ||
                request.url.includes('/top-categories') ||
                request.url.includes('/most-replaced-components') ||
                request.url.includes('/average-lifespan') ||
                request.url.includes('/replacement-patterns') ||
                request.url.includes('/advanced-analytics') ||
                request.url.includes('/dashboard') ||
                request.url.includes('/generate-report') ||
                request.url.includes('/test')
            );
            
            if ([401, 403].includes(err.status) && this.accountService.accountValue && !isAnalyticsRestrictedEndpoint) {
                // auto logout if 401 or 403 response returned from api (except for analytics restricted endpoints)
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
            
            // Production-specific error logging
            if (environment.production) {
                console.error('HTTP Error in Production:', {
                    url: request.url,
                    method: request.method,
                    status: err.status,
                    statusText: err.statusText,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.error('HTTP Error:', err);
            }
            
            return throwError(error);
        }))
    }
}