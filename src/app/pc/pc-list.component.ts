import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { PCService } from '../_services';
import { PC } from '../_models/pc';
import { AlertService, CategoryService } from '../_services';
import { Role } from '../_models';
import { AccountService } from '../_services';

@Component({ 
  templateUrl: 'pc-list.component.html',
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

    .pc-row {
      transition: all 0.3s ease;
    }

    .pc-row:hover {
      background-color: #f8f9fa;
      transform: scale(1.01);
    }

    .pc-info {
      display: flex;
      flex-direction: column;
    }

    .serial-badge,
    .item-badge,
    .category-badge,
    .brand-badge,
    .location-badge,
    .user-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
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
export class PCListComponent implements OnInit {
  Role = Role;
  pcs: PC[] = [];
  filteredPCs: PC[] = [];
  categories: any[] = [];
  loading = false;
  searchTerm = '';
  selectedStatus = '';
  selectedCategory = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  constructor(
    private pcService: PCService,
    private categoryService: CategoryService,
    private router: Router,
    private alertService: AlertService,
    public accountService: AccountService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadPCs();
    this.loadCategories();
  }

  loadPCs() {
    this.loading = true;
    this.pcService.getAll()
      .pipe(first())
      .subscribe({
        next: (pcs) => {
          this.pcs = pcs;
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

  applyFilters() {
    let filtered = [...this.pcs];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(pc => {
        const pcName = (pc.name || '').toLowerCase();
        const serialNumber = (pc.serialNumber || '').toLowerCase();
        const itemName = (pc.item?.name || '').toLowerCase();
        return pcName.includes(this.searchTerm.toLowerCase()) || 
               serialNumber.includes(this.searchTerm.toLowerCase()) ||
               itemName.includes(this.searchTerm.toLowerCase());
      });
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(pc => {
        return pc.status === this.selectedStatus;
      });
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(pc => {
        const categoryName = pc.item?.category?.name || '';
        return categoryName.toLowerCase().includes(this.selectedCategory.toLowerCase());
      });
    }

    this.filteredPCs = filtered;
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

  getActivePCs(): number {
    return this.pcs.filter(pc => pc.status === 'Active').length;
  }

  getMaintenancePCs(): number {
    return this.pcs.filter(pc => pc.status === 'Maintenance').length;
  }

  getAssignedPCs(): number {
    return this.pcs.filter(pc => pc.assignedTo && pc.assignedTo.trim() !== '').length;
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    
    const userRole = account.role;
    return roles.some(role => role === userRole);
  }

  addPC() {
    this.router.navigate(['/pc/add']);
  }

  viewPC(id: number) {
    this.router.navigate(['/pc/view', id]);
  }

  editPC(id: number) {
    this.router.navigate(['/pc/edit', id]);
  }

  deletePC(id: number) {
    const pc = this.pcs.find(x => x.id === id);
    if (pc) {
      pc.isDeleting = true;
      this.pcService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.pcs = this.pcs.filter(x => x.id !== id);
            this.applyFilters();
            this.alertService.success('PC deleted successfully');
          },
          error: (error) => {
            this.alertService.error(error);
            pc.isDeleting = false;
          }
        });
    }
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredPCs.length / this.itemsPerPage);
  }

  get paginatedPCs(): PC[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPCs.slice(start, end);
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