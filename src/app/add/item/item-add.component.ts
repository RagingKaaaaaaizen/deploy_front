import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';
import { BrandService } from '../../_services/brand.service';  // <-- NEW

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html'
})
export class ItemAddComponent implements OnInit {
  model: any = {};
  categories: any[] = [];
  brands: any[] = []; // <-- NEW

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService,  // <-- NEW
    private router: Router
  ) {}

  ngOnInit() {
    // Load categories
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err)
    });

    // Load brands
    this.brandService.getAll().subscribe({
      next: (data) => (this.brands = data),
      error: (err) => console.error('Failed to load brands', err)
    });
  }

 saveItem() {
  console.log('Submitting payload:', this.model); // <- Check if brandId appears here

  if (!this.model.name || !this.model.categoryId || !this.model.brandId) {
    alert('Item name, category, and brand are required');
    return;
  }

  this.itemService.create(this.model).subscribe({
    next: () => {
      alert('Item saved!');
      this.router.navigate(['/add']);
    },
    error: (err) => {
      console.error(err);
      alert('Failed to save item');
    }
  });
}

}
