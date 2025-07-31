import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../_services/stock.service';
import { ItemService } from '../_services/item.service';
import { StorageLocationService } from '../_services/storage-location.service';
import { Stock } from '../_models/stock';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html'
})
export class StockEditComponent implements OnInit {
  stock: Stock = new Stock();
  isEdit = false;
  items: any[] = [];
  locations: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private itemService: ItemService,
    private locationService: StorageLocationService
  ) {}

  ngOnInit(): void {
    // Load items
    this.itemService.getAll().subscribe(items => {
      this.items = items.map((i: any) => ({
        id: i.id,
        name: `${i.name} (${i.category?.name || 'No Category'})`
      }));
    });

    // Load storage locations
    this.locationService.getAll().subscribe(locations => {
      this.locations = locations;
    });

    // If editing existing stock
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.stockService.getById(id).subscribe(stock => {
        this.stock = stock;
        this.stock.locationId = stock.location?.id;
        // Ensure totalPrice is calculated if price & quantity are present
        if (this.stock.price && this.stock.quantity) {
          this.calculateTotalPrice();
        }
      });
    }
  }

  // Calculate total price when quantity or price changes
  calculateTotalPrice() {
    const price = this.stock.price ?? 0;
    const qty = this.stock.quantity ?? 0;
    this.stock.totalPrice = price * qty;
  }

  save() {
    // Auto-calculate before saving
    this.calculateTotalPrice();

    if (this.isEdit) {
      this.stockService.update(this.stock.id!, this.stock).subscribe(() => {
        this.router.navigate(['/stocks']);
      });
    } else {
      this.stockService.create(this.stock).subscribe(() => {
        this.router.navigate(['/stocks']);
      });
    }
  }
}
