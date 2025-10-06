import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchiveService } from '../_services/archive.service';
import { AlertService } from '../_services/alert.service';
import { first } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartData, ChartOptions, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

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

    .chart-container {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
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

    .charts-section {
      margin-top: 30px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .chart-container.full-width {
      grid-column: 1 / -1;
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
  
  // Chart instances
  private charts: { [key: string]: Chart } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private archiveService: ArchiveService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadAdvancedAnalytics();
    this.loadAutomatedSchedule();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Destroy all charts
    Object.values(this.charts).forEach(chart => chart.destroy());
  }

  loadAdvancedAnalytics(): void {
    this.loading = true;
    this.archiveService.getAdvancedAnalytics()
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.advancedAnalytics = data;
          this.loading = false;
          // Create charts after data is loaded
          setTimeout(() => {
            this.createCharts();
          }, 100);
        },
        error: (error) => {
          this.loading = false;
          this.alertService.error('Error loading advanced analytics: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
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
          this.alertService.error('Error loading automated schedule: ' + (error.error?.message || error.message || 'Unknown error'));
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
    this.updateCharts();
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

  // Chart Creation Methods
  private createCharts(): void {
    this.createTopCategoriesChart();
    this.createReplacementPatternsChart();
    this.createStockLevelsChart();
    this.createLifespanChart();
    this.createMonthlyTrendsChart();
  }

  private createTopCategoriesChart(): void {
    const canvas = document.getElementById('topCategoriesChart') as HTMLCanvasElement;
    if (!canvas || !this.advancedAnalytics?.topCategories) return;

    const data = this.advancedAnalytics.topCategories.slice(0, 8);
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.category),
        datasets: [{
          data: data.map(item => item.usage),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Top Used Categories',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    };

    this.charts['topCategories'] = new Chart(canvas, config);
  }

  private createReplacementPatternsChart(): void {
    const canvas = document.getElementById('replacementPatternsChart') as HTMLCanvasElement;
    if (!canvas || !this.advancedAnalytics?.mostReplacedComponents) return;

    const data = this.advancedAnalytics.mostReplacedComponents.slice(0, 10);
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
        datasets: [{
          label: 'Replacement Count',
          data: data.map(item => item.replacementCount),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Most Replaced Components',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };

    this.charts['replacementPatterns'] = new Chart(canvas, config);
  }

  private createStockLevelsChart(): void {
    const canvas = document.getElementById('stockLevelsChart') as HTMLCanvasElement;
    if (!canvas) return;

    const lowStockCount = this.advancedAnalytics?.lowStockItems?.length || 0;
    const outOfStockCount = this.advancedAnalytics?.outOfStockItems?.length || 0;
    const normalStockCount = Math.max(0, 100 - lowStockCount - outOfStockCount); // Assuming total items

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Normal Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
          data: [normalStockCount, lowStockCount, outOfStockCount],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Stock Level Distribution',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    };

    this.charts['stockLevels'] = new Chart(canvas, config);
  }

  private createLifespanChart(): void {
    const canvas = document.getElementById('lifespanChart') as HTMLCanvasElement;
    if (!canvas || !this.advancedAnalytics?.averageLifespan) return;

    const data = this.advancedAnalytics.averageLifespan.slice(0, 8);
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(item => item.category),
        datasets: [{
          label: 'Average Lifespan (Days)',
          data: data.map(item => item.averageLifespan),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Average Component Lifespan',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Days'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };

    this.charts['lifespan'] = new Chart(canvas, config);
  }

  private createMonthlyTrendsChart(): void {
    const canvas = document.getElementById('monthlyTrendsChart') as HTMLCanvasElement;
    if (!canvas || !this.advancedAnalytics?.replacementPatterns?.monthlyPatterns) return;

    // Generate sample monthly data for demonstration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stockAdditions = [45, 52, 38, 67, 41, 58, 72, 49, 63, 55, 48, 61];
    const disposals = [12, 18, 15, 22, 19, 25, 28, 21, 24, 20, 17, 23];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Stock Additions',
            data: stockAdditions,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Disposals',
            data: disposals,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Inventory Trends',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity'
            }
          }
        }
      }
    };

    this.charts['monthlyTrends'] = new Chart(canvas, config);
  }

  // Chart update methods
  updateCharts(): void {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.createCharts();
  }
}
