import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../_services/stock.service';
import { ItemService } from '../_services/item.service';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html'
})
export class StockListComponent implements OnInit {
  stocks: any[] = [];
  itemsMap: { [key: number]: string } = {};

  totalItems: number = 0;
  totalInventoryPrice: number = 0;

  constructor(
    private stockService: StockService,
    private itemService: ItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load items first to map itemId → item name
    this.itemService.getAll().subscribe(items => {
      this.itemsMap = items.reduce((map: any, item: any) => {
        map[item.id] = item.name;
        return map;
      }, {});
      this.loadStocks();
    });
  }

  loadStocks() {
    this.stockService.getAll().subscribe(stocks => {
      this.stocks = stocks;
      this.calculateTotals();
    });
  }

  getItemName(itemId: number) {
    return this.itemsMap[itemId] || 'Unknown';
  }

  getLocationName(stock: any) {
    return stock.location ? stock.location.name : 'No Location';
  }

  calculateTotals() {
    // Sum total items and inventory value
    this.totalItems = this.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    this.totalInventoryPrice = this.stocks.reduce(
      (sum, s) => sum + ((s.price || 0) * (s.quantity || 0)),
      0
    );
  }
  getCategoryName(stock: any) {
  return stock.item?.category?.name || 'No Category';
}

getBrandName(stock: any) {
  return stock.item?.brand?.name || 'No Brand';
}


  editStock(id: number) {
    this.router.navigate(['/stocks/edit', id]);
  }

  deleteStock(id: number) {
    if (confirm('Are you sure you want to delete this stock record?')) {
      this.stockService.delete(id).subscribe(() => this.loadStocks());
    }
  }
}
