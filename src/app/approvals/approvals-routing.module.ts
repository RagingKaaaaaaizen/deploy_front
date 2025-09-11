import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/_helpers';
import { ApprovalRedirectGuard } from '@app/_helpers/approval-redirect.guard';
import { Role } from '@app/_models';

import { ApprovalListComponent } from './approval-list.component';
import { ApprovalDetailComponent } from './approval-detail.component';
import { MyRequestsComponent } from './my-requests.component';

const routes: Routes = [
  {
    path: 'my-requests',
    component: MyRequestsComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] }
  },
  {
    path: ':id',
    component: ApprovalDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.SuperAdmin, Role.Admin, Role.Staff] }
  },
  {
    path: '',
    component: ApprovalListComponent,
    canActivate: [ApprovalRedirectGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalsRoutingModule { }
