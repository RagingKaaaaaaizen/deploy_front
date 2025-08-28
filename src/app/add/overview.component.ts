import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { CategoryService } from '../_services/category.service';
import { ItemService } from '../_services/item.service';
import { BrandService } from '../_services/brand.service';
import { StorageLocationService } from '../_services/storage-location.service';
import { AlertService } from '../_services/alert.service';
import { AccountService } from '../_services/account.service';

enum Role {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Viewer = 'Viewer'
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styles: [`
    .overview-container {
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

    .overview-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .overview-card {
      height: 100%;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      height: 100%;
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

    .card-actions {
      display: flex;
      gap: 10px;
    }

    .card-body {
      padding: 20px;
    }

    .list-group {
      border: none;
      margin-bottom: 15px;
    }

    .list-group-item {
      border: none;
      border-bottom: 1px solid #e9ecef;
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
    }

    .list-group-item:hover {
      background-color: #f8f9fa;
      transform: translateX(5px);
    }

    .list-group-item:last-child {
      border-bottom: none;
    }

    .item-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .item-content i {
      font-size: 1.2rem;
      width: 20px;
      text-align: center;
    }

    .item-name {
      font-weight: 600;
      color: #333;
    }

    .item-details {
      display: flex;
      flex-direction: column;
    }

    .item-category {
      color: #666;
      font-size: 0.8rem;
      margin-top: 2px;
    }

    .item-actions {
      display: flex;
      gap: 5px;
    }

    .item-actions .btn {
      padding: 6px 10px;
      font-size: 0.8rem;
    }

    .empty-state {
      text-align: center;
      padding: 30px;
      color: #666;
    }

    .empty-state i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 15px;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9rem;
    }

    .view-all-link {
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #e9ecef;
    }

    .view-all-link .btn-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .view-all-link .btn-link:hover {
      color: #764ba2;
      transform: translateY(-2px);
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }

    .btn-outline-primary {
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn-outline-primary:hover {
      background: #667eea;
      color: white;
    }

    .btn-outline-warning {
      border: 2px solid #ffc107;
      color: #ffc107;
    }

    .btn-outline-warning:hover {
      background: #ffc107;
      color: #333;
    }

    .btn-outline-info {
      border: 2px solid #17a2b8;
      color: #17a2b8;
    }

    .btn-outline-info:hover {
      background: #17a2b8;
      color: white;
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

      .overview-sections {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .item-actions {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OverviewComponent implements OnInit {
  categories: any[] = [];
  items: any[] = [];
  brands: any[] = [];
  storageLocations: any[] = [];
  stats: any = null;
  recentActivity: any[] = [];
  Role = Role;

  constructor(
    private categoryService: CategoryService,
    private itemService: ItemService,
    private brandService: BrandService,
    private storageLocationService: StorageLocationService,
    private alertService: AlertService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    return account && roles.includes(account.role as Role);
  }

  loadOverview(): void {
    // Load categories
    this.categoryService.getAll()
      .pipe(first())
      .subscribe({
        next: (categories) => {
          this.categories = categories.slice(0, 5); // Show first 5
          this.updateStats();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.alertService.error('Failed to load categories');
        }
      });

    // Load items
    this.itemService.getAll()
      .pipe(first())
      .subscribe({
        next: (items) => {
          this.items = items.slice(0, 5); // Show first 5
          this.updateStats();
        },
        error: (error) => {
          console.error('Error loading items:', error);
          this.alertService.error('Failed to load items');
        }
      });

    // Load brands
    this.brandService.getAll()
      .pipe(first())
      .subscribe({
        next: (brands) => {
          this.brands = brands.slice(0, 5); // Show first 5
          this.updateStats();
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          this.alertService.error('Failed to load brands');
        }
      });

    // Load storage locations
    this.storageLocationService.getAll()
      .pipe(first())
      .subscribe({
        next: (locations) => {
          this.storageLocations = locations.slice(0, 5); // Show first 5
          this.updateStats();
        },
        error: (error) => {
          console.error('Error loading storage locations:', error);
          this.alertService.error('Failed to load storage locations');
        }
      });
  }

  updateStats(): void {
    this.stats = {
      totalItems: this.items.length,
      totalStock: this.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalCategories: this.categories.length,
      totalBrands: this.brands.length,
      totalStorageLocations: this.storageLocations.length,
      totalEmployees: 0, // You can add employee service if needed
      totalDepartments: 0 // You can add department service if needed
    };

    // Create recent activity
    this.recentActivity = [
      {
        message: 'New items added to inventory',
        timestamp: new Date(),
        icon: 'fas fa-boxes'
      },
      {
        message: 'Categories updated',
        timestamp: new Date(Date.now() - 3600000),
        icon: 'fas fa-tags'
      },
      {
        message: 'Brand information modified',
        timestamp: new Date(Date.now() - 7200000),
        icon: 'fas fa-trademark'
      }
    ];
  }

  refreshData(): void {
    this.loadOverview();
    this.alertService.success('Data refreshed successfully');
  }
}
