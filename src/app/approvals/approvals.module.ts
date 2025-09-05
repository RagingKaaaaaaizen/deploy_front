import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovalsRoutingModule } from './approvals-routing.module';

// Components
import { ApprovalListComponent } from './approval-list.component';
import { ApprovalDetailComponent } from './approval-detail.component';
import { MyRequestsComponent } from './my-requests.component';

@NgModule({
  declarations: [
    ApprovalListComponent,
    ApprovalDetailComponent,
    MyRequestsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApprovalsRoutingModule
  ]
})
export class ApprovalsModule { }
