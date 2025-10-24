import { AccountService, StockService, PCService } from '@app/_services';
import { Component, OnInit } from '@angular/core';
import { Role } from '@app/_models';
import { first } from 'rxjs/operators';

@Component({ 
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    Role = Role;
    account = this.accountService.accountValue;

    stats: any = {
        totalStock: 0,
        totalPCs: 0,
        totalQuantity: 0,
        lowStock: 0,
        outOfStock: 0
    };

    constructor(
        private accountService: AccountService,
        private stockService: StockService,
        private pcService: PCService
    ) { }

    ngOnInit() {
        this.loadDashboardStats();
    }

    loadDashboardStats() {
        // Load real stock data
        this.stockService.getAll()
            .pipe(first())
            .subscribe({
                next: (stocks: any[]) => {
                    // Count total stock entries
                    this.stats.totalStock = stocks.length;
                    
                    // Calculate total quantity across all stocks
                    this.stats.totalQuantity = stocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
                    
                    // Count low stock items (quantity between 1 and 10)
                    this.stats.lowStock = stocks.filter(s => s.quantity > 0 && s.quantity <= 10).length;
                    
                    // Count out of stock items (quantity = 0)
                    this.stats.outOfStock = stocks.filter(s => s.quantity === 0).length;
                },
                error: (error) => {
                    console.error('Error loading stock data:', error);
                }
            });

        // Load real PC data
        this.pcService.getAll()
            .pipe(first())
            .subscribe({
                next: (pcs: any[]) => {
                    this.stats.totalPCs = pcs.length;
                },
                error: (error) => {
                    console.error('Error loading PC data:', error);
                }
            });
    }
}
