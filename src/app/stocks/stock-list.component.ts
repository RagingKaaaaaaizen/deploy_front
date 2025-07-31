import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, StockService, ItemService, CategoryService, BrandService, StorageLocationService } from '@app/_services';
import { Role } from '@app/_models';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styles: [`
    .list-container {
      padding: 20px 0;
    }

    .page-header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .header-title i {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin: 0 0 5px 0;
    }

    .page-subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      text-align: center;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 1rem;
    }

    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .search-box {
      position: relative;
    }

    .search-box i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      z-index: 1;
    }

    .search-box .form-control {
      padding-left: 45px;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0 !important;
      padding: 20px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-actions {
      display: flex;
      gap: 10px;
    }

    .stock-row {
      transition: all 0.3s ease;
    }

    .stock-row:hover {
      background-color: #f8f9fa;
      transform: scale(1.01);
    }

    .item-info {
      display: flex;
      flex-direction: column;
    }

    .category-badge,
    .brand-badge,
    .location-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .quantity-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .price-value,
    .total-value {
      font-weight: 600;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      padding: 6px 10px;
      font-size: 0.8rem;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .empty-state i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-state h4 {
      color: #333;
      margin-bottom: 10px;
    }

    .pagination-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .pagination-info {
      color: #666;
      font-size: 0.9rem;
    }

    .pagination {
      margin: 0;
    }

    .page-link {
      color: #667eea;
      border: none;
      padding: 8px 12px;
      margin: 0 2px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .page-link:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .page-item.active .page-link {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .page-item.disabled .page-link {
      color: #ccc;
      cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .filter-controls {
        flex-direction: column;
      }

      .pagination-section {
        flex-direction: column;
        text-align: center;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class StockListComponent implements OnInit {
  Role = Role;
  stocks: any[] = [];
  items: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  locations: any[] = [];
  filteredStocks: any[] = [];
  searchTerm = '';
  selectedType = '';
  selectedCategory = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  constructor(
    private router: Router,
    private stockService: StockService,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private locationService: StorageLocationService,
    private alertService: AlertService,
    public accountService: AccountService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadStocks();
    this.loadItems();
    this.loadCategories();
    this.loadBrands();
    this.loadLocations();
  }

  loadStocks() {
    this.stockService.getAll()
      .pipe(first())
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;
          this.applyFilters();
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadItems() {
    this.itemService.getAll()
      .pipe(first())
      .subscribe({
        next: (items) => {
          this.items = items;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadCategories() {
    this.categoryService.getAll()
      .pipe(first())
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadBrands() {
    this.brandService.getAll()
      .pipe(first())
      .subscribe({
        next: (brands) => {
          this.brands = brands;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadLocations() {
    this.locationService.getAll()
      .pipe(first())
      .subscribe({
        next: (locations) => {
          this.locations = locations;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  applyFilters() {
    let filtered = [...this.stocks];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(stock => {
        const itemName = this.getItemName(stock.itemId).toLowerCase();
        return itemName.includes(this.searchTerm.toLowerCase());
      });
    }

    // Type filter
    if (this.selectedType) {
      if (this.selectedType === 'ADD') {
        filtered = filtered.filter(stock => !stock.disposeId);
      } else if (this.selectedType === 'DISPOSE') {
        filtered = filtered.filter(stock => stock.disposeId);
      }
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(stock => {
        const item = this.items.find(i => i.id === stock.itemId);
        return item && item.categoryId == this.selectedCategory;
      });
    }

    this.filteredStocks = filtered;
    this.currentPage = 1;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  refreshData() {
    this.loadData();
    this.alertService.success('Data refreshed successfully');
  }

  getAdditionsCount(): number {
    return this.stocks.filter(stock => !stock.disposeId).length;
  }

  getDisposalsCount(): number {
    return this.stocks.filter(stock => stock.disposeId).length;
  }

  getTotalValue(): number {
    return this.stocks.reduce((total, stock) => {
      return total + (stock.price * stock.quantity);
    }, 0);
  }

  getItemName(itemId: number): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  }

  getCategoryName(stock: any): string {
    const item = this.items.find(i => i.id === stock.itemId);
    if (!item) return 'Unknown';
    
    const category = this.categories.find(c => c.id === item.categoryId);
    return category ? category.name : 'Unknown Category';
  }

  getBrandName(stock: any): string {
    const item = this.items.find(i => i.id === stock.itemId);
    if (!item) return 'Unknown';
    
    const brand = this.brands.find(b => b.id === item.brandId);
    return brand ? brand.name : 'Unknown Brand';
  }

  getLocationName(stock: any): string {
    const location = this.locations.find(l => l.id === stock.locationId);
    return location ? location.name : 'Unknown Location';
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    
    const userRole = account.role;
    return roles.some(role => role === userRole);
  }

  viewStock(id: number) {
    this.router.navigate(['/stocks', id]);
  }

  editStock(id: number) {
    this.router.navigate(['/stocks', id, 'edit']);
  }

  deleteStock(id: number) {
    if (confirm('Are you sure you want to delete this stock entry?')) {
      this.stockService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Stock deleted successfully');
            this.loadStocks();
          },
          error: error => {
            this.alertService.error(error);
          }
        });
    }
  }

  disposeStock(stock: any) {
    this.router.navigate(['/dispose/add'], { 
      queryParams: { 
        itemId: stock.itemId,
        availableStock: this.getAvailableStock(stock.itemId)
      }
    });
  }

  getAvailableStock(itemId: number): number {
    const itemStocks = this.stocks.filter(s => s.itemId === itemId);
    const additions = itemStocks.filter(s => !s.disposeId).reduce((sum, s) => sum + s.quantity, 0);
    const disposals = itemStocks.filter(s => s.disposeId).reduce((sum, s) => sum + s.quantity, 0);
    return Math.max(0, additions - disposals);
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredStocks.length / this.itemsPerPage);
  }

  get paginatedStocks(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStocks.slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
