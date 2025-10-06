import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';
import { Role } from './_models';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const adminModule = () => import('./admin/admin.module').then(x => x.AdminModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);

const addModule = () => import('./add/add.module').then(x => x.AddModule);
const stocksModule = () => import('./stocks/stocks.module').then(x => x.StocksModule);
const pcModule = () => import('./pc/pc.module').then(x => x.PCModule);
const disposeModule = () => import('./dispose/dispose.module').then(x => x.DisposeModule);
const archiveModule = () => import('./archive/archive.module').then(x => x.ArchiveModule);
const analyticsModule = () => import('./analytics/analytics.module').then(x => x.AnalyticsModule);
const approvalsModule = () => import('./approvals/approvals.module').then(x => x.ApprovalsModule);

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: adminModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'add', loadChildren: addModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] } },
    { path: 'stocks', loadChildren: stocksModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'dispose', loadChildren: disposeModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'approvals', loadChildren: approvalsModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] } },
    
    { path: 'pc', loadChildren: pcModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    
    { path: 'activity', loadChildren: () => import('./activity/activity.module').then(x => x.ActivityModule), canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'archive', loadChildren: archiveModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer] } },
    { path: 'analytics', loadChildren: analyticsModule, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },

    { path: '**', redirectTo: '' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule] 
})      
export class AppRoutingModule { }
