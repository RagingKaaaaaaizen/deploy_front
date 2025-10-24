import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveService } from '../_services/archive.service';
import { AnalyticsService, MonthlyStockData, MonthlyDisposalData } from '../_services/analytics.service';
import { AlertService } from '../_services/alert.service';
import { AccountService } from '../_services/account.service';
import { Role } from '../_models';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styles: [`
    .analytics-container {
      padding: 30px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      min-height: 100vh;
    }

    .analytics-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .analytics-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .analytics-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .analytics-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .analytics-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .categories-icon {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    }

    .components-icon {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    }

    .lifespan-icon {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .patterns-icon {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }

    .requests-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .card-description {
      color: #666;
      margin: 5px 0 0 0;
      font-size: 0.9rem;
    }

    .analytics-content {
      margin-top: 20px;
    }

    .analytics-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .analytics-item:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 600;
      color: #333;
    }

    .item-value {
      font-weight: bold;
      color: #667eea;
    }

    .item-percentage {
      font-size: 0.8rem;
      color: #666;
      margin-left: 10px;
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

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .summary-number {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .summary-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .automated-schedule-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-top: 30px;
    }

    .schedule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;
    }

    .schedule-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .schedule-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-top: 10px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #667eea;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    @media (max-width: 768px) {
      .analytics-container {
        padding: 20px;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .analytics-title {
        font-size: 2rem;
      }

      .summary-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .schedule-form {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  advancedAnalytics: any = null;
  automatedSchedule: any = null;
  scheduleForm: any = {};
  Role = Role;
  
  // Monthly stock chart properties
  monthlyStockData: MonthlyStockData[] = [];
  chartLoading = false;
  stockChartOption: EChartsOption = {};
  
  // Monthly disposal chart properties
  monthlyDisposalData: MonthlyDisposalData[] = [];
  disposalChartLoading = false;
  disposalChartOption: EChartsOption = {};
  
  // Category pie chart properties
  categoryPieOption: EChartsOption = {};
  categoryPieLoading = false;
  
  // Item lifespan chart properties
  lifespanChartOption: EChartsOption = {};
  lifespanChartLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private archiveService: ArchiveService,
    private analyticsService: AnalyticsService,
    private alertService: AlertService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadAdvancedAnalytics();
    this.loadMonthlyStockData();
    this.loadMonthlyDisposalData();
    this.loadCategoryPieData();
    this.loadItemLifespanData();
    // Only load automated schedule for SuperAdmin users
    if (this.isSuperAdmin()) {
      this.loadAutomatedSchedule();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdvancedAnalytics(): void {
    this.loading = true;
    this.archiveService.getAdvancedAnalytics()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.advancedAnalytics = data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.alertService.error('Error loading advanced analytics: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
  }

  loadMonthlyStockData(): void {
    this.chartLoading = true;
    this.analyticsService.getMonthlyStockAdditions(12)
      .pipe(first())
      .subscribe({
        next: (data) => {
          const currentYear = new Date().getFullYear();
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          const completeData = [];
          for (let month = 0; month < 12; month++) {
            const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
            const monthData = data?.find(item => item.month === monthKey);
            completeData.push({
              month: monthKey,
              monthName: monthNames[month],
              count: monthData ? monthData.count : 0
            });
          }
          
          this.monthlyStockData = completeData;
          this.updateStockChart();
          this.chartLoading = false;
        },
        error: (error) => {
          console.error('Error loading monthly stock data:', error);
          this.chartLoading = false;
        }
      });
  }

  updateStockChart(): void {
    this.stockChartOption = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.monthlyStockData.map(d => d.monthName),
        boundaryGap: false,
        name: 'Month',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Stock Entries',
        nameLocation: 'middle',
        nameGap: 50
      },
      series: [{
        name: 'Stock Entries',
        type: 'line',
        smooth: true,
        data: this.monthlyStockData.map(d => d.count),
        itemStyle: {
          color: '#007bff'
        },
        areaStyle: {
          color: 'rgba(0, 123, 255, 0.1)'
        },
        lineStyle: {
          width: 3
        }
      }]
    };
  }

  loadMonthlyDisposalData(): void {
    this.disposalChartLoading = true;
    this.analyticsService.getMonthlyDisposals(12)
      .pipe(first())
      .subscribe({
        next: (data) => {
          const currentYear = new Date().getFullYear();
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const complete = [] as MonthlyDisposalData[];
          for (let m = 0; m < 12; m++) {
            const key = `${currentYear}-${String(m + 1).padStart(2,'0')}`;
            const found = data.find(d => d.month === key);
            complete.push({ month: key, monthName: monthNames[m], count: found ? found.count : 0 });
          }
          this.monthlyDisposalData = complete;
          this.updateDisposalChart();
          this.disposalChartLoading = false;
        },
        error: () => {
          this.disposalChartLoading = false;
          this.monthlyDisposalData = [];
        }
      });
  }

  updateDisposalChart(): void {
    this.disposalChartOption = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.monthlyDisposalData.map(d => d.monthName),
        boundaryGap: false,
        name: 'Month',
        nameLocation: 'middle',
        nameGap: 30
      },
      yAxis: {
        type: 'value',
        name: 'Disposed Quantity',
        nameLocation: 'middle',
        nameGap: 50
      },
      series: [{
        name: 'Disposals',
        type: 'line',
        smooth: true,
        data: this.monthlyDisposalData.map(d => d.count),
        itemStyle: {
          color: '#dc3545'
        },
        areaStyle: {
          color: 'rgba(220, 53, 69, 0.1)'
        },
        lineStyle: {
          width: 3
        }
      }]
    };
  }

  loadCategoryPieData(): void {
    this.categoryPieLoading = true;
    this.analyticsService.getCategoryDistribution()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.updateCategoryPieChart(data);
          this.categoryPieLoading = false;
        },
        error: (error) => {
          console.error('Error loading category distribution:', error);
          this.categoryPieLoading = false;
        }
      });
  }

  updateCategoryPieChart(data: any[]): void {
    // Transform data for pie chart
    const pieData = data.map(item => ({
      name: item.category || item.name || 'Unknown',
      value: item.count || item.total || item.quantity || 0
    }));

    // Sort by value descending and take top 10
    const topCategories = pieData
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    this.categoryPieOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: topCategories.map(d => d.name)
      },
      series: [
        {
          name: 'Stock by Category',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: topCategories
        }
      ]
    };
  }

  loadItemLifespanData(): void {
    this.lifespanChartLoading = true;
    this.analyticsService.getItemLifespans(12)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.updateLifespanChart(data);
          this.lifespanChartLoading = false;
        },
        error: (error) => {
          console.error('Error loading item lifespans:', error);
          this.lifespanChartLoading = false;
        }
      });
  }

  updateLifespanChart(data: any[]): void {
    if (!data || data.length === 0) {
      this.lifespanChartOption = {};
      return;
    }

    // Flatten all individual disposal records
    const allDisposals: any[] = [];
    const itemCounts = new Map<string, number>();
    
    data.forEach(item => {
      item.lifespans.forEach((lifespan: any) => {
        const count = (itemCounts.get(item.itemName) || 0) + 1;
        itemCounts.set(item.itemName, count);
        
        allDisposals.push({
          itemName: item.itemName,
          lifespanDays: lifespan.lifespanDays,
          disposalDate: new Date(lifespan.disposalDate).toLocaleDateString(),
          quantity: lifespan.quantity,
          label: `${item.itemName} (${count})`,
          sortKey: `${item.itemName}_${count}`
        });
      });
    });

    // Sort by item name first, then by disposal number
    allDisposals.sort((a, b) => {
      if (a.itemName === b.itemName) {
        return a.sortKey.localeCompare(b.sortKey);
      }
      return a.itemName.localeCompare(b.itemName);
    });

    // Generate colors - same color for same item
    const itemColors = new Map<string, string>();
    const baseColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];
    
    let colorIndex = 0;
    allDisposals.forEach(disposal => {
      if (!itemColors.has(disposal.itemName)) {
        if (colorIndex < baseColors.length) {
          itemColors.set(disposal.itemName, baseColors[colorIndex]);
        } else {
          const hue = (colorIndex * 137.508) % 360;
          itemColors.set(disposal.itemName, `hsl(${hue}, 70%, 50%)`);
        }
        colorIndex++;
      }
    });

    // Prepare bar chart data
    const labels = allDisposals.map(d => d.label);
    const lifespanValues = allDisposals.map(d => d.lifespanDays);
    const colors = allDisposals.map(d => itemColors.get(d.itemName) || '#007bff');

    this.lifespanChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const disposal = allDisposals[params[0].dataIndex];
          let result = `<strong>${disposal.itemName}</strong><br/>`;
          result += `Lifespan: <strong>${disposal.lifespanDays} days</strong><br/>`;
          result += `Disposed: ${disposal.disposalDate}<br/>`;
          result += `Quantity: ${disposal.quantity}<br/>`;
          return result;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        name: 'Disposed Items',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: 'Lifespan (Days)',
        nameLocation: 'middle',
        nameGap: 50
      },
      series: [
        {
          name: 'Lifespan',
          type: 'bar' as const,
          data: lifespanValues,
          itemStyle: {
            color: (params: any) => {
              return colors[params.dataIndex];
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}d',
            fontSize: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  generateRandomColors(count: number): string[] {
    const colors: string[] = [];
    const baseColors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];
    
    for (let i = 0; i < count; i++) {
      if (i < baseColors.length) {
        colors.push(baseColors[i]);
      } else {
        // Generate random color
        const hue = (i * 137.508) % 360; // Use golden angle for good distribution
        colors.push(`hsl(${hue}, 70%, 50%)`);
      }
    }
    
    return colors;
  }

  loadAutomatedSchedule(): void {
    this.archiveService.getAutomatedReportSchedule()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.automatedSchedule = data;
          this.scheduleForm = { ...data };
        },
        error: (error) => {
          // Don't show error for 401/403 - user just doesn't have permission
          if (error.status !== 401 && error.status !== 403) {
            this.alertService.error('Error loading automated schedule: ' + (error.error?.message || error.message || 'Unknown error'));
          }
        }
      });
  }

  saveAutomatedSchedule(): void {
    this.loading = true;
    this.archiveService.setAutomatedReportSchedule(this.scheduleForm)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.alertService.success('Automated schedule updated successfully!');
          this.loadAutomatedSchedule();
        },
        error: (error) => {
          this.loading = false;
          this.alertService.error('Error updating automated schedule: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
  }

  refreshAnalytics(): void {
    this.loadAdvancedAnalytics();
    this.loadMonthlyStockData();
  }

  isSuperAdmin(): boolean {
    const account = this.accountService.accountValue;
    return account && account.role === Role.SuperAdmin;
  }

  formatNumber(value: any, decimals: number = 0): string {
    if (typeof value === 'number') {
      return value.toFixed(decimals);
    }
    return decimals === 0 ? '0' : '0.00';
  }

  formatCurrency(value: any, decimals: number = 2): string {
    if (typeof value === 'number') {
      return value.toFixed(decimals);
    }
    return decimals === 0 ? '0' : '0.00';
  }

  getObjectEntries(obj: any): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }
}


