import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // attempt to refresh token on app start up to auto authenticate
        accountService.refreshToken()
            .subscribe({
                next: () => {
                    console.log('Token refresh successful');
                    resolve();
                },
                error: (error) => {
                    console.log('Token refresh failed:', error);
                    // Don't block app startup if refresh fails
                    resolve();
                }
            });
    });
}