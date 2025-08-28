import { environment } from '@environments/environment';
import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // Production-specific logging
        if (environment.production) {
            console.log('🚀 Starting application in production mode');
        }
        
        // Check if there's an existing account (user is logged in)
        const currentAccount = accountService.accountValue;
        
        if (currentAccount && currentAccount.jwtToken) {
            // Only attempt to refresh token if user is already logged in
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
        } else {
            // No existing account, skip token refresh
            if (environment.production) {
                console.log('ℹ️ No existing session found, skipping token refresh');
            } else {
                console.log('No existing session found, skipping token refresh');
            }
            resolve();
        }
    });
}