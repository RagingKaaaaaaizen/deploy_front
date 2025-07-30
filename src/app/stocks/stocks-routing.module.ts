import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockListComponent } from './stock-list.component';
import { StockEditComponent } from './stock-edit.component';

const routes: Routes = [
  { path: '', component: StockListComponent },
  { path: 'add', component: StockEditComponent },
  { path: 'edit/:id', component: StockEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StocksRoutingModule {}
