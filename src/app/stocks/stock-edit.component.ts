import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../_services/stock.service';
import { ItemService } from '../_services/item.service';
import { Stock } from '../_models/stock';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html'
})
export class StockEditComponent implements OnInit {
  stock: Stock = new Stock();
  isEdit = false;
  items: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    // Load items from DB (with category names included)
    this.itemService.getAll().subscribe(items => {
      // Map to include category name
      this.items = items.map((i: any) => ({
        id: i.id,
        name: `${i.name} (${i.category?.name || 'No Category'})`
      }));
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.stockService.getById(id).subscribe(stock => this.stock = stock);
    }
  }

  save() {
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
