import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryListComponent } from './category/category-list.component';
import { CategoryEditComponent } from './category/category-edit.component';
import { ItemListComponent } from './item/item-list.component';
import { ItemEditComponent } from './item/item-edit.component';
import { BrandListComponent } from './brand/brand-list.component';
import { BrandEditComponent } from './brand/brand-edit.component';

import { StorageLocationListComponent } from './storage-location/storage-location-list.component';
import { StorageLocationEditComponent } from './storage-location/storage-location-edit.component';  
import { StorageLocationAddComponent } from './storage-location/storage-location-add.component';



import { OverviewComponent } from './overview.component';

const routes: Routes = [
  { path: '', component: OverviewComponent },        // default overview
  { path: 'category', component: CategoryListComponent },
  { path: 'category/add', component: CategoryEditComponent },
  { path: 'category/edit/:id', component: CategoryEditComponent },

  { path: 'item', component: ItemListComponent },
  { path: 'item/add', component: ItemEditComponent },
  { path: 'item/edit/:id', component: ItemEditComponent },

  // NEW BRAND ROUTES
  { path: 'brand', component: BrandListComponent },
  { path: 'brand/add', component: BrandEditComponent },
  { path: 'brand/edit/:id', component: BrandEditComponent },

 
  { path: 'storage-locations', component: StorageLocationListComponent },
  { path: 'storage-locations/add', component: StorageLocationAddComponent },
  { path: 'storage-locations/edit/:id', component: StorageLocationEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddRoutingModule {}
