import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArchiveService, ReportData, StoredReport } from '../_services/archive.service';
import { AlertService } from '../_services/alert.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styles: [`
    .archive-container {
      padding: 30px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      min-height: 100vh;
    }

    .archive-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 20px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .archive-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .archive-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .statistics-section {
      background: white;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .statistic-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .statistic-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .statistic-number {
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .statistic-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .report-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .report-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .report-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .report-card-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .report-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .weekly-icon {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    }

    .monthly-icon {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    }

    .report-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .report-description {
      color: #666;
      margin: 5px 0 0 0;
      font-size: 0.9rem;
    }

    .report-form {
      margin-bottom: 20px;
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

    .date-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .period-selector {
      margin-bottom: 20px;
    }

    .period-selector {
      margin-top: 10px;
    }

    .period-dropdown {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 0.95rem;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .period-dropdown:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
    }

    .period-dropdown option:disabled {
      color: #6c757d;
      font-style: italic;
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

    .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
      color: white;
    }

    .btn-warning:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 193, 7, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
    }

    .btn-info {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
    }

    .btn-info:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(23, 162, 184, 0.4);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .preview-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-top: 30px;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;
    }

    .preview-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .summary-cards {
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

    .detailed-analysis {
      background: #f8f9fa;
      border-radius: 15px;
      padding: 20px;
      margin-top: 20px;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .analysis-card {
      background: white;
      border-radius: 10px;
      padding: 15px;
      border: 1px solid #e9ecef;
    }

    .analysis-title {
      font-size: 1rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .analysis-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .analysis-item:last-child {
      border-bottom: none;
    }

    .stored-reports-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-top: 30px;
    }

    .stored-reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;
    }

    .stored-reports-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .search-box {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .search-input {
      padding: 10px 15px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      font-size: 0.9rem;
      min-width: 250px;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .filter-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .filter-tab {
      padding: 8px 16px;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      background: white;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .filter-tab.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .stored-reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }

    .stored-report-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .stored-report-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .stored-report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .stored-report-title {
      font-size: 1.1rem;
      font-weight: bold;
      color: #333;
      margin: 0;
      line-height: 1.3;
    }

    .stored-report-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .stored-report-type.weekly {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    .stored-report-type.monthly {
      background: rgba(78, 205, 196, 0.2);
      color: #4ecdc4;
    }

    .stored-report-details {
      margin-bottom: 15px;
    }

    .stored-report-date {
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 5px;
    }

    .stored-report-period {
      color: #888;
      font-size: 0.8rem;
    }

    .stored-report-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }

    .stored-summary-item {
      text-align: center;
      padding: 8px;
      background: white;
      border-radius: 8px;
    }

    .stored-summary-number {
      font-size: 1.2rem;
      font-weight: bold;
      color: #667eea;
    }

    .stored-summary-label {
      font-size: 0.7rem;
      color: #666;
      text-transform: uppercase;
    }

    .stored-report-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .stored-report-actions .btn {
      padding: 8px 12px;
      font-size: 0.8rem;
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

    .duplicate-warning {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .export-import-section {
      background: white;
      border-radius: 20px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-top: 30px;
    }

    .export-import-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;
    }

    .export-import-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .export-import-actions {
      display: flex;
      gap: 15px;
    }

    .custom-date-range {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
    }

    .date-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .date-input-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 15px;
    }

    .date-input-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;
    }

    .date-input {
      padding: 8px 12px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-size: 0.9rem;
      background: white;
    }

    .date-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
    }

    .custom-period-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      font-size: 0.85rem;
    }

    .selected-period {
      font-weight: 600;
      color: #333;
    }

    .exists-badge {
      background: #dc3545;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .archive-container {
        padding: 20px;
      }

      .report-cards {
        grid-template-columns: 1fr;
      }

      .archive-title {
        font-size: 2rem;
      }

      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .stored-reports-grid {
        grid-template-columns: 1fr;
      }

      .search-box {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        min-width: auto;
      }

      .date-inputs {
        grid-template-columns: 1fr;
      }

      .statistics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-buttons {
        flex-direction: column;
      }

      .export-import-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ArchiveComponent implements OnInit {
  weeklyForm: FormGroup;
  monthlyForm: FormGroup;
  weeklyData: ReportData | null = null;
  monthlyData: ReportData | null = null;
  loading = false;
  storedReports: StoredReport[] = [];
  filteredReports: StoredReport[] = [];
  searchQuery = '';
  activeFilter: 'all' | 'weekly' | 'monthly' = 'all';
  
  // New properties for enhanced functionality
  selectedWeeklyPeriod: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean } | null = null;
  selectedMonthlyPeriod: { monthYear: string; startDate: Date; endDate: Date; exists: boolean } | null = null;
  availableWeeks: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }[] = [];
  availableMonths: { monthYear: string; startDate: Date; endDate: Date; exists: boolean }[] = [];
  
  // Statistics
  reportStatistics: any = null;
  
  // Custom period properties
  showCustomWeeklyPeriod = false;
  showCustomMonthlyPeriod = false;
  customWeeklyStartDate: string = '';
  customWeeklyEndDate: string = '';
  customMonthlyStartDate: string = '';
  customMonthlyEndDate: string = '';
  customWeeklyPeriod: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean } | null = null;
  customMonthlyPeriod: { monthYear: string; startDate: Date; endDate: Date; exists: boolean } | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private archiveService: ArchiveService,
    private alertService: AlertService
  ) {
    this.weeklyForm = this.formBuilder.group({
      includeStocks: [true],
      includeDisposals: [true],
      includePCs: [true],
      detailedAnalysis: [true]
    });

    this.monthlyForm = this.formBuilder.group({
      includeStocks: [true],
      includeDisposals: [true],
      includePCs: [true],
      detailedAnalysis: [true]
    });
  }

  ngOnInit(): void {
    this.loadStoredReports();
    this.loadAvailablePeriods();
    this.loadReportStatistics();
  }

  loadStoredReports(): void {
    this.storedReports = this.archiveService.getStoredReports();
    this.applyFilters();
  }

  loadAvailablePeriods(): void {
    this.availableWeeks = this.archiveService.getAvailableWeeks();
    this.availableMonths = this.archiveService.getAvailableMonths();
  }

  loadReportStatistics(): void {
    this.reportStatistics = this.archiveService.getReportStatistics();
  }

  applyFilters(): void {
    let filtered = this.storedReports;

    // Apply type filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === this.activeFilter);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      filtered = this.archiveService.searchReports(this.searchQuery);
      if (this.activeFilter !== 'all') {
        filtered = filtered.filter(report => report.type === this.activeFilter);
      }
    }

    this.filteredReports = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(filter: 'all' | 'weekly' | 'monthly'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  selectWeeklyPeriod(period: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }): void {
    this.selectedWeeklyPeriod = period;
  }

  selectMonthlyPeriod(period: { monthYear: string; startDate: Date; endDate: Date; exists: boolean }): void {
    this.selectedMonthlyPeriod = period;
  }

  generateWeeklyReport(): void {
    const selectedPeriod = this.selectedWeeklyPeriod || this.customWeeklyPeriod;
    
    if (!selectedPeriod) {
      this.alertService.error('Please select a week period first.');
      return;
    }

    if (selectedPeriod.exists) {
      this.alertService.warn('A report for this week already exists. Please select a different week or view the existing report.');
      return;
    }

    this.loading = true;
    this.weeklyData = null;

    this.archiveService.generateCustomReport(
      'weekly',
      selectedPeriod.startDate,
      selectedPeriod.endDate,
      {
        includeStocks: this.weeklyForm.get('includeStocks')?.value,
        includeDisposals: this.weeklyForm.get('includeDisposals')?.value,
        includePCs: this.weeklyForm.get('includePCs')?.value,
        detailedAnalysis: this.weeklyForm.get('detailedAnalysis')?.value
      }
    )
    .pipe(first())
    .subscribe({
      next: (data) => {
        this.weeklyData = data;
        // Store the report with inclusion settings
        this.archiveService.storeReport(data, 'weekly', selectedPeriod.startDate, selectedPeriod.endDate, {
          includeStocks: this.weeklyForm.get('includeStocks')?.value,
          includeDisposals: this.weeklyForm.get('includeDisposals')?.value,
          includePCs: this.weeklyForm.get('includePCs')?.value,
          includeDetailedAnalysis: this.weeklyForm.get('detailedAnalysis')?.value
        });
        this.loadStoredReports();
        this.loadAvailablePeriods();
        this.loadReportStatistics();
        this.loading = false;
        this.alertService.success('Weekly report generated and stored successfully!');
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error generating weekly report: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  generateMonthlyReport(): void {
    const selectedPeriod = this.selectedMonthlyPeriod || this.customMonthlyPeriod;
    
    if (!selectedPeriod) {
      this.alertService.error('Please select a month period first.');
      return;
    }

    if (selectedPeriod.exists) {
      this.alertService.warn('A report for this month already exists. Please select a different month or view the existing report.');
      return;
    }

    this.loading = true;
    this.monthlyData = null;

    this.archiveService.generateCustomReport(
      'monthly',
      selectedPeriod.startDate,
      selectedPeriod.endDate,
      {
        includeStocks: this.monthlyForm.get('includeStocks')?.value,
        includeDisposals: this.monthlyForm.get('includeDisposals')?.value,
        includePCs: this.monthlyForm.get('includePCs')?.value,
        detailedAnalysis: this.monthlyForm.get('detailedAnalysis')?.value
      }
    )
    .pipe(first())
    .subscribe({
      next: (data) => {
        this.monthlyData = data;
        // Store the report with inclusion settings
        this.archiveService.storeReport(data, 'monthly', selectedPeriod.startDate, selectedPeriod.endDate, {
          includeStocks: this.monthlyForm.get('includeStocks')?.value,
          includeDisposals: this.monthlyForm.get('includeDisposals')?.value,
          includePCs: this.monthlyForm.get('includePCs')?.value,
          includeDetailedAnalysis: this.monthlyForm.get('detailedAnalysis')?.value
        });
        this.loadStoredReports();
        this.loadAvailablePeriods();
        this.loadReportStatistics();
        this.loading = false;
        this.alertService.success('Monthly report generated and stored successfully!');
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error generating monthly report: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  downloadWeeklyPDF(): void {
    if (this.weeklyData) {
      const selectedPeriod = this.selectedWeeklyPeriod || this.customWeeklyPeriod;
      if (selectedPeriod) {
        this.archiveService.downloadPDF(
          this.weeklyData, 
          'Weekly', 
          selectedPeriod.startDate, 
          selectedPeriod.endDate,
          this.weeklyForm.get('includeStocks')?.value,
          this.weeklyForm.get('includeDisposals')?.value,
          this.weeklyForm.get('includePCs')?.value,
          this.weeklyForm.get('detailedAnalysis')?.value
        );
        this.alertService.success('Weekly PDF report downloaded successfully!');
      }
    }
  }

  downloadMonthlyPDF(): void {
    if (this.monthlyData) {
      const selectedPeriod = this.selectedMonthlyPeriod || this.customMonthlyPeriod;
      if (selectedPeriod) {
        this.archiveService.downloadPDF(
          this.monthlyData, 
          'Monthly', 
          selectedPeriod.startDate, 
          selectedPeriod.endDate,
          this.monthlyForm.get('includeStocks')?.value,
          this.monthlyForm.get('includeDisposals')?.value,
          this.monthlyForm.get('includePCs')?.value,
          this.monthlyForm.get('detailedAnalysis')?.value
        );
        this.alertService.success('Monthly PDF report downloaded successfully!');
      }
    }
  }

  previewStoredReport(report: StoredReport): void {
    try {
      this.archiveService.previewPDF(report);
    } catch (error) {
      console.error('Error previewing report:', error);
      this.alertService.error('Error generating PDF preview. Please check the console for details.');
    }
  }

  downloadStoredReport(report: StoredReport): void {
    try {
      this.archiveService.downloadStoredReportPDF(report);
      this.alertService.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      this.alertService.error('Error generating PDF. Please check the console for details.');
    }
  }



  deleteStoredReport(report: StoredReport): void {
    if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
      this.archiveService.deleteStoredReport(report.id);
      this.loadStoredReports();
      this.loadAvailablePeriods();
      this.loadReportStatistics();
      this.alertService.success('Report deleted successfully!');
    }
  }

  exportAllReports(): void {
    const jsonData = this.archiveService.exportAllReports();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-reports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.alertService.success('All reports exported successfully!');
  }

  importReports(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const jsonData = e.target.result;
        const success = this.archiveService.importReports(jsonData);
        if (success) {
          this.loadStoredReports();
          this.loadAvailablePeriods();
          this.loadReportStatistics();
          this.alertService.success('Reports imported successfully!');
        } else {
          this.alertService.error('Failed to import reports. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  get hasWeeklyData(): boolean {
    return this.weeklyData !== null;
  }

  get hasMonthlyData(): boolean {
    return this.monthlyData !== null;
  }

  get hasStoredReports(): boolean {
    return this.storedReports.length > 0;
  }

  getReportsByType(type: 'weekly' | 'monthly'): StoredReport[] {
    return this.archiveService.getReportsByType(type);
  }

  formatWeekLabel(week: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }): string {
    return `Week ${week.weekNumber} (${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()})`;
  }

  formatMonthLabel(month: { monthYear: string; startDate: Date; endDate: Date; exists: boolean }): string {
    return `${month.startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }

  getObjectEntries(obj: any): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }

  // Period selection methods
  onWeeklyPeriodChange(event: any): void {
    const value = event.target.value;
    if (value === 'custom') {
      this.showCustomWeeklyPeriod = true;
      this.selectedWeeklyPeriod = null;
    } else if (value) {
      this.showCustomWeeklyPeriod = false;
      this.selectedWeeklyPeriod = this.availableWeeks.find(w => w.weekNumber.toString() === value) || null;
    } else {
      this.showCustomWeeklyPeriod = false;
      this.selectedWeeklyPeriod = null;
    }
  }

  onMonthlyPeriodChange(event: any): void {
    const value = event.target.value;
    if (value === 'custom') {
      this.showCustomMonthlyPeriod = true;
      this.selectedMonthlyPeriod = null;
    } else if (value) {
      this.showCustomMonthlyPeriod = false;
      this.selectedMonthlyPeriod = this.availableMonths.find(m => m.monthYear === value) || null;
    } else {
      this.showCustomMonthlyPeriod = false;
      this.selectedMonthlyPeriod = null;
    }
  }

  onCustomWeeklyDateChange(): void {
    if (this.customWeeklyStartDate && this.customWeeklyEndDate) {
      const startDate = new Date(this.customWeeklyStartDate);
      const endDate = new Date(this.customWeeklyEndDate);
      
      if (startDate <= endDate) {
        // Calculate week number manually
        const weekNumber = this.getWeekNumber(startDate);
        const existingReport = this.archiveService.checkReportExists('weekly', startDate, endDate);
        
        this.customWeeklyPeriod = {
          weekNumber,
          startDate,
          endDate,
          exists: existingReport !== null
        };
      } else {
        this.customWeeklyPeriod = null;
        this.alertService.error('Start date must be before or equal to end date.');
      }
    } else {
      this.customWeeklyPeriod = null;
    }
  }

  onCustomMonthlyDateChange(): void {
    if (this.customMonthlyStartDate && this.customMonthlyEndDate) {
      const startDate = new Date(this.customMonthlyStartDate);
      const endDate = new Date(this.customMonthlyEndDate);
      
      if (startDate <= endDate) {
        // Calculate month year manually
        const monthYear = this.getMonthYear(startDate);
        const existingReport = this.archiveService.checkReportExists('monthly', startDate, endDate);
        
        this.customMonthlyPeriod = {
          monthYear,
          startDate,
          endDate,
          exists: existingReport !== null
        };
      } else {
        this.customMonthlyPeriod = null;
        this.alertService.error('Start date must be before or equal to end date.');
      }
    } else {
      this.customMonthlyPeriod = null;
    }
  }

  // Helper methods for date calculations
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getMonthYear(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Helper methods for safe number formatting
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

  // Helper methods for filtered data calculations
  getFilteredStockCount(): number {
    if (!this.weeklyData && !this.monthlyData) return 0;
    const data = this.weeklyData || this.monthlyData;
    if (!data || !data.stocks) return 0;
    
    // Calculate total quantity of stock items
    return data.stocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  }

  getFilteredDisposalCount(): number {
    if (!this.weeklyData && !this.monthlyData) return 0;
    const data = this.weeklyData || this.monthlyData;
    if (!data || !data.disposals) return 0;
    
    // Calculate total quantity of disposed items
    return data.disposals.reduce((sum, disposal) => sum + (disposal.quantity || 0), 0);
  }

  getFilteredPCCount(): number {
    if (!this.weeklyData && !this.monthlyData) return 0;
    const data = this.weeklyData || this.monthlyData;
    if (!data || !data.pcs) return 0;
    
    // Return count of PC entries
    return data.pcs.length;
  }

  getFilteredTotalValue(): number {
    if (!this.weeklyData && !this.monthlyData) return 0;
    const data = this.weeklyData || this.monthlyData;
    if (!data) return 0;
    
    let totalValue = 0;
    
    // Add stock values
    if (data.stocks) {
      totalValue += data.stocks.reduce((sum, stock) => 
        sum + (stock.totalPrice || stock.price * stock.quantity || 0), 0);
    }
    
    // Add disposal values
    if (data.disposals) {
      totalValue += data.disposals.reduce((sum, disposal) => 
        sum + (disposal.disposalValue || disposal.totalValue || 0), 0);
    }
    
    // Add PC values
    if (data.pcs) {
      totalValue += data.pcs.reduce((sum, pc) => 
        sum + (pc.totalValue || pc.value || 0), 0);
    }
    
    return totalValue;
  }
}
