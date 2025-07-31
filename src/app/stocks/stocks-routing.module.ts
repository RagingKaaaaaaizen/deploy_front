import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../_helpers';
import { Role } from '../_models';

import { StockListComponent } from './stock-list.component';
import { StockEditComponent } from './stock-edit.component';

const routes: Routes = [
  { path: '', component: StockListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
  { path: 'add', component: StockEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'edit/:id', component: StockEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'view/:id', component: StockEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule {}
