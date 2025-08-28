import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // Production-specific logging
        if (environment.production) {
            console.log('🚀 Starting application in production mode');
        }
        
        // attempt to refresh token on app start up to auto authenticate
        accountService.refreshToken()
            .subscribe({
                next: () => {
                    if (environment.production) {
                        console.log('✅ Token refresh successful in production');
                    } else {
                        console.log('Token refresh successful');
                    }
                    resolve();
                },
                error: (error) => {
                    if (environment.production) {
                        console.log('⚠️ Token refresh failed in production:', error);
                    } else {
                        console.log('Token refresh failed:', error);
                    }
                    // Don't block app startup if refresh fails
                    resolve();
                }
            });
    });
}