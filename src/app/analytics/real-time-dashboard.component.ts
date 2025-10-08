import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveService } from '../_services/archive.service';
import { AlertService } from '../_services/alert.service';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-real-time-dashboard',
  templateUrl: './real-time-dashboard.component.html',
  styles: [`
    .realtime-container {
      padding: 30px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      min-height: 100vh;
    }

    .realtime-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .realtime-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .realtime-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-top: 15px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: all 0.3s ease;
      border-left: 4px solid #667eea;
    }

    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .metric-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
      color: #667eea;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .metric-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-change {
      font-size: 0.8rem;
      margin-top: 8px;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .metric-change.positive {
      background: #d4edda;
      color: #155724;
    }

    .metric-change.negative {
      background: #f8d7da;
      color: #721c24;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .chart-container {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .chart-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .chart-title i {
      color: #667eea;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .chart-wrapper canvas {
      max-height: 100%;
      max-width: 100%;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    .refresh-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 25px;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .btn-warning:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .data-sections {
      margin-top: 30px;
    }

    .data-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .data-section h3 {
      color: #333;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .data-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
    }

    .data-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .data-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .data-percentage {
      font-size: 0.8rem;
      color: #666;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .activity-item i {
      font-size: 1.2rem;
    }

    .activity-item span {
      flex: 1;
      font-weight: 500;
    }

    .activity-item small {
      color: #666;
      font-size: 0.8rem;
    }

    .text-success { color: #28a745; }
    .text-danger { color: #dc3545; }
    .text-info { color: #17a2b8; }
    .text-warning { color: #ffc107; }

    @media (max-width: 768px) {
      .realtime-container {
        padding: 20px;
      }

      .realtime-title {
        font-size: 2rem;
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .data-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RealTimeDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  isLive = true;
  refreshInterval = 30000; // 30 seconds
  private destroy$ = new Subject<void>();
  
  // Real-time data
  realTimeData: any = {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingRequests: 0,
    recentActivity: [],
    stockTrends: [],
    categoryDistribution: [],
    topCategories: [],
    lastUpdated: null
  };

  constructor(
    private archiveService: ArchiveService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadRealTimeData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startAutoRefresh(): void {
    if (this.isLive) {
      interval(this.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadRealTimeData();
        });
    }
  }

  loadRealTimeData(): void {
    this.loading = true;
    
    // Load multiple analytics endpoints in parallel
    Promise.all([
      this.archiveService.getAdvancedAnalytics().toPromise(),
      this.archiveService.getTopUsedCategories(10).toPromise(),
      this.archiveService.getMostReplacedComponents(10).toPromise()
    ]).then(([analytics, topCategories, mostReplaced]) => {
      this.realTimeData = {
        ...analytics,
        topCategories,
        mostReplaced,
        lastUpdated: new Date()
      };
      
      this.loading = false;
    }).catch(error => {
      this.loading = false;
      this.alertService.error('Error loading real-time data: ' + (error.error?.message || error.message || 'Unknown error'));
    });
  }

  toggleLiveMode(): void {
    this.isLive = !this.isLive;
    if (this.isLive) {
      this.startAutoRefresh();
    } else {
      this.destroy$.next();
    }
  }

  setRefreshInterval(interval: number): void {
    this.refreshInterval = interval * 1000;
    if (this.isLive) {
      this.destroy$.next();
      this.startAutoRefresh();
    }
  }

  onIntervalChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = parseInt(target.value, 10);
    this.setRefreshInterval(value);
  }



  formatNumber(value: any, decimals: number = 0): string {
    if (typeof value === 'number') {
      return value.toFixed(decimals);
    }
    return decimals === 0 ? '0' : '0.00';
  }

  getTimeAgo(timestamp: Date): string {
    if (!timestamp) {
      return 'Never';
    }
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    return timestamp.toLocaleTimeString();
  }

  getTopCategoriesLength(): number {
    return this.realTimeData.topCategories ? this.realTimeData.topCategories.length : 0;
  }
}
