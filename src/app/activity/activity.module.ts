import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ActivityComponent } from '../profile/activity.component';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityTimelineComponent } from '../_components/activity-timeline/activity-timeline.component';
import { ActivityActionIconComponent } from '../_components/activity-action-icon/activity-action-icon.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ActivityRoutingModule
    ],
    declarations: [
        ActivityComponent,
        ActivityTimelineComponent,
        ActivityActionIconComponent
    ]
})
export class ActivityModule { }
