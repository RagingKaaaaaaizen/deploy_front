import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../_services/category.service';
import { ItemService } from '../_services/item.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  
})
export class OverviewComponent implements OnInit {
  categories: any[] = [];
  items: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  

  loadOverview(): void {
    // Get first 3 categories
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories.slice(0, 3);
    });

    // Get first 3 items
    this.itemService.getAll().subscribe(items => {
      this.items = items.slice(0, 3);
    });
  }
}
