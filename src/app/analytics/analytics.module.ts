import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';

import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { RealTimeDashboardComponent } from './real-time-dashboard.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    RealTimeDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AnalyticsRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ]
})
export class AnalyticsModule { }
