import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, SuperAdminGuard } from '@app/_helpers';
import { Role } from '@app/_models';

import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: ListComponent, canActivate: [SuperAdminGuard] },
    { path: 'add', component: AddEditComponent, canActivate: [SuperAdminGuard] },
    { path: 'edit/:id', component: AddEditComponent, canActivate: [SuperAdminGuard] },
    { path: 'view/:id', component: AddEditComponent, canActivate: [SuperAdminGuard] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule { }