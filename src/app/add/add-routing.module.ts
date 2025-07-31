import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@app/_helpers';
import { Role } from '@app/_models';

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
  { path: '', component: OverviewComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },        // default overview
  { path: 'category', component: CategoryListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
  { path: 'category/add', component: CategoryEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'category/edit/:id', component: CategoryEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'category/view/:id', component: CategoryEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },

  { path: 'item', component: ItemListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
  { path: 'item/add', component: ItemEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'item/edit/:id', component: ItemEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'item/view/:id', component: ItemEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },

  // NEW BRAND ROUTES
  { path: 'brand', component: BrandListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
  { path: 'brand/add', component: BrandEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'brand/edit/:id', component: BrandEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'brand/view/:id', component: BrandEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },

 
  { path: 'storage-locations', component: StorageLocationListComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
  { path: 'storage-locations/add', component: StorageLocationAddComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'storage-locations/edit/:id', component: StorageLocationEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin] } },
  { path: 'storage-locations/view/:id', component: StorageLocationEditComponent, canActivate: [AuthGuard], data: { roles: [Role.SuperAdmin, Role.Admin, Role.Viewer] } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddRoutingModule {}
