import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { RealTimeDashboardComponent } from './real-time-dashboard.component';

const routes: Routes = [
  { path: '', component: AnalyticsDashboardComponent },
  { path: 'realtime', component: RealTimeDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { }
