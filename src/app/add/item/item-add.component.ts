import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';

@Component({
  selector: 'app-item-add',
  templateUrl: './item-add.component.html'
})
export class ItemAddComponent implements OnInit {
  model: any = {};
  categories: any[] = [];

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load categories for dropdown
    this.categoryService.getAll().subscribe({
        
      next: (data) => (this.categories = data),
      error: (err) => console.error('Failed to load categories', err)
    });
  }
  

  saveItem() {
    if (!this.model.name || !this.model.categoryId) {
      alert('Item name and category are required');
      return;
    }

    this.itemService.create(this.model).subscribe({
      next: () => {
        alert('Item saved!');
        this.router.navigate(['/add']); // redirect back to overview
      },
      error: (err) => {
        console.error(err);
        alert('Failed to save item');
      }
    });
    
  }
}
