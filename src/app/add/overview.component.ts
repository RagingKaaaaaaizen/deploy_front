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

    .add-options-grid {
      margin-bottom: 30px;
    }

    .add-option-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 20px;
      height: 100%;
    }

    .add-option-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .add-option-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .add-option-card:hover::before {
      transform: scaleY(1);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;
    }

    .card-content h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }

    .card-content p {
      color: #666;
      font-size: 0.9rem;
      margin: 0 0 12px 0;
    }

    .card-stats {
      display: flex;
      gap: 15px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #667eea;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .card-arrow {
      color: #667eea;
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .add-option-card:hover .card-arrow {
      opacity: 1;
    }

    .quick-stats-section .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .quick-stats-section .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      border: none;
      padding: 20px;
    }

    .quick-stats-section .card-body {
      padding: 30px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-item .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 8px;
    }

    .stat-item .stat-label {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .recent-activity-section .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .recent-activity-section .card-header {
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
      border: none;
      padding: 20px;
    }

    .activity-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
    }

    .activity-message {
      color: #333;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .activity-time {
      color: #666;
      font-size: 0.8rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
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
  loading = false;
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
    this.loading = true;

    // Set a timeout to ensure loading doesn't get stuck
    setTimeout(() => {
      this.loading = false;
    }, 2000);

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
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading storage locations:', error);
          this.alertService.error('Failed to load storage locations');
          this.loading = false;
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
