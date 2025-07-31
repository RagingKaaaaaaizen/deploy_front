import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';
import { BrandService } from '../../_services/brand.service';
import { AlertService } from '../../_services/alert.service';
import { Role } from '../../_models';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      font-size: 2.5rem;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
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

    .item-row {
      transition: all 0.3s ease;
    }

    .item-row:hover {
      background-color: #f8f9fa;
      transform: scale(1.01);
    }

    .item-info {
      display: flex;
      flex-direction: column;
    }

    .description-text {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .category-badge,
    .brand-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
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
export class ItemListComponent implements OnInit {
  Role = Role;
  items: any[] = [];
  filteredItems: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  selectedBrand = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private alertService: AlertService,
    public accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadItems();
    this.loadCategories();
    this.loadBrands();
  }

  loadItems() {
    this.loading = true;
    this.itemService.getAll()
      .pipe(first())
      .subscribe({
        next: (items) => {
          this.items = items;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
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

  applyFilters() {
    let filtered = [...this.items];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(item => {
        const name = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return name.includes(this.searchTerm.toLowerCase()) || 
               description.includes(this.searchTerm.toLowerCase());
      });
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(item => {
        const categoryName = this.getCategoryName(item) || '';
        return categoryName.toLowerCase().includes(this.selectedCategory.toLowerCase());
      });
    }

    // Brand filter
    if (this.selectedBrand) {
      filtered = filtered.filter(item => {
        const brandName = this.getBrandName(item) || '';
        return brandName.toLowerCase().includes(this.selectedBrand.toLowerCase());
      });
    }

    this.filteredItems = filtered;
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

  // Helper methods to get category and brand names
  getCategoryName(item: any): string {
    return item.category?.name || item.categoryName || 'No Category';
  }

  getBrandName(item: any): string {
    return item.brand?.name || item.brandName || 'No Brand';
  }

  getUniqueCategories(): number {
    const categories = new Set(this.items.map(item => this.getCategoryName(item)).filter(name => name !== 'No Category'));
    return categories.size;
  }

  getUniqueBrands(): number {
    const brands = new Set(this.items.map(item => this.getBrandName(item)).filter(name => name !== 'No Brand'));
    return brands.size;
  }

  getActiveItems(): number {
    return this.items.length; // Assuming all items are active for now
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    return roles.some(role => role === account.role);
  }

  viewItem(id: number) {
    this.router.navigate(['/add/item/view', id]);
  }

  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Item deleted successfully');
            this.loadItems();
          },
          error: (error) => {
            this.alertService.error('Error deleting item');
          }
        });
    }
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredItems.slice(start, end);
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
