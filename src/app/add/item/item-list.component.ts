import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent implements OnInit {
  items: any[] = [];
  categories: any[] = [];

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories;
      this.loadItems();
    });
  }

  loadItems() {
    this.itemService.getAll().subscribe(items => {
      // Map categoryId to categoryName
      this.items = items.map(item => {
        const category = this.categories.find(c => c.id === item.categoryId);
        return {
          ...item,
          categoryName: category ? category.name : 'Uncategorized'
        };
      });
    });
  }

  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id).subscribe(() => this.loadItems());
    }
  }
}
