import { AccountService, AnalyticsService, StockService, ItemService, DisposeService, AlertService } from '@app/_services';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AnalyticsData, StockTimelineData } from '@app/_services/analytics.service';
// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: any[];
}

export interface TimelineChartData {
  date: string;
  value: number;
}
import { Role } from '@app/_models';
import { Subscription, interval } from 'rxjs';

@Component({ 
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
    Role = Role;
    account = this.accountService.accountValue;
    analyticsData: AnalyticsData | null = null;
    loading = true;
    categoryDistribution: any[] = [];
    stockTimelineData: TimelineChartData[] = [];
    disposalTimelineData: TimelineChartData[] = [];
    selectedTimePeriod: number = 30;
    downloading = false;

    // Chart.js properties
    @ViewChild('stockChart') stockChart: any;
    @ViewChild('disposalChart') disposalChart: any;

    // Stock Chart Configuration
    stockChartData = {
        labels: [],
        datasets: [{
            label: 'Stock Levels',
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

    stockChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 12,
                        weight: '600'
                    },
                    color: '#495057'
                }
            },
            title: {
                display: true,
                text: 'Stock Analytics - Monthly Overview',
                font: {
                    family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    size: 16,
                    weight: '700'
                },
                color: '#1a1a1a'
            },
            tooltip: {
                mode: 'nearest' as const,
                intersect: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#007bff',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function(context) {
                        const dataIndex = context[0].dataIndex;
                        const chart = context[0].chart;
                        const labels = chart.data.labels;
                        if (labels && labels[dataIndex]) {
                            const label = labels[dataIndex];
                            // Return the label as is
                            return label;
                        }
                        return '';
                    },
                    label: function(context) {
                        const value = context.parsed.y;
                        const label = context.dataset.label;
                        if (label === 'Stock Levels') {
                            return label + ': ' + value + ' units';
                        }
                        return label + ': ' + value;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 11
                    },
                    color: '#6c757d',
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 11
                    },
                    color: '#6c757d',
                    callback: function(value: any) {
                        return value + ' units';
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBackgroundColor: '#007bff',
                hoverBorderColor: '#ffffff'
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: true
        },
        hover: {
            mode: 'nearest' as const,
            intersect: true,
            animationDuration: 0
        }
    };

    // Disposal Chart Configuration
    disposalChartData = {
        labels: [],
        datasets: [{
            label: 'Disposals',
            data: [],
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
    };

    disposalChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 12,
                        weight: '600'
                    },
                    color: '#495057'
                }
            },
            title: {
                display: true,
                text: 'Disposal Analytics - Monthly Overview',
                font: {
                    family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    size: 16,
                    weight: '700'
                },
                color: '#1a1a1a'
            },
            tooltip: {
                mode: 'nearest' as const,
                intersect: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#dc3545',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: function(context) {
                        const dataIndex = context[0].dataIndex;
                        const chart = context[0].chart;
                        const labels = chart.data.labels;
                        if (labels && labels[dataIndex]) {
                            return labels[dataIndex];
                        }
                        return '';
                    },
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 11
                    },
                    color: '#6c757d',
                    maxRotation: 45,
                    minRotation: 0
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        size: 11
                    },
                    color: '#6c757d',
                    callback: function(value: any) {
                        return value + ' items';
                    }
                }
            }
        },
        elements: {
            point: {
                hoverBackgroundColor: '#dc3545',
                hoverBorderColor: '#ffffff'
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: true
        },
        hover: {
            mode: 'nearest' as const,
            intersect: true,
            animationDuration: 0
        }
    };

    timePeriods = [
        { label: '1D', value: 1 },
        { label: '1W', value: 7 },
        { label: '1M', value: 30 },
        { label: '3M', value: 90 },
        { label: '1Y', value: 365 },
        { label: 'All', value: 0 }
    ];

    private refreshIntervalSubscription: Subscription | null = null;

    // Dashboard properties
    stats: any = {
        totalItems: 0,
        totalPCs: 0,
        totalUsers: 0,
        totalStock: 0,
        inUse: 0,
        available: 0,
        lowStock: 0,
        outOfStock: 0,
        pendingRequests: 0
    };

    quickStats: any[] = [
        { icon: 'fas fa-boxes text-primary', value: 0, label: 'Total Items' },
        { icon: 'fas fa-desktop text-success', value: 0, label: 'PCs' },
        { icon: 'fas fa-users text-info', value: 0, label: 'Users' },
        { icon: 'fas fa-chart-line text-warning', value: 0, label: 'Active' }
    ];

    recentActivity: any[] = [
        { icon: 'fas fa-plus text-success', message: 'New item added to inventory', timestamp: new Date() },
        { icon: 'fas fa-edit text-primary', message: 'Stock updated for PC components', timestamp: new Date() },
        { icon: 'fas fa-user text-info', message: 'New user registered', timestamp: new Date() }
    ];

    quickActions: any[] = [
        { 
            icon: 'fas fa-plus text-primary', 
            title: 'Add Item', 
            description: 'Add new inventory item',
            route: '/add'
        },
        { 
            icon: 'fas fa-boxes text-success', 
            title: 'View Stock', 
            description: 'Check current stock levels',
            route: '/stocks'
        },
        { 
            icon: 'fas fa-desktop text-info', 
            title: 'PC Management', 
            description: 'Manage PC components',
            route: '/pc'
        },
        { 
            icon: 'fas fa-chart-bar text-warning', 
            title: 'Reports', 
            description: 'Generate inventory reports',
            route: '/reports'
        }
    ];

    constructor(
        private accountService: AccountService,
        private stockService: StockService,
        private itemService: ItemService,
        private disposalService: DisposeService,
        private analyticsService: AnalyticsService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadAnalytics();
        this.loadCategoryDistribution();
        this.loadStockTimelineData();
        this.loadDisposalTimelineData();
        this.loadDashboardStats();
        
        // Set up real-time updates every 30 seconds
        this.setupRealTimeUpdates();
    }

    ngOnDestroy() {
        if (this.refreshIntervalSubscription) {
            this.refreshIntervalSubscription.unsubscribe();
        }
    }

    setupRealTimeUpdates() {
        // Update data every 30 seconds to keep charts current
        this.refreshIntervalSubscription = interval(30000).subscribe(() => {
            this.refreshData();
        });
    }

    refreshData() {
        // Refresh all data to ensure charts are current
        this.loadStockTimelineData();
        this.loadDisposalTimelineData();
        this.loadCategoryDistribution();
    }

    loadAnalytics() {
        this.loading = true;
        this.analyticsService.getDashboardAnalytics().subscribe({
            next: (data) => {
                this.analyticsData = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading analytics:', error);
                this.loading = false;
            }
        });
    }

    loadDashboardStats() {
        // Load items count
        this.itemService.getAll().subscribe({
            next: (items) => {
                this.stats.totalItems = items.length;
                this.quickStats[0].value = items.length;
            },
            error: (error) => {
                console.error('Error loading items:', error);
            }
        });

        // Load stock data
        this.stockService.getAll().subscribe({
            next: (stocks) => {
                this.stats.totalStock = stocks.length;
                this.stats.available = stocks.filter(s => s.quantity > 0).length;
                this.stats.inUse = stocks.filter(s => s.quantity === 0).length;
                this.stats.lowStock = stocks.filter(s => s.quantity > 0 && s.quantity <= 5).length;
                this.stats.outOfStock = stocks.filter(s => s.quantity === 0).length;
                
                this.quickStats[1].value = this.stats.totalStock;
                this.quickStats[3].value = this.stats.available;
            },
            error: (error) => {
                console.error('Error loading stocks:', error);
            }
        });

        // Set default values for other stats
        this.stats.totalPCs = 0;
        this.stats.totalUsers = 1; // At least the current user
        this.stats.pendingRequests = 0;
        
        this.quickStats[2].value = this.stats.totalUsers;
    }

    loadCategoryDistribution() {
        this.analyticsService.getCategoryDistribution().subscribe({
            next: (distribution) => {
                this.categoryDistribution = distribution;
                this.updateChartData();
            },
            error: (error) => {
                console.error('Error loading category distribution:', error);
            }
        });
    }

    loadStockTimelineData() {
        this.analyticsService.getStockAdditionsOverTime(this.selectedTimePeriod).subscribe({
            next: (stockTimeline) => {
                // Process timeline data to show stock additions over time
                this.stockTimelineData = this.processStockTimelineForChart(stockTimeline);
                this.updateChartData(); // Update chart data after loading timeline
            },
            error: (error) => {
                console.error('Error loading stock timeline:', error);
                // Fallback to empty data if API fails
                this.stockTimelineData = [];
                this.updateChartData();
            }
        });
    }

    loadDisposalTimelineData() {
        this.disposalService.getAll().subscribe({
            next: (disposals) => {
                // Process disposal data to show actual disposals over time
                this.disposalTimelineData = this.processDisposalTimelineForChart(disposals);
                this.updateChartData(); // Update chart data after loading disposal data
            },
            error: (error) => {
                console.error('Error loading disposal timeline:', error);
            }
        });
    }

    processStockTimelineForChart(stockTimeline: any[]): TimelineChartData[] {
        // Convert TimelineData to TimelineChartData format with better error handling
        if (!stockTimeline || stockTimeline.length === 0) {
            return [];
        }
        
        return stockTimeline
            .filter(item => item && item.date) // Filter out invalid items
            .map(item => ({
                date: item.date,
                value: item.stockCount || item.itemCount || 0
            }))
            .filter(item => item.value > 0); // Only include items with positive values
    }

    processDisposalTimelineForChart(disposals: any[]): TimelineChartData[] {
        // Group disposals by date and calculate total quantity disposed per day with better error handling
        if (!disposals || disposals.length === 0) {
            return [];
        }
        
        const dailyDisposals = new Map<string, number>();
        
        disposals.forEach(disposal => {
            if (disposal && disposal.disposalDate) {
                try {
                    const disposalDate = new Date(disposal.disposalDate);
                    if (!isNaN(disposalDate.getTime())) { // Check if date is valid
                        const dateStr = disposalDate.toISOString().split('T')[0];
                        const quantity = disposal.quantity || 1;
                        dailyDisposals.set(dateStr, (dailyDisposals.get(dateStr) || 0) + quantity);
                    }
                } catch (error) {
                    console.warn('Invalid disposal date:', disposal.disposalDate);
                }
            }
        });
        
        // Convert to TimelineChartData format and sort by date
        return Array.from(dailyDisposals.entries())
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    updateChartData() {
        if (this.categoryDistribution.length > 0) {
            const totalStock = this.categoryDistribution.reduce((sum, category) => sum + category.count, 0);
            
            // Update percentages for display
            this.categoryDistribution.forEach(category => {
                category.percentage = Math.round((category.count / totalStock) * 100);
            });
        }
        
        // Create monthly timeline based on actual operational data
        const monthlyData = this.createMonthlyTimeline();
        
        // Update Chart.js Stock Chart Data with monthly timeline
        this.stockChartData.labels = monthlyData.map(item => item.month);
        this.stockChartData.datasets[0].data = monthlyData.map(item => item.stockValue);
        
        // Update Chart.js Disposal Chart Data with monthly timeline
        this.disposalChartData.labels = monthlyData.map(item => item.month);
        this.disposalChartData.datasets[0].data = monthlyData.map(item => item.disposalValue);
        
        // Update chart titles based on time period
        this.stockChartOptions.plugins.title.text = 'Stock Analytics - Monthly Overview';
        this.disposalChartOptions.plugins.title.text = 'Disposal Analytics - Monthly Overview';
        
        console.log('Monthly Chart.js data updated:', {
            stock: this.stockChartData,
            disposal: this.disposalChartData,
            monthlyData: monthlyData
        });
    }

    createMonthlyTimeline(): any[] {
        const monthlyData = [];
        const currentDate = new Date();
        
        // Get the date range from actual data
        const allDates: Date[] = [];
        
        // Collect all dates from stock timeline with validation
        this.stockTimelineData.forEach(item => {
            if (item && item.date) {
                try {
                    const date = new Date(item.date);
                    if (!isNaN(date.getTime())) {
                        allDates.push(date);
                    }
                } catch (error) {
                    console.warn('Invalid stock date:', item.date);
                }
            }
        });
        
        // Collect all dates from disposal timeline with validation
        this.disposalTimelineData.forEach(item => {
            if (item && item.date) {
                try {
                    const date = new Date(item.date);
                    if (!isNaN(date.getTime())) {
                        allDates.push(date);
                    }
                } catch (error) {
                    console.warn('Invalid disposal date:', item.date);
                }
            }
        });
        
        if (allDates.length === 0) {
            // If no data available, return empty array
            return monthlyData;
        }
        
        // Sort dates and get range
        allDates.sort((a, b) => a.getTime() - b.getTime());
        const startDate = new Date(allDates[0]);
        const endDate = new Date(allDates[allDates.length - 1]);
        
        // Extend timeline to include current month if needed
        const now = new Date();
        const extendedEndDate = new Date(Math.max(endDate.getTime(), now.getTime()));
        
        // Create monthly buckets
        const monthlyBuckets = new Map<string, { stockValue: number, disposalValue: number, count: number, isSpecial: boolean }>();
        
        // Initialize monthly buckets
        let bucketDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (bucketDate <= extendedEndDate) {
            const monthKey = bucketDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            monthlyBuckets.set(monthKey, { stockValue: 0, disposalValue: 0, count: 0, isSpecial: false });
            bucketDate.setMonth(bucketDate.getMonth() + 1);
        }
        
        // Aggregate stock data by month
        this.stockTimelineData.forEach(item => {
            if (item && item.date) {
                try {
                    const date = new Date(item.date);
                    if (!isNaN(date.getTime())) {
                        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        const bucket = monthlyBuckets.get(monthKey);
                        if (bucket) {
                            bucket.stockValue += item.value || 0;
                            bucket.count++;
                        }
                    }
                } catch (error) {
                    console.warn('Invalid stock date in aggregation:', item.date);
                }
            }
        });
        
        // Aggregate disposal data by month
        this.disposalTimelineData.forEach(item => {
            if (item && item.date) {
                try {
                    const date = new Date(item.date);
                    if (!isNaN(date.getTime())) {
                        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        const bucket = monthlyBuckets.get(monthKey);
                        if (bucket) {
                            bucket.disposalValue += item.value || 0;
                        }
                    }
                } catch (error) {
                    console.warn('Invalid disposal date in aggregation:', item.date);
                }
            }
        });
        
        // Convert to array and sort by date
        monthlyBuckets.forEach((data, month) => {
            monthlyData.push({
                month: month,
                stockValue: data.stockValue,
                disposalValue: data.disposalValue,
                isSpecialMonth: false
            });
        });
        
        // Sort by actual chronological order
        monthlyData.sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const aMonth = months.indexOf(a.month.split(' ')[0]);
            const bMonth = months.indexOf(b.month.split(' ')[0]);
            const aYear = parseInt(a.month.split(' ')[1]);
            const bYear = parseInt(b.month.split(' ')[1]);
            
            if (aYear !== bYear) return aYear - bYear;
            return aMonth - bMonth;
        });
        
        return monthlyData;
    }

    getTimePeriodLabel(): string {
        const selected = this.timePeriods.find(tp => tp.value === this.selectedTimePeriod);
        return selected ? selected.label : 'All Time';
    }

    getOperationalPeriod(): string {
        // Get the actual start date from the earliest stock or disposal record
        const currentDate = new Date();
        let startDate = currentDate;
        
        // Find the earliest date from stock timeline data
        if (this.stockTimelineData && this.stockTimelineData.length > 0) {
            const earliestStockDate = new Date(Math.min(...this.stockTimelineData.map(item => new Date(item.date).getTime())));
            if (earliestStockDate < startDate) {
                startDate = earliestStockDate;
            }
        }
        
        // Find the earliest date from disposal timeline data
        if (this.disposalTimelineData && this.disposalTimelineData.length > 0) {
            const earliestDisposalDate = new Date(Math.min(...this.disposalTimelineData.map(item => new Date(item.date).getTime())));
            if (earliestDisposalDate < startDate) {
                startDate = earliestDisposalDate;
            }
        }
        
        // If no data available, use current date
        if (startDate.getTime() === currentDate.getTime()) {
            return 'No operational data available';
        }
        
        // Format the start date
        const startFormatted = startDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Format the current date
        const currentFormatted = currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        return `${startFormatted} - ${currentFormatted}`;
    }

    getTotalOperationalMonths(): number {
        // Calculate months from actual start date to current date
        const currentDate = new Date();
        let startDate = currentDate;
        
        // Find the earliest date from stock timeline data
        if (this.stockTimelineData && this.stockTimelineData.length > 0) {
            const earliestStockDate = new Date(Math.min(...this.stockTimelineData.map(item => new Date(item.date).getTime())));
            if (earliestStockDate < startDate) {
                startDate = earliestStockDate;
            }
        }
        
        // Find the earliest date from disposal timeline data
        if (this.disposalTimelineData && this.disposalTimelineData.length > 0) {
            const earliestDisposalDate = new Date(Math.min(...this.disposalTimelineData.map(item => new Date(item.date).getTime())));
            if (earliestDisposalDate < startDate) {
                startDate = earliestDisposalDate;
            }
        }
        
        // If no data available, return 0
        if (startDate.getTime() === currentDate.getTime()) {
            return 0;
        }
        
        // Calculate the difference in months
        const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
        const monthDiff = currentDate.getMonth() - startDate.getMonth();
        
        let totalMonths = yearDiff * 12 + monthDiff;
        
        // Adjust for partial months
        if (currentDate.getDate() < startDate.getDate()) {
            totalMonths--;
        }
        
        // Ensure at least 1 month is shown if there's any data
        return Math.max(1, totalMonths);
    }

    getTotalStock(): number {
        return this.categoryDistribution.reduce((sum, category) => sum + category.count, 0);
    }

    getCurrentDate(): string {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getLastUpdateTime(): string {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    getDataStatus(): string {
        if (this.stockTimelineData.length === 0 && this.disposalTimelineData.length === 0) {
            return 'No operational data available';
        }
        
        const stockCount = this.stockTimelineData.length;
        const disposalCount = this.disposalTimelineData.length;
        
        if (stockCount > 0 && disposalCount > 0) {
            return `Active: ${stockCount} stock records, ${disposalCount} disposal records;`;
        } else if (stockCount > 0) {
            return `Active: ${stockCount} stock records;`;
        } else {
            return `Active: ${disposalCount} disposal records;`;
        }
    }

    getTotalTimelineAdditions(): number {
        return this.stockTimelineData.reduce((sum, item) => sum + item.value, 0);
    }

    getAverageDailyAdditions(): number {
        if (this.stockTimelineData.length === 0) return 0;
        const total = this.getTotalTimelineAdditions();
        return Math.round(total / this.stockTimelineData.length);
    }

    getTotalDisposalCount(): number {
        return this.disposalTimelineData.reduce((sum, item) => sum + item.value, 0);
    }

    getAverageDailyDisposals(): number {
        if (this.disposalTimelineData.length === 0) return 0;
        const total = this.getTotalDisposalCount();
        return Math.round(total / this.disposalTimelineData.length);
    }

    getDisposalTrend(): string {
        if (this.disposalTimelineData.length < 2) return 'Insufficient data';
        
        const recent = this.disposalTimelineData.slice(-7); // Last 7 days
        const previous = this.disposalTimelineData.slice(-14, -7); // 7 days before that
        
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const previousAvg = previous.reduce((sum, item) => sum + item.value, 0) / previous.length;
        
        if (recentAvg > previousAvg * 1.1) return 'Increasing';
        if (recentAvg < previousAvg * 0.9) return 'Decreasing';
        return 'Stable';
    }

    getMostActiveDisposalDay(): string {
        if (this.disposalTimelineData.length === 0) return 'No data';
        
        const maxDisposal = Math.max(...this.disposalTimelineData.map(item => item.value));
        const maxDay = this.disposalTimelineData.find(item => item.value === maxDisposal);
        
        if (maxDay) {
            const date = new Date(maxDay.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return 'No data';
    }

    // Helper methods for chart Y-axis ticks
    getStockTick75(): number {
        return Math.round(this.getTotalStock() * 0.75);
    }

    getStockTick50(): number {
        return Math.round(this.getTotalStock() * 0.5);
    }

    getStockTick25(): number {
        return Math.round(this.getTotalStock() * 0.25);
    }

    getAdditionsTick75(): number {
        return Math.round(this.getTotalTimelineAdditions() * 0.75);
    }

    getAdditionsTick50(): number {
        return Math.round(this.getTotalTimelineAdditions() * 0.5);
    }

    getAdditionsTick25(): number {
        return Math.round(this.getTotalTimelineAdditions() * 0.25);
    }

    // Stock chart helper methods
    selectTimePeriod(days: number) {
        this.selectedTimePeriod = days;
        this.loadStockTimelineData();
        // Force chart data update after timeline data loads
        setTimeout(() => {
            this.updateChartData();
        }, 100);
    }

    hasRole(roles: Role[]): boolean {
        const account = this.accountService.accountValue;
        return account && roles.includes(account.role as Role);
    }

    // Excel Download Methods
    downloadStockList() {
        this.downloading = true;
        this.analyticsService.downloadStockListExcel().subscribe({
            next: () => {
                this.downloading = false;
                this.alertService.success('Stock list downloaded successfully!', { autoClose: true });
            },
            error: (error) => {
                this.downloading = false;
                this.alertService.error('Error downloading stock list. Please try again.', { autoClose: true });
                console.error('Error downloading stock list:', error);
            }
        });
    }

    downloadWeeklyReport() {
        this.downloading = true;
        this.analyticsService.downloadWeeklyStockReport().subscribe({
            next: () => {
                this.downloading = false;
                this.alertService.success('Weekly stock report (Word) downloaded successfully!', { autoClose: true });
            },
            error: (error) => {
                this.downloading = false;
                this.alertService.error('Error downloading weekly report. Please try again.', { autoClose: true });
                console.error('Error downloading weekly report:', error);
            }
        });
    }

    downloadMonthlyReport() {
        this.downloading = true;
        this.analyticsService.downloadMonthlyStockReport().subscribe({
            next: () => {
                this.downloading = false;
                this.alertService.success('Monthly stock report (Word) downloaded successfully!', { autoClose: true });
            },
            error: (error) => {
                this.downloading = false;
                this.alertService.error('Error downloading monthly report. Please try again.', { autoClose: true });
                console.error('Error downloading monthly report:', error);
            }
        });
    }

    downloadYearlyReport() {
        this.downloading = true;
        this.analyticsService.downloadYearlyStockReport().subscribe({
            next: () => {
                this.downloading = false;
                this.alertService.success('Yearly stock report (Word) downloaded successfully!', { autoClose: true });
            },
            error: (error) => {
                this.downloading = false;
                this.alertService.error('Error downloading yearly report. Please try again.', { autoClose: true });
                console.error('Error downloading yearly report:', error);
            }
        });
    }
}