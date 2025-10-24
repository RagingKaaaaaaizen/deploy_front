import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, SuperAdminGuard } from '@app/_helpers';
import { Role } from '@app/_models';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: ListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'add', component: AddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'edit/:id', component: AddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
    { path: 'view/:id', component: AddEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule { }