import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryListComponent } from './category/category-list.component';
import { CategoryEditComponent } from './category/category-edit.component';
import { ItemListComponent } from './item/item-list.component';
import { ItemEditComponent } from './item/item-edit.component';

import { OverviewComponent } from './overview.component';

const routes: Routes = [
  { path: '', component: OverviewComponent },        // default overview
  { path: 'category', component: CategoryListComponent },
  { path: 'category/add', component: CategoryEditComponent },
  { path: 'category/edit/:id', component: CategoryEditComponent },
  { path: 'item', component: ItemListComponent },
  { path: 'item/add', component: ItemEditComponent },
  { path: 'item/edit/:id', component: ItemEditComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddRoutingModule {}
