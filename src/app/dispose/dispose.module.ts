import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DisposeComponent } from './dispose.component';
import { DisposeListComponent } from './dispose-list.component';

const routes: Routes = [
  { path: '', component: DisposeListComponent },
  { path: 'add', component: DisposeComponent },
  { path: 'edit/:id', component: DisposeComponent },
  { path: 'view/:id', component: DisposeComponent }
];

@NgModule({
  declarations: [
    DisposeComponent,
    DisposeListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class DisposeModule { } 