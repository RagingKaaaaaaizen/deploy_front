import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ArchiveService } from '../_services/archive.service';
import { AnalyticsService, MonthlyStockData, MonthlyDisposalData } from '../_services/analytics.service';
import { AlertService } from '../_services/alert.service';
import { AccountService } from '../_services/account.service';
import { Role } from '../_models';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

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
export class AnalyticsDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  loading = false;
  advancedAnalytics: any = null;
  automatedSchedule: any = null;
  scheduleForm: any = {};
  Role = Role;
  
  // Monthly stock chart properties
  monthlyStockData: MonthlyStockData[] = [];
  chartLoading = false;
  @ViewChild('monthlyStockChart') monthlyStockChart: any;
  chart: Chart | null = null;
  private stockChartInitialized = false;
  private stockInitRetries = 0;
  // Monthly disposal chart properties
  monthlyDisposalData: MonthlyDisposalData[] = [];
  disposalChartLoading = false;
  @ViewChild('monthlyDisposalChart') monthlyDisposalChart: any;
  disposalChart: Chart | null = null;
  private disposalChartInitialized = false;
  private disposalInitRetries = 0;
  
  // Chart configuration
  chartData = {
    labels: [],
    datasets: [{
      label: 'Stock Entries',
      data: [],
      borderColor: '#007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#007bff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Monthly Stock Entries'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Stock Entries'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };
  
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
    // Only load automated schedule for SuperAdmin users
    if (this.isSuperAdmin()) {
      this.loadAutomatedSchedule();
    }
  }

  ngAfterViewInit(): void {
    Chart.register(...registerables);
    // Initialize charts in case data already loaded before view init
    setTimeout(() => {
      this.initializeChart();
      this.initializeDisposalChart();
    }, 0);
  }

  ngOnDestroy(): void {
    // Destroy chart to prevent memory leaks
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.disposalChart) {
      this.disposalChart.destroy();
      this.disposalChart = null;
    }
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
          console.log('Received monthly stock data:', data);
          this.monthlyStockData = data;
          
          // Always create complete 12-month data structure
          this.createCompleteMonthlyData(data);
          this.chartLoading = false;
          
          // Initialize chart immediately after data is ready
          this.initializeChart();
        },
        error: (error) => {
          console.error('Error loading monthly stock data:', error);
          this.chartLoading = false;
          // Create complete sample data on error
          this.createCompleteMonthlyData([]);
          this.initializeChart();
        }
      });
  }

  loadMonthlyDisposalData(): void {
    this.disposalChartLoading = true;
    this.analyticsService.getMonthlyDisposals(12)
      .pipe(first())
      .subscribe({
        next: (data) => {
          const currentYear = new Date().getFullYear();
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          // Build complete 12-month structure
          const complete = [] as MonthlyDisposalData[];
          for (let m = 0; m < 12; m++) {
            const key = `${currentYear}-${String(m + 1).padStart(2,'0')}`;
            const found = data.find(d => d.month === key);
            complete.push({ month: key, monthName: monthNames[m], count: found ? found.count : 0 });
          }
          this.monthlyDisposalData = complete;
          this.disposalChartLoading = false;
          this.initializeDisposalChart();
        },
        error: () => {
          this.disposalChartLoading = false;
          this.monthlyDisposalData = [];
          this.initializeDisposalChart();
        }
      });
  }

  createCompleteMonthlyData(apiData: any[]): void {
    // Create complete 12-month data structure for current year
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const completeData = [];
    
    for (let month = 0; month < 12; month++) {
      const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
      const monthName = monthNames[month];
      
      // Find data for this month from API
      const monthData = apiData?.find(item => item.month === monthKey);
      const count = monthData ? monthData.count : 0;
      
      completeData.push({
        month: monthKey,
        monthName: monthName,
        count: count
      });
    }
    
    this.monthlyStockData = completeData;
    console.log('Created complete monthly data:', this.monthlyStockData);
  }

  initializeChart(): void {
    if (this.stockChartInitialized) {
      return;
    }
    if (this.monthlyStockChart && this.monthlyStockChart.nativeElement) {
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      // Update chart data before creating chart
      this.updateChartData();
      
      const ctx = this.monthlyStockChart.nativeElement.getContext('2d');
      
      // Create new chart with updated data
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: 'Stock Entries',
            data: this.chartData.datasets[0].data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          parsing: false,
          normalized: true,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const
            },
            title: {
              display: true,
              text: 'Monthly Stock Entries'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Stock Entries'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month'
              }
            }
          }
        }
      });
      
      console.log('Chart initialized successfully');
      this.stockChartInitialized = true;
    }
    else {
      // Canvas might not be ready yet; retry shortly
      if (this.stockInitRetries < 20) {
        this.stockInitRetries++;
        setTimeout(() => this.initializeChart(), 150);
      }
    }
  }

  initializeDisposalChart(): void {
    if (this.disposalChartInitialized) {
      return;
    }
    if (this.monthlyDisposalChart && this.monthlyDisposalChart.nativeElement) {
      if (this.disposalChart) {
        this.disposalChart.destroy();
        this.disposalChart = null;
      }
      const labels = this.monthlyDisposalData.map(d => d.monthName);
      const data = this.monthlyDisposalData.map(d => d.count);
      const ctx = this.monthlyDisposalChart.nativeElement.getContext('2d');
      this.disposalChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Disposals',
            data,
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#dc3545',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          parsing: false,
          normalized: true,
          plugins: {
            legend: { display: true, position: 'top' as const },
            title: { display: true, text: 'Monthly Disposals' }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Disposed Quantity' } },
            x: { title: { display: true, text: 'Month' } }
          }
        }
      });
      this.disposalChartInitialized = true;
    }
    else {
      if (this.disposalInitRetries < 20) {
        this.disposalInitRetries++;
        setTimeout(() => this.initializeDisposalChart(), 150);
      }
    }
  }

  updateChartData(): void {
    if (this.monthlyStockData && this.monthlyStockData.length > 0) {
      // Use the pre-sorted complete data
      this.chartData.labels = this.monthlyStockData.map(item => item.monthName);
      this.chartData.datasets[0].data = this.monthlyStockData.map(item => item.count);
      
      console.log('Chart data updated:', this.chartData);
      console.log('Labels:', this.chartData.labels);
      console.log('Data:', this.chartData.datasets[0].data);
    } else {
      console.log('No monthly stock data available');
    }
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