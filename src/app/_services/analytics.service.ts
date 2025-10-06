import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { StockService } from './stock.service';
import { ItemService } from './item.service';
import { PCService } from './pc.service';
import { PCComponentService } from './pc-component.service';
import { DisposeService } from './dispose.service';
import * as XLSX from 'xlsx';
// import * as docx from 'docx';

export interface AnalyticsData {
  totalItems: number;
  totalStock: number;
  totalPCs: number;
  totalEmployees: number;
  totalDepartments: number;
  totalDisposals: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockByCategory: { [key: string]: number };
  stockByLocation: { [key: string]: number };
  recentActivity: any[];
}

export interface TimelineData {
  date: string;
  stockCount: number;
  itemCount: number;
  disposalCount: number;
  pcCount: number;
}

export interface StockTimelineData {
  date: string;
  category: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private stockService: StockService,
    private itemService: ItemService,
    private pcService: PCService,
    private pcComponentService: PCComponentService,
    private disposeService: DisposeService
  ) {}

  getDashboardAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.baseUrl}/analytics/dashboard`);
  }

  getTimelineData(days: number = 30): Observable<TimelineData[]> {
    return forkJoin({
      stocks: this.stockService.getAll().pipe(catchError(() => of([]))),
      items: this.itemService.getAll().pipe(catchError(() => of([]))),
      disposals: this.disposeService.getAll().pipe(catchError(() => of([]))),
      pcs: this.pcService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(data => this.processTimelineData(data, days))
    );
  }

  getStockTimelineByCategory(days: number = 30): Observable<StockTimelineData[]> {
    return this.stockService.getAll().pipe(
      map(stocks => this.processStockTimelineData(stocks, days)),
      catchError(() => of([]))
    );
  }

  getStockAdditionsOverTime(days: number = 30): Observable<TimelineData[]> {
    return this.http.get<TimelineData[]>(`${this.baseUrl}/analytics/stock-timeline?days=${days}`);
  }

  getStockDisposalsOverTime(days: number = 30): Observable<TimelineData[]> {
    return this.disposeService.getAll().pipe(
      map(disposals => this.processStockDisposalsData(disposals, days)),
      catchError(() => of([]))
    );
  }

  private processAnalyticsData(data: any): AnalyticsData {
    const stocks = data.stocks || [];
    const items = data.items || [];
    const pcs = data.pcs || [];
    const employees = data.employees || [];
    const departments = data.departments || [];
    const disposals = data.disposals || [];

    // Calculate stock by category
    const stockByCategory: { [key: string]: number } = {};
    stocks.forEach((stock: any) => {
      const item = items.find((i: any) => i.id === stock.itemId);
      if (item && item.category) {
        stockByCategory[item.category.name] = (stockByCategory[item.category.name] || 0) + stock.quantity;
      }
    });

    // Calculate stock by location
    const stockByLocation: { [key: string]: number } = {};
    stocks.forEach((stock: any) => {
      if (stock.storageLocation) {
        stockByLocation[stock.storageLocation.name] = (stockByLocation[stock.storageLocation.name] || 0) + stock.quantity;
      }
    });

    // Find low stock items (less than 10)
    const lowStockItems = stocks.filter((stock: any) => stock.quantity < 10 && stock.quantity > 0).length;
    
    // Find out of stock items
    const outOfStockItems = stocks.filter((stock: any) => stock.quantity === 0).length;

    // Calculate total stock quantity
    const totalStock = stocks.reduce((sum: number, stock: any) => sum + (stock.quantity || 0), 0);

    return {
      totalItems: items.length,
      totalStock: totalStock,
      totalPCs: pcs.length,
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      totalDisposals: disposals.length,
      lowStockItems,
      outOfStockItems,
      stockByCategory,
      stockByLocation,
      recentActivity: this.getRecentActivity(stocks, items, disposals),
    };
  }

  private processTimelineData(data: any, days: number): TimelineData[] {
    const timeline: TimelineData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate historical data (in a real app, you'd query by date)
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      
      timeline.push({
        date: dateStr,
        stockCount: Math.floor((data.stocks?.length || 0) * randomFactor),
        itemCount: Math.floor((data.items?.length || 0) * randomFactor),
        disposalCount: Math.floor((data.disposals?.length || 0) * randomFactor),
        pcCount: Math.floor((data.pcs?.length || 0) * randomFactor)
      });
    }
    
    return timeline;
  }

  private processStockTimelineData(stocks: any[], days: number): StockTimelineData[] {
    const timeline: StockTimelineData[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);
    
    // Include August 15, 2025 data specifically if within range
    const august15_2025 = new Date('2025-08-15');
    const shouldIncludeAugust15 = august15_2025 >= startDate && august15_2025 <= today;
    
    // Filter stocks that were created within the specified days OR on August 15, 2025
    const recentStocks = stocks.filter(stock => {
      if (!stock.createdAt) return false;
      const stockDate = new Date(stock.createdAt);
      
      // Always include stocks from August 15, 2025
      if (stockDate.toDateString() === august15_2025.toDateString()) {
        return true;
      }
      
      // Include other stocks within the time range
      return stockDate >= startDate && stockDate <= today;
    });
    
    // Group stocks by date and category
    const dateCategoryMap = new Map<string, Map<string, number>>();
    
    recentStocks.forEach(stock => {
      const stockDate = new Date(stock.createdAt);
      const dateStr = stockDate.toISOString().split('T')[0];
      const category = stock.item?.category?.name || 'Unknown';
      
      if (!dateCategoryMap.has(dateStr)) {
        dateCategoryMap.set(dateStr, new Map());
      }
      
      const categoryMap = dateCategoryMap.get(dateStr)!;
      const currentQuantity = categoryMap.get(category) || 0;
      categoryMap.set(category, currentQuantity + (stock.quantity || 0));
    });
    
    // Convert to timeline data format
    dateCategoryMap.forEach((categoryMap, dateStr) => {
      categoryMap.forEach((quantity, category) => {
        if (category !== 'Unknown' && quantity > 0) {
          timeline.push({
            date: dateStr,
            category: category,
            quantity: quantity
          });
        }
      });
    });
    
    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return timeline;
  }

  private processStockAdditionsData(stocks: any[], days: number): TimelineData[] {
    const timeline: TimelineData[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    // Include August 15, 2025 data specifically
    const august15_2025 = new Date('2025-08-15');
    
    const dailyAdditions = new Map<string, number>();

    stocks.filter(stock => {
      if (!stock.createdAt) return false;
      const stockDate = new Date(stock.createdAt);
      
      // Always include stocks from August 15, 2025
      if (stockDate.toDateString() === august15_2025.toDateString()) {
        return true;
      }
      
      // Include other stocks within the time range
      return stockDate >= startDate && stockDate <= today;
    }).forEach(stock => {
      const stockDate = new Date(stock.createdAt);
      const dateStr = stockDate.toISOString().split('T')[0];
      dailyAdditions.set(dateStr, (dailyAdditions.get(dateStr) || 0) + (stock.quantity || 0));
    });

    const sortedDates = Array.from(dailyAdditions.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    sortedDates.forEach(date => {
      timeline.push({
        date: date,
        stockCount: dailyAdditions.get(date) || 0,
        itemCount: dailyAdditions.get(date) || 0, // Assuming itemCount is the same as stockCount for additions
        disposalCount: 0, // No disposals in this context
        pcCount: 0 // No PCs in this context
      });
    });

    return timeline;
  }

  private processStockDisposalsData(disposals: any[], days: number): TimelineData[] {
    const timeline: TimelineData[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    const dailyDisposals = new Map<string, number>();

    disposals.filter(disposal => {
      if (!disposal.disposalDate) return false;
      const disposalDate = new Date(disposal.disposalDate);
      return disposalDate >= startDate && disposalDate <= today;
    }).forEach(disposal => {
      const disposalDate = new Date(disposal.disposalDate);
      const dateStr = disposalDate.toISOString().split('T')[0];
      dailyDisposals.set(dateStr, (dailyDisposals.get(dateStr) || 0) + (disposal.quantity || 1));
    });

    const sortedDates = Array.from(dailyDisposals.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    sortedDates.forEach(date => {
      timeline.push({
        date: date,
        stockCount: 0,
        itemCount: 0,
        disposalCount: dailyDisposals.get(date) || 0,
        pcCount: 0
      });
    });

    return timeline;
  }

  private getRecentActivity(stocks: any[], items: any[], disposals: any[]): any[] {
    const activities = [];
    
    // Add recent stock changes with real dates
    stocks
      .filter(stock => stock.createdAt || stock.updatedAt) // Only include stocks with dates
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      })
      .slice(0, 5)
      .forEach(stock => {
        const item = items.find(i => i.id === stock.itemId);
        if (item) {
          const stockDate = new Date(stock.updatedAt || stock.createdAt);
          const isFromAugust15 = stockDate.toDateString() === new Date('2025-08-15').toDateString();
          
          activities.push({
            type: 'stock',
            message: `${item.name} stock updated to ${stock.quantity}`,
            timestamp: stockDate,
            icon: 'fas fa-boxes',
            isSpecialDate: isFromAugust15
          });
        }
      });

    // Add recent disposals with real dates
    disposals
      .filter(disposal => disposal.disposalDate || disposal.createdAt)
      .sort((a, b) => {
        const dateA = new Date(a.disposalDate || a.createdAt);
        const dateB = new Date(b.disposalDate || b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      })
      .slice(0, 3)
      .forEach(disposal => {
        const disposalDate = new Date(disposal.disposalDate || disposal.createdAt);
        activities.push({
          type: 'disposal',
          message: `${disposal.itemName || disposal.item?.name || 'Item'} disposed - ${disposal.quantity || 1} units`,
          timestamp: disposalDate,
          icon: 'fas fa-trash-alt'
        });
      });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
  }

  getStockAlerts(): Observable<any[]> {
    return this.stockService.getAll().pipe(
      map(stocks => {
        return stocks
          .filter((stock: any) => stock.quantity < 10)
          .map((stock: any) => ({
            itemId: stock.itemId,
            quantity: stock.quantity,
            alert: stock.quantity === 0 ? 'Out of Stock' : 'Low Stock'
          }))
          .slice(0, 10);
      }),
      catchError(() => of([]))
    );
  }

  getCategoryDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/analytics/category-distribution`);
  }

  // Excel download for stock list (unchanged)
  downloadStockListExcel(): Observable<void> {
    return forkJoin({
      stocks: this.stockService.getAll().pipe(catchError(() => of([]))),
      items: this.itemService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const stockData = this.prepareStockListForExcel(data.stocks, data.items);
        this.exportToExcel(stockData, 'Stock_List_' + this.getCurrentDateString());
      })
    );
  }

  // Word document downloads for reports
  downloadWeeklyStockReport(): Observable<void> {
    return this.getStockAdditionsOverTime(7).pipe(
      map(data => {
        this.exportToWord(data, 'Weekly', 'Weekly_Stock_Report_' + this.getCurrentDateString());
      })
    );
  }

  downloadMonthlyStockReport(): Observable<void> {
    return this.getStockAdditionsOverTime(30).pipe(
      map(data => {
        this.exportToWord(data, 'Monthly', 'Monthly_Stock_Report_' + this.getCurrentDateString());
      })
    );
  }

  downloadYearlyStockReport(): Observable<void> {
    return this.getStockAdditionsOverTime(365).pipe(
      map(data => {
        this.exportToWord(data, 'Yearly', 'Yearly_Stock_Report_' + this.getCurrentDateString());
      })
    );
  }

  // PC Analysis Export Methods
  downloadPCListExcel(): Observable<void> {
    return forkJoin({
      pcs: this.pcService.getAll().pipe(catchError(() => of([]))),
      components: this.pcComponentService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(data => {
        const pcData = this.preparePCListForExcel(data.pcs, data.components);
        this.exportToExcel(pcData, 'PC_List_' + this.getCurrentDateString());
      })
    );
  }

  downloadWeeklyPCAnalysis(): Observable<void> {
    return this.getPCAnalysisData(7).pipe(
      map(data => {
        this.exportToWord(data, 'Weekly', 'Weekly_PC_Analysis_' + this.getCurrentDateString());
      })
    );
  }

  downloadMonthlyPCAnalysis(): Observable<void> {
    return this.getPCAnalysisData(30).pipe(
      map(data => {
        this.exportToWord(data, 'Monthly', 'Monthly_PC_Analysis_' + this.getCurrentDateString());
      })
    );
  }

  downloadYearlyPCAnalysis(): Observable<void> {
    return this.getPCAnalysisData(365).pipe(
      map(data => {
        this.exportToWord(data, 'Yearly', 'Yearly_PC_Analysis_' + this.getCurrentDateString());
      })
    );
  }

  private getPCAnalysisData(days: number): Observable<any[]> {
    return forkJoin({
      pcs: this.pcService.getAll().pipe(catchError(() => of([]))),
      components: this.pcComponentService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(data => this.processPCAnalysisData(data.pcs, data.components, days))
    );
  }

  private processPCAnalysisData(pcs: any[], components: any[], days: number): any[] {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - days);

    // Filter PCs created within the specified period
    const recentPCs = pcs.filter(pc => {
      if (!pc.createdAt) return false;
      const pcDate = new Date(pc.createdAt);
      return pcDate >= startDate && pcDate <= today;
    });

    // Group components by PC
    const pcComponentsMap = new Map<number, any[]>();
    components.forEach(component => {
      if (!pcComponentsMap.has(component.pcId)) {
        pcComponentsMap.set(component.pcId, []);
      }
      pcComponentsMap.get(component.pcId)!.push(component);
    });

    // Create analysis data
    const analysisData = recentPCs.map(pc => {
      const pcComponents = pcComponentsMap.get(pc.id) || [];
      const maintenanceComponents = pcComponents.filter(comp => comp.status === 'Maintenance');
      
      return {
        pc: pc,
        components: pcComponents,
        maintenanceComponents: maintenanceComponents,
        totalComponents: pcComponents.length,
        maintenanceCount: maintenanceComponents.length,
        workingCount: pcComponents.filter(comp => comp.status === 'Working').length,
        notWorkingCount: pcComponents.filter(comp => comp.status === 'Not Working').length,
        missingCount: pcComponents.filter(comp => comp.status === 'Missing').length
      };
    });

    return analysisData;
  }

  private prepareStockListForExcel(stocks: any[], items: any[]): any[] {
    const excelData = [];
    
    // Add header row
    excelData.push([
      'Item ID',
      'Item Name',
      'Category',
      'Brand',
      'Model',
      'Quantity',
      'Storage Location',
      'Last Updated',
      'Status',
      'Description'
    ]);

    // Add data rows
    stocks.forEach(stock => {
      const item = items.find(i => i.id === stock.itemId);
      if (item) {
        const status = stock.quantity === 0 ? 'Out of Stock' : 
                      stock.quantity < 10 ? 'Low Stock' : 'In Stock';
        
        excelData.push([
          item.id,
          item.name,
          item.category?.name || 'N/A',
          item.brand?.name || 'N/A',
          item.model || 'N/A',
          stock.quantity || 0,
          stock.storageLocation?.name || 'N/A',
          stock.updatedAt ? new Date(stock.updatedAt).toLocaleDateString() : 'N/A',
          status,
          item.description || 'N/A'
        ]);
      }
    });

    // Add summary section
    excelData.push([]); // Empty row
    excelData.push(['Summary Report', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Total Items', items.length, '', '', '', '', '', '', '', '']);
    excelData.push(['Total Stock Quantity', stocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0), '', '', '', '', '', '', '', '']);
    excelData.push(['Out of Stock Items', stocks.filter(stock => stock.quantity === 0).length, '', '', '', '', '', '', '', '']);
    excelData.push(['Low Stock Items (< 10)', stocks.filter(stock => stock.quantity > 0 && stock.quantity < 10).length, '', '', '', '', '', '', '', '']);
    excelData.push(['Report Generated', new Date().toLocaleString(), '', '', '', '', '', '', '', '']);

    return excelData;
  }

  private prepareTimeBasedReportForExcel(data: any[], period: string): any[] {
    const excelData = [];
    
    // Add header row
    excelData.push([
      'Date',
      'Stock Additions',
      'Cumulative Total',
      'Period',
      'Report Generated'
    ]);

    // Add data rows with cumulative totals
    let cumulativeTotal = 0;
    data.forEach(item => {
      cumulativeTotal += item.stockCount || 0;
      excelData.push([
        new Date(item.date).toLocaleDateString(),
        item.stockCount || 0,
        cumulativeTotal,
        period,
        new Date().toLocaleDateString()
      ]);
    });

    // Add summary section
    const totalAdditions = data.reduce((sum, item) => sum + (item.stockCount || 0), 0);
    const averageAdditions = data.length > 0 ? totalAdditions / data.length : 0;
    const maxDailyAddition = Math.max(...data.map(item => item.stockCount || 0));
    const minDailyAddition = Math.min(...data.map(item => item.stockCount || 0));
    
    excelData.push([]); // Empty row
    excelData.push(['Summary Statistics', '', '', '', '']);
    excelData.push(['Total Additions', totalAdditions, '', period, '']);
    excelData.push(['Average Daily Additions', Math.round(averageAdditions), '', period, '']);
    excelData.push(['Maximum Daily Addition', maxDailyAddition, '', period, '']);
    excelData.push(['Minimum Daily Addition', minDailyAddition, '', period, '']);
    excelData.push(['Number of Days with Data', data.length, '', period, '']);
    excelData.push(['Report Period', period, '', '', '']);
    excelData.push(['Report Generated', new Date().toLocaleString(), '', '', '']);

    return excelData;
  }

  private preparePCListForExcel(pcs: any[], components: any[]): any[] {
    const excelData = [];
    
    // Add header row
    excelData.push([
      'PC ID',
      'PC Name',
      'Serial Number',
      'Location',
      'Status',
      'Assigned To',
      'Total Components',
      'Working Components',
      'Maintenance Components',
      'Not Working Components',
      'Missing Components',
      'Created Date',
      'Last Updated'
    ]);

    // Group components by PC
    const pcComponentsMap = new Map<number, any[]>();
    components.forEach(component => {
      if (!pcComponentsMap.has(component.pcId)) {
        pcComponentsMap.set(component.pcId, []);
      }
      pcComponentsMap.get(component.pcId)!.push(component);
    });

    // Add data rows
    pcs.forEach(pc => {
      const pcComponents = pcComponentsMap.get(pc.id) || [];
      const workingCount = pcComponents.filter(comp => comp.status === 'Working').length;
      const maintenanceCount = pcComponents.filter(comp => comp.status === 'Maintenance').length;
      const notWorkingCount = pcComponents.filter(comp => comp.status === 'Not Working').length;
      const missingCount = pcComponents.filter(comp => comp.status === 'Missing').length;
      
      excelData.push([
        pc.id,
        pc.name,
        pc.serialNumber || 'N/A',
        pc.roomLocation?.name || 'N/A',
        pc.status,
        pc.assignedTo || 'N/A',
        pcComponents.length,
        workingCount,
        maintenanceCount,
        notWorkingCount,
        missingCount,
        pc.createdAt ? new Date(pc.createdAt).toLocaleDateString() : 'N/A',
        pc.updatedAt ? new Date(pc.updatedAt).toLocaleDateString() : 'N/A'
      ]);
    });

    // Add summary section
    excelData.push([]); // Empty row
    excelData.push(['Summary Report', '', '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Total PCs', pcs.length, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Active PCs', pcs.filter(pc => pc.status === 'Active').length, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Maintenance PCs', pcs.filter(pc => pc.status === 'Maintenance').length, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Inactive PCs', pcs.filter(pc => pc.status === 'Inactive').length, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Retired PCs', pcs.filter(pc => pc.status === 'Retired').length, '', '', '', '', '', '', '', '', '', '', '']);
    excelData.push(['Report Generated', new Date().toLocaleString(), '', '', '', '', '', '', '', '', '', '', '']);

    return excelData;
  }

  private createWordHTMLContent(data: any[], period: string): string {
    const totalAdditions = data.reduce((sum, item) => sum + (item.stockCount || 0), 0);
    const averageAdditions = data.length > 0 ? totalAdditions / data.length : 0;
    const maxDailyAddition = Math.max(...data.map(item => item.stockCount || 0));
    const minDailyAddition = Math.min(...data.map(item => item.stockCount || 0));

    let tableRows = '';
    let cumulativeTotal = 0;
    
    data.forEach(item => {
      cumulativeTotal += item.stockCount || 0;
      tableRows += `
        <tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.stockCount || 0}</td>
          <td>${cumulativeTotal}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Stock Additions Report - ${period}</title>
        <style>
          body { font-family: 'Calibri', sans-serif; margin: 40px; }
          h1 { color: #2b579a; text-align: center; font-size: 24px; margin-bottom: 30px; }
          h2 { color: #2b579a; font-size: 18px; margin-top: 30px; margin-bottom: 15px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { margin: 20px 0; }
          .summary p { margin: 8px 0; }
        </style>
      </head>
      <body>
        <h1>Stock Additions Report - ${period}</h1>
        
        <div class="summary">
          <p><strong>Report Period:</strong> ${period}</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <h2>Summary Statistics</h2>
        <div class="summary">
          <p><strong>Total Additions:</strong> ${totalAdditions} units</p>
          <p><strong>Average Daily Additions:</strong> ${Math.round(averageAdditions)} units</p>
          <p><strong>Maximum Daily Addition:</strong> ${maxDailyAddition} units</p>
          <p><strong>Minimum Daily Addition:</strong> ${minDailyAddition} units</p>
          <p><strong>Number of Days with Data:</strong> ${data.length}</p>
        </div>

        ${data.length > 0 ? `
          <h2>Daily Stock Additions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Stock Additions</th>
                <th>Cumulative Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        ` : '<p>No data available for the selected period.</p>'}

        <h2>Analysis</h2>
        <p>This ${period.toLowerCase()} report shows the stock additions over the specified period. The data indicates the daily flow of inventory into the system, with a total of ${totalAdditions} units added during this timeframe.</p>
        <p>The average daily addition of ${Math.round(averageAdditions)} units suggests a ${averageAdditions > 10 ? 'high' : averageAdditions > 5 ? 'moderate' : 'low'} level of inventory activity.</p>
      </body>
      </html>
    `;

    return htmlContent;
  }

  private createPCAnalysisWordContent(data: any[], period: string): string {
    const totalPCs = data.length;
    const activePCs = data.filter(item => item.pc.status === 'Active').length;
    const maintenancePCs = data.filter(item => item.pc.status === 'Maintenance').length;
    const inactivePCs = data.filter(item => item.pc.status === 'Inactive').length;
    const retiredPCs = data.filter(item => item.pc.status === 'Retired').length;

    let pcTableRows = '';
    let maintenanceTableRows = '';
    
    data.forEach(item => {
      const pc = item.pc;
      pcTableRows += `
        <tr>
          <td>${pc.name}</td>
          <td>${pc.roomLocation?.name || 'N/A'}</td>
          <td>${pc.status}</td>
          <td>${item.totalComponents}</td>
          <td>${item.workingCount}</td>
          <td>${item.maintenanceCount}</td>
          <td>${item.notWorkingCount}</td>
          <td>${item.missingCount}</td>
        </tr>
      `;

      // Add maintenance components details
      if (item.maintenanceComponents.length > 0) {
        item.maintenanceComponents.forEach(comp => {
          maintenanceTableRows += `
            <tr>
              <td>${pc.name}</td>
              <td>${comp.item?.name || 'N/A'}</td>
              <td>${comp.status}</td>
              <td>${comp.remarks || 'N/A'}</td>
              <td>${comp.updatedAt ? new Date(comp.updatedAt).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `;
        });
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>PC Analysis Report - ${period}</title>
        <style>
          body { font-family: 'Calibri', sans-serif; margin: 40px; }
          h1 { color: #2b579a; text-align: center; font-size: 24px; margin-bottom: 30px; }
          h2 { color: #2b579a; font-size: 18px; margin-top: 30px; margin-bottom: 15px; }
          h3 { color: #2b579a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary { margin: 20px 0; }
          .summary p { margin: 8px 0; }
          .status-active { color: #28a745; font-weight: bold; }
          .status-maintenance { color: #ffc107; font-weight: bold; }
          .status-inactive { color: #6c757d; font-weight: bold; }
          .status-retired { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>PC Analysis Report - ${period}</h1>
        
        <div class="summary">
          <p><strong>Report Period:</strong> ${period}</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <h2>Summary Statistics</h2>
        <div class="summary">
          <p><strong>Total PCs in Period:</strong> ${totalPCs}</p>
          <p><strong>Active PCs:</strong> ${activePCs}</p>
          <p><strong>PCs Under Maintenance:</strong> ${maintenancePCs}</p>
          <p><strong>Inactive PCs:</strong> ${inactivePCs}</p>
          <p><strong>Retired PCs:</strong> ${retiredPCs}</p>
        </div>

        <h2>PC Analysis</h2>
        <table>
          <thead>
            <tr>
              <th>PC Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Total Components</th>
              <th>Working</th>
              <th>Maintenance</th>
              <th>Not Working</th>
              <th>Missing</th>
            </tr>
          </thead>
          <tbody>
            ${pcTableRows}
          </tbody>
        </table>

        ${maintenanceTableRows ? `
          <h2>Maintenance Components Details</h2>
          <table>
            <thead>
              <tr>
                <th>PC Name</th>
                <th>Component</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${maintenanceTableRows}
            </tbody>
          </table>
        ` : '<p>No components under maintenance in this period.</p>'}

        <h2>Analysis</h2>
        <p>This ${period.toLowerCase()} PC analysis report provides a comprehensive overview of computer systems in the inventory. The data shows the distribution of PCs across different locations and their current operational status.</p>
        <p>Maintenance tracking is crucial for ensuring optimal system performance and identifying components that require attention or replacement.</p>
      </body>
      </html>
    `;

    return htmlContent;
  }

  private exportToExcel(data: any[], filename: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    // Auto-size columns
    const colWidths = data[0].map((col: string, index: number) => {
      const maxLength = Math.max(...data.map(row => String(row[index] || '').length));
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    ws['!cols'] = colWidths;
    
    // Save the file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  private exportToWord(data: any[], period: string, filename: string): void {
    let htmlContent: string;
    
    // Check if this is PC analysis data (has pc property) or stock data
    if (data.length > 0 && data[0].pc) {
      htmlContent = this.createPCAnalysisWordContent(data, period);
    } else {
      htmlContent = this.createWordHTMLContent(data, period);
    }
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '_');
  }
}