import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../_services/category.service';
import { ItemService } from '../_services/item.service';
import { BrandService } from '../_services/brand.service';
import { StorageLocationService } from '../_services/storage-location.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  categories: any[] = [];
  items: any[] = [];
  brands: any[] = [];
  storageLocations: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private itemService: ItemService,
    private brandService: BrandService,
    private storageLocationService: StorageLocationService
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

    // Get first 3 brands
    this.brandService.getAll().subscribe(brands => {
      this.brands = brands.slice(0, 3);
    });

    // Get first 3 storage locations
    this.storageLocationService.getAll().subscribe(locations => {
      this.storageLocations = locations.slice(0, 3);
    });
  }
}
