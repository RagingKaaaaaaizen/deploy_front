import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ActivityComponent } from '../profile/activity.component';
import { ActivityRoutingModule } from './activity-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ActivityRoutingModule
    ],
    declarations: [
        ActivityComponent
    ]
})
export class ActivityModule { }
