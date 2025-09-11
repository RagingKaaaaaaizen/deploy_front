import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StockListComponent } from './stock-list.component';
import { StockEditComponent } from './stock-edit.component';
import { ConfirmationModalComponent } from '../_components/confirmation-modal.component';

const routes: Routes = [
  { path: '', component: StockListComponent },        // /stocks
  { path: 'add', component: StockEditComponent },     // /stocks/add
  { path: 'edit/:id', component: StockEditComponent } // /stocks/edit/:id
];


@NgModule({
  declarations: [
    StockListComponent,
    StockEditComponent,
    ConfirmationModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class StocksModule {}
