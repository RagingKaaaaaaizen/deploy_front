import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../_services/item.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent implements OnInit {
  items: any[] = [];

  constructor(
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  // Load items with category and brand (backend already provides joins)
  loadItems(): void {
    this.itemService.getAll().subscribe(items => {
      this.items = items.map(item => ({
        ...item,
        categoryName: item.category ? item.category.name : 'Uncategorized',
        brandName: item.brand ? item.brand.name : 'No Brand'
      }));
    });
  }

  // Delete item
  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id).subscribe(() => this.loadItems());
    }
  }
}
