import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddRoutingModule } from './add-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { CategoryListComponent } from './category/category-list.component';
import { CategoryEditComponent } from './category/category-edit.component';
import { ItemListComponent } from './item/item-list.component';
import { ItemEditComponent } from './item/item-edit.component';
import { OverviewComponent } from './overview.component';

@NgModule({
  declarations: [
    OverviewComponent,
    CategoryListComponent,
    CategoryEditComponent,
    ItemListComponent,
    ItemEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AddRoutingModule
  ]
})

export class AddModule {}
