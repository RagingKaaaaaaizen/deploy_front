import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';

import { ArchiveRoutingModule } from './archive-routing.module';
import { ArchiveComponent } from './archive.component';
import { ArchiveService } from '../_services/archive.service';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        ArchiveRoutingModule
    ],
    declarations: [
        ArchiveComponent,
        BaseChartDirective
    ],
    providers: [
        ArchiveService
    ]
})
export class ArchiveModule { }
