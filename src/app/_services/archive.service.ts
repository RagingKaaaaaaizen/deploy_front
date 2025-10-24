import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';
import { jsPDF } from 'jspdf';

const baseUrl = `${environment.apiUrl}/api/analytics`;

export interface ReportData {
  stocks: any[];
  disposals: any[];
  pcs: any[];
  summary: {
    totalStocks: number;
    totalDisposals: number;
    totalPCs: number;
    totalValue: number;
    stockValue: number;
    disposalValue: number;
    pcValue: number;
    averageStockValue: number;
    averageDisposalValue: number;
    stockCategories: { [key: string]: number };
    disposalReasons: { [key: string]: number };
    pcStatuses: { [key: string]: number };
    topItems: any[];
    topLocations: any[];
  };
  metadata: {
    generatedBy: string;
    generationTime: Date;
    dataSource: string;
    filters: any;
    includeStocks?: boolean;
    includeDisposals?: boolean;
    includePCs?: boolean;
    includeDetailedAnalysis?: boolean;
  };
}

export interface ReportRequest {
  type: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  includeStocks: boolean;
  includeDisposals: boolean;
  includePCs: boolean;
  detailedAnalysis: boolean;
}

export interface StoredReport {
  id: string;
  type: 'weekly' | 'monthly';
  title: string;
  generatedDate: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalStocks: number;
    totalDisposals: number;
    totalPCs: number;
    totalValue: number;
    stockValue: number;
    disposalValue: number;
    pcValue: number;
    averageStockValue: number;
    averageDisposalValue: number;
    stockCategories: { [key: string]: number };
    disposalReasons: { [key: string]: number };
    pcStatuses: { [key: string]: number };
    topItems: any[];
    topLocations: any[];
  };
  data: ReportData;
  fileName: string;
  weekNumber?: number;
  monthYear?: string;
  metadata: {
    generatedBy: string;
    generationTime: Date;
    dataSource: string;
    filters: any;
    version: string;
    includeStocks?: boolean;
    includeDisposals?: boolean;
    includePCs?: boolean;
    includeDetailedAnalysis?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private storedReports = new BehaviorSubject<StoredReport[]>([]);
  public storedReports$ = this.storedReports.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredReports();
  }

  private loadStoredReports(): void {
    const stored = localStorage.getItem('inventory_reports');
    if (stored) {
      try {
        const reports: StoredReport[] = JSON.parse(stored);
        reports.forEach(report => {
          report.generatedDate = new Date(report.generatedDate);
          report.period.startDate = new Date(report.period.startDate);
          report.period.endDate = new Date(report.period.endDate);
          if (report.metadata?.generationTime) {
            report.metadata.generationTime = new Date(report.metadata.generationTime);
          }
        });
        this.storedReports.next(reports);
      } catch (error) {
        console.error('Error loading stored reports:', error);
        this.storedReports.next([]);
      }
    }
  }

  private saveStoredReports(reports: StoredReport[]): void {
    localStorage.setItem('inventory_reports', JSON.stringify(reports));
    this.storedReports.next(reports);
  }

  generateReport(request: ReportRequest): Observable<ReportData> {
    return this.http.post<ReportData>(`${baseUrl}/generate-report`, request);
  }

  // Enhanced Analytics Methods
  getTopUsedCategories(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/top-categories?limit=${limit}`);
  }

  getMostReplacedComponents(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/most-replaced-components?limit=${limit}`);
  }

  getAdvancedAnalytics(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/advanced-analytics`);
  }

  getAutomatedReportSchedule(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/automated-schedule`);
  }

  setAutomatedReportSchedule(schedule: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/automated-schedule`, schedule);
  }

  getStoredReports(): StoredReport[] {
    return this.storedReports.value;
  }

  getStoredReportById(id: string): StoredReport | undefined {
    return this.storedReports.value.find(report => report.id === id);
  }

  deleteStoredReport(id: string): void {
    const currentReports = this.storedReports.value;
    const updatedReports = currentReports.filter(report => report.id !== id);
    this.saveStoredReports(updatedReports);
  }

  // ===== NEW CLEAN PDF GENERATION =====
  generatePDFBlob(reportData: ReportData, reportType: string, startDate?: Date, endDate?: Date, includeStocks: boolean = true, includeDisposals: boolean = true, includePCs: boolean = true, includeDetailedAnalysis: boolean = false): Blob {
    console.log('=== GENERATING NEW FORMAT PDF ===');
    console.log('Report Data:', reportData);
    console.log('Report Type:', reportType);
    console.log('Date Range:', startDate, endDate);
    
    try {
      // Create PDF in LANDSCAPE orientation
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Set Times New Roman font
      doc.setFont('times', 'normal');
    
    // Filter data by date range
    let filteredStocks = includeStocks ? reportData.stocks : [];
    let filteredDisposals = includeDisposals ? reportData.disposals : [];
    let filteredPCs = includePCs ? reportData.pcs : []; // PCs show ALL TIME (no date filtering)
    
    if (startDate && endDate) {
      if (includeStocks) {
        filteredStocks = reportData.stocks.filter(stock => {
          const stockDate = new Date(stock.createdAt || stock.updatedAt);
          return stockDate >= startDate && stockDate <= endDate;
        });
      }
      
      if (includeDisposals) {
        filteredDisposals = reportData.disposals.filter(disposal => {
          const disposalDate = new Date(disposal.disposalDate || disposal.createdAt);
          return disposalDate >= startDate && disposalDate <= endDate;
        });
      }
      
      // PC Management: NO DATE FILTERING - show all PCs all time
      // PCs are not filtered by date - we want to see all PCs regardless of when they were added
    }
    
    // Filter out stocks with quantity 0
    filteredStocks = filteredStocks.filter(stock => (stock.quantity || 0) > 0);
    
    // Add header
    this.addHeader(doc, reportType, startDate, endDate);
    
    // Add summary section
    let yPos = this.addSummary(doc, filteredStocks, filteredDisposals, filteredPCs);
    
    // Add stocks report
    if (includeStocks && filteredStocks.length > 0) {
      yPos = this.addStocksReport(doc, filteredStocks, yPos);
    }
    
    // Add dispose report
    if (includeDisposals && filteredDisposals.length > 0) {
      yPos = this.addDisposeReport(doc, filteredDisposals, yPos);
    }
    
    // Add PC report
    if (includePCs && filteredPCs.length > 0) {
      yPos = this.addPCReport(doc, filteredPCs, yPos);
    }
    
      // Add footer
      this.addFooter(doc);
      
      console.log('PDF generated successfully');
      return doc.output('blob');
    } catch (error) {
      console.error('ERROR GENERATING PDF:', error);
      console.error('Error details:', error.message, error.stack);
      throw error;
    }
  }

  // HEADER SECTION
  private addHeader(doc: jsPDF, reportType: string, startDate?: Date, endDate?: Date): void {
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Line 1: Benedicto College Computer Lab Inventory System
    doc.setFontSize(16);
    doc.text('Benedicto College Computer Lab Inventory System', 148.5, 15, { align: 'center' });
    
    // Line 2: Report Type (Weekly or Monthly)
    doc.setFontSize(13);
    const reportTitle = reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
    doc.text(reportTitle, 148.5, 23, { align: 'center' });
    
    // Line 3: What week or monthly that data gets
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    if (startDate && endDate) {
      const startStr = startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      doc.text(`Report Period: ${startStr} - ${endStr}`, 148.5, 30, { align: 'center' });
    } else {
      doc.text('Report Period: All Time', 148.5, 30, { align: 'center' });
    }
    
    // Line 4: What day that the report generate
    const now = new Date();
    const generatedDate = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const generatedTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    doc.setFontSize(10);
    doc.text(`Generated on: ${generatedDate} at ${generatedTime}`, 148.5, 36, { align: 'center' });
    
    // Draw separator line
    doc.setLineWidth(0.5);
    doc.line(20, 40, 277, 40);
  }

  // SUMMARY SECTION
  private addSummary(doc: jsPDF, stocks: any[], disposals: any[], pcs: any[]): number {
    let y = 48;
    
    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('SUMMARY', 20, y);
    y += 10;
    
    // Calculate totals
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    const totalStocks = stocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const stockValue = stocks.reduce((sum, stock) => sum + (stock.totalPrice || stock.price * stock.quantity || 0), 0);
    const totalDispose = disposals.reduce((sum, disposal) => sum + (disposal.quantity || 0), 0);
    // Use totalValue (not disposalValue) for dispose value summary
    const disposeValue = disposals.reduce((sum, disposal) => {
      const value = typeof disposal.totalValue === 'number' ? disposal.totalValue : 0;
      console.log(`Disposal ${disposal.itemName || 'Unknown'}: adding ${value} to total`);
      return sum + value;
    }, 0);
    const totalPC = pcs.length;
    
    console.log('Summary calculations:', {
      totalStocks,
      stockValue,
      totalDispose,
      disposeValue,
      totalPC
    });
    
    // Safe number formatting
    const safeStockValue = typeof stockValue === 'number' && !isNaN(stockValue) ? stockValue : 0;
    const safeDisposeValue = typeof disposeValue === 'number' && !isNaN(disposeValue) ? disposeValue : 0;
    
    // Two-column layout - NO OVERLAPPING
    const leftCol = 20;
    const rightCol = 165;
    
    // Left column
    doc.text('Total Stocks: ' + totalStocks, leftCol, y);
    doc.text('Stock Value: PHP ' + safeStockValue.toFixed(2), leftCol, y + 6);
    doc.text('Total PC: ' + totalPC, leftCol, y + 12);
    
    // Right column
    doc.text('Total Dispose: ' + totalDispose, rightCol, y);
    doc.text('Dispose Value: PHP ' + safeDisposeValue.toFixed(2), rightCol, y + 6);
    
    y += 20;
    
    // Draw separator line
    doc.setLineWidth(0.5);
    doc.line(20, y, 277, y);
    
    return y + 8;
  }

  // STOCKS REPORT TABLE
  private addStocksReport(doc: jsPDF, stocks: any[], startY: number): number {
    let y = startY;
    
    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('STOCKS REPORT', 20, y);
    y += 8;
    
    // Table setup - LANDSCAPE FORMAT
    const colWidths = [65, 45, 30, 35, 35, 47]; // Item, Category, Quantity, Price, Total, Date/Time
    const rowHeight = 7;
    let x = 20;
    
    // Table header background
    doc.setFillColor(220, 220, 220);
    doc.rect(20, y - 4, 257, rowHeight, 'F');
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Item', x, y);
    x += colWidths[0];
    doc.text('Category', x, y);
    x += colWidths[1];
    doc.text('Quantity', x, y);
    x += colWidths[2];
    doc.text('Price', x, y);
    x += colWidths[3];
    doc.text('Total', x, y);
    x += colWidths[4];
    doc.text('Date/Time', x, y);
    
    y += rowHeight;
    
    // Table data
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    
    stocks.forEach((stock, index) => {
      if (y > 185) {
          doc.addPage();
        this.addHeader(doc, '', undefined, undefined);
        y = 50;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 4, 257, rowHeight, 'F');
      }
      
      x = 20;
      doc.text((stock.itemName || 'N/A').substring(0, 28), x, y);
      x += colWidths[0];
      doc.text((stock.categoryName || 'N/A').substring(0, 18), x, y);
      x += colWidths[1];
      doc.text(String(stock.quantity || 0), x, y);
      x += colWidths[2];
      
      // Safe price formatting - use PHP for easier display
      const price = typeof stock.price === 'number' ? stock.price : 0;
      doc.text('PHP ' + price.toFixed(2), x, y);
      x += colWidths[3];
      
      // Safe total formatting - use PHP for easier display
      const total = typeof stock.totalPrice === 'number' ? stock.totalPrice : 
                    (typeof stock.price === 'number' && typeof stock.quantity === 'number' ? 
                    stock.price * stock.quantity : 0);
      const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
      doc.text('PHP ' + safeTotal.toFixed(2), x, y);
      x += colWidths[4];
      
      // Date/Time formatting
      const dateTime = stock.createdAt ? 
        new Date(stock.createdAt).toLocaleString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'N/A';
      doc.text(dateTime, x, y);
      
      y += rowHeight;
    });
    
    y += 6;
    
    // Draw separator line
    doc.setLineWidth(0.5);
    doc.line(20, y, 277, y);
    
    return y + 8;
  }

  // DISPOSE REPORT TABLE
  private addDisposeReport(doc: jsPDF, disposals: any[], startY: number): number {
    let y = startY;
    
    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('DISPOSE REPORT', 20, y);
    y += 8;
    
    // Table setup - LANDSCAPE FORMAT
    const colWidths = [65, 45, 30, 35, 35, 47]; // Item, Category, Quantity, Price, Total, Date/Time
    const rowHeight = 7;
    let x = 20;
    
    // Table header background
    doc.setFillColor(220, 220, 220);
    doc.rect(20, y - 4, 257, rowHeight, 'F');
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('Item', x, y);
    x += colWidths[0];
    doc.text('Category', x, y);
    x += colWidths[1];
    doc.text('Quantity', x, y);
    x += colWidths[2];
    doc.text('Price', x, y);
    x += colWidths[3];
    doc.text('Total', x, y);
    x += colWidths[4];
    doc.text('Date/Time', x, y);
    
    y += rowHeight;
    
    // Table data
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    
    disposals.forEach((disposal, index) => {
      if (y > 185) {
        doc.addPage();
        this.addHeader(doc, '', undefined, undefined);
        y = 50;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 4, 257, rowHeight, 'F');
      }
      
      x = 20;
      doc.text((disposal.itemName || 'N/A').substring(0, 28), x, y);
      x += colWidths[0];
      doc.text((disposal.categoryName || 'N/A').substring(0, 18), x, y);
      x += colWidths[1];
      doc.text(String(disposal.quantity || 0), x, y);
      x += colWidths[2];
      
      // Safe price formatting - use PHP for easier display
      // Use price field from backend (already calculated)
      const unitPrice = typeof disposal.price === 'number' ? disposal.price :
                        (typeof disposal.disposalValue === 'number' ? disposal.disposalValue : 0);
      console.log(`Disposal ${disposal.itemName}: price=${disposal.price}, disposalValue=${disposal.disposalValue}, totalValue=${disposal.totalValue}`);
      doc.text('PHP ' + unitPrice.toFixed(2), x, y);
      x += colWidths[3];
      
      // Safe total formatting - use PHP for easier display
      // Use totalValue from backend (already calculated)
      const total = typeof disposal.totalValue === 'number' ? disposal.totalValue : 0;
      const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
      console.log(`Disposal ${disposal.itemName}: calculated total=${safeTotal}`);
      doc.text('PHP ' + safeTotal.toFixed(2), x, y);
      x += colWidths[4];
      
      // Date/Time formatting
      const dateTime = disposal.disposalDate ? 
        new Date(disposal.disposalDate).toLocaleString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : 'N/A';
      doc.text(dateTime, x, y);
      
      y += rowHeight;
    });
    
    y += 6;
    
    // Draw separator line
    doc.setLineWidth(0.5);
    doc.line(20, y, 277, y);
    
    return y + 8;
  }

  // PC REPORTS TABLE WITH SUB-REPORTS
  private addPCReport(doc: jsPDF, pcs: any[], startY: number): number {
    let y = startY;
    
    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('PC REPORTS', 20, y);
    y += 8;
    
    // Main PC table setup (PC Name | Status | Number of Components)
    const mainColWidths = [85, 60, 92];
    const rowHeight = 7;
    let x = 20;
    
    // Table header background
    doc.setFillColor(220, 220, 220);
    doc.rect(20, y - 4, 237, rowHeight, 'F');
    
    // Table headers
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('PC Name', x, y);
    x += mainColWidths[0];
    doc.text('Status', x, y);
    x += mainColWidths[1];
    doc.text('Number of Components', x, y);
    
    y += rowHeight;
    
    // Table data
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    
    // If no PCs, show a clear message for the section
    if (!pcs || pcs.length === 0) {
      y += 6;
      doc.setFont('times', 'italic');
      doc.text('No PC Management records available.', 20, y);
      return y + 8;
    }
    
    pcs.forEach((pc, pcIndex) => {
      if (y > 185) {
          doc.addPage();
        this.addHeader(doc, '', undefined, undefined);
        y = 50;
      }
      
      // Alternating row colors
      if (pcIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 4, 237, rowHeight, 'F');
      }
      
      x = 20;
      doc.text((pc.name || 'N/A').substring(0, 36), x, y);
      x += mainColWidths[0];
      doc.text((pc.status || 'N/A').substring(0, 25), x, y);
      x += mainColWidths[1];
      const componentCount = pc.components ? pc.components.length : 0;
      doc.text(componentCount + ' components', x, y);
      
      y += rowHeight;
      
      // SUB-REPORT: Components inside this PC
      if (pc.components && pc.components.length > 0) {
        // If approaching page end, create new page before printing sub-report to avoid truncation
        if (y > 170) {
        doc.addPage();
          this.addHeader(doc, '', undefined, undefined);
          y = 50;
        }
        y += 3;
        
        // Sub-report title
      doc.setFontSize(8);
        doc.setFont('times', 'italic');
        doc.text('Components:', 30, y);
        y += 5;
        
        // Component table headers
        doc.setFont('times', 'bold');
      doc.setFontSize(8);
        const compColWidths = [55, 20, 25, 25, 30]; // Item, Quantity, Price, Total, Status
        let cx = 35;
        
        doc.setFillColor(235, 235, 235);
        doc.rect(35, y - 3, 200, 5, 'F');
        
        doc.text('Item', cx, y);
        cx += compColWidths[0];
        doc.text('Quantity', cx, y);
        cx += compColWidths[1];
        doc.text('Price', cx, y);
        cx += compColWidths[2];
        doc.text('Total', cx, y);
        cx += compColWidths[3];
        doc.text('Status', cx, y);
        
        y += 5;
        
        // Component data
        doc.setFont('times', 'normal');
        doc.setFontSize(7);
        
        pc.components.forEach((comp: any, compIndex: number) => {
          if (y > 190) {
            // New page for remaining components of this PC
          doc.addPage();
            this.addHeader(doc, '', undefined, undefined);
            y = 50;
            // Reprint subheader for continuity on new page
            doc.setFont('times', 'italic');
            doc.setFontSize(8);
            doc.text('Components:', 30, y);
            y += 5;
            doc.setFont('times', 'bold');
            doc.setFontSize(8);
            const compColWidths = [55, 20, 25, 25, 30];
            let cx = 35;
            doc.setFillColor(235, 235, 235);
            doc.rect(35, y - 3, 200, 5, 'F');
            doc.text('Item', cx, y);
            cx += compColWidths[0];
            doc.text('Quantity', cx, y);
            cx += compColWidths[1];
            doc.text('Price', cx, y);
            cx += compColWidths[2];
            doc.text('Total', cx, y);
            cx += compColWidths[3];
            doc.text('Status', cx, y);
            y += 5;
            // restore normal font
            doc.setFont('times', 'normal');
            doc.setFontSize(7);
          }
          
          // Alternating component rows
          if (compIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(35, y - 3, 200, 4.5, 'F');
          }
          
          cx = 35;
          doc.text((comp.itemName || 'N/A').substring(0, 24), cx, y);
          cx += compColWidths[0];
          doc.text(String(comp.quantity || 1), cx, y);
          cx += compColWidths[1];
          
          // Safe price formatting - use PHP for easier display
          const compPrice = typeof comp.price === 'number' ? comp.price : Number(comp.price) || 0;
          doc.text('PHP ' + compPrice.toFixed(2), cx, y);
          cx += compColWidths[2];
          
          // Safe total formatting - use PHP for easier display
          const compTotal = (compPrice) * (comp.quantity || 1);
          const safeCompTotal = typeof compTotal === 'number' && !isNaN(compTotal) ? compTotal : 0;
          doc.text('PHP ' + safeCompTotal.toFixed(2), cx, y);
          cx += compColWidths[3];
          doc.text((comp.status || 'Active').substring(0, 12), cx, y);
          
          y += 4.5;
        });
        
        y += 4;
      }
      
      // Draw separator line after each PC
      doc.setLineWidth(0.3);
      doc.line(20, y + 2, 277, y + 2);
      y += 5;
    });
    
    y += 3;
    
    // Draw final separator line
    doc.setLineWidth(0.5);
    doc.line(20, y, 277, y);
    
    return y + 8;
  }

  // FOOTER SECTION
  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.text('Page ' + i + ' of ' + pageCount, 148.5, 205, { align: 'center' });
    }
  }

  // ===== UTILITY METHODS =====
  
  storeReport(reportData: ReportData, reportType: 'weekly' | 'monthly', startDate: Date, endDate: Date, inclusionSettings?: { includeStocks?: boolean; includeDisposals?: boolean; includePCs?: boolean; includeDetailedAnalysis?: boolean }): StoredReport {
    const weekNumber = this.getWeekNumber(startDate);
    const monthYear = this.getMonthYear(startDate);
    
    const includeStocks = inclusionSettings?.includeStocks ?? true;
    const includeDisposals = inclusionSettings?.includeDisposals ?? true;
    const includePCs = inclusionSettings?.includePCs ?? true;
    
    let filteredStocks = includeStocks ? reportData.stocks : [];
    let filteredDisposals = includeDisposals ? reportData.disposals : [];
    let filteredPCs = includePCs ? reportData.pcs : [];
    
    if (startDate && endDate) {
      if (includeStocks) {
        filteredStocks = reportData.stocks.filter(stock => {
          const stockDate = new Date(stock.createdAt || stock.updatedAt);
          return stockDate >= startDate && stockDate <= endDate;
        });
      }
      
      if (includeDisposals) {
        filteredDisposals = reportData.disposals.filter(disposal => {
          const disposalDate = new Date(disposal.disposalDate || disposal.createdAt);
          return disposalDate >= startDate && disposalDate <= endDate;
        });
      }
      
      // PC Management: NO DATE FILTERING - Always include all PCs regardless of date
      if (includePCs) {
        filteredPCs = reportData.pcs;
      }
    }
    
    const totalStocks = filteredStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const totalDisposals = filteredDisposals.reduce((sum, disposal) => sum + (disposal.quantity || 0), 0);
    const totalPCs = filteredPCs.length;
    
    const stockValue = filteredStocks.reduce((sum, stock) => 
      sum + (stock.totalPrice || stock.price * stock.quantity || 0), 0);
    const disposalValue = filteredDisposals.reduce((sum, disposal) => 
      sum + (disposal.disposalValue || disposal.totalValue || 0), 0);
    const pcValue = filteredPCs.reduce((sum, pc) => 
      sum + (pc.totalValue || pc.value || 0), 0);
    const totalValue = stockValue + disposalValue + pcValue;
    
    const filteredSummary = {
      totalStocks,
      totalDisposals,
      totalPCs,
      totalValue,
      stockValue,
      disposalValue,
      pcValue,
      averageStockValue: totalStocks > 0 ? stockValue / totalStocks : 0,
      averageDisposalValue: totalDisposals > 0 ? disposalValue / totalDisposals : 0,
      stockCategories: {},
      disposalReasons: {},
      pcStatuses: {},
      topItems: [],
      topLocations: []
    };
    
    const report: StoredReport = {
      id: this.generateReportId(),
      type: reportType,
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generatedDate: new Date(),
      period: {
        startDate: startDate,
        endDate: endDate
      },
      summary: filteredSummary,
      data: reportData,
      fileName: `inventory-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`,
      weekNumber: reportType === 'weekly' ? weekNumber : undefined,
      monthYear: reportType === 'monthly' ? monthYear : undefined,
      metadata: {
        generatedBy: 'System User',
        generationTime: new Date(),
        dataSource: 'Computer Lab Inventory System',
        filters: {
          includeStocks: includeStocks,
          includeDisposals: includeDisposals,
          includePCs: includePCs,
          detailedAnalysis: inclusionSettings?.includeDetailedAnalysis ?? true
        },
        version: '2.0.0',
        includeStocks: includeStocks,
        includeDisposals: includeDisposals,
        includePCs: includePCs,
        includeDetailedAnalysis: inclusionSettings?.includeDetailedAnalysis ?? true
      }
    };

    const currentReports = this.storedReports.value;
    const updatedReports = [report, ...currentReports].slice(0, 50);
    this.saveStoredReports(updatedReports);

    return report;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getMonthYear(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  downloadPDF(reportData: ReportData, reportType: string, startDate?: Date, endDate?: Date, includeStocks: boolean = true, includeDisposals: boolean = true, includePCs: boolean = true, includeDetailedAnalysis: boolean = false): void {
    try {
      const blob = this.generatePDFBlob(reportData, reportType, startDate, endDate, includeStocks, includeDisposals, includePCs, includeDetailedAnalysis);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF for download:', error);
      alert('Error generating PDF download. Please check the console for details.');
    }
  }

  downloadStoredReportPDF(report: StoredReport): void {
    try {
      const includeStocks = report.metadata?.includeStocks !== false;
      const includeDisposals = report.metadata?.includeDisposals !== false;
      const includePCs = report.metadata?.includePCs !== false;
      const includeDetailedAnalysis = report.metadata?.includeDetailedAnalysis === true;
      
      this.downloadPDF(report.data, report.type, report.period.startDate, report.period.endDate, includeStocks, includeDisposals, includePCs, includeDetailedAnalysis);
    } catch (error) {
      console.error('Error generating PDF for download:', error);
      alert('Error generating PDF download. Please check the console for details.');
    }
  }

  previewPDF(report: StoredReport): void {
    try {
      const includeStocks = report.metadata?.includeStocks !== false;
      const includeDisposals = report.metadata?.includeDisposals !== false;
      const includePCs = report.metadata?.includePCs !== false;
      const includeDetailedAnalysis = report.metadata?.includeDetailedAnalysis === true;
      
      const blob = this.generatePDFBlob(report.data, report.type, report.period.startDate, report.period.endDate, includeStocks, includeDisposals, includePCs, includeDetailedAnalysis);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating PDF for preview:', error);
      alert('Error generating PDF preview. Please check the console for details.');
    }
  }

  getWeeklyReportData(): Observable<ReportData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    const request: ReportRequest = {
      type: 'weekly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeStocks: true,
      includeDisposals: true,
      includePCs: true,
      detailedAnalysis: true
    };
    
    return this.generateReport(request);
  }

  getMonthlyReportData(): Observable<ReportData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    
    const request: ReportRequest = {
      type: 'monthly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeStocks: true,
      includeDisposals: true,
      includePCs: true,
      detailedAnalysis: true
    };
    
    return this.generateReport(request);
  }

  getReportsByType(type: 'weekly' | 'monthly'): StoredReport[] {
    return this.storedReports.value.filter(report => report.type === type);
  }

  getRecentReports(limit: number = 10): StoredReport[] {
    return this.storedReports.value.slice(0, limit);
  }

  searchReports(query: string): StoredReport[] {
    const searchTerm = query.toLowerCase();
    return this.storedReports.value.filter(report => 
      report.title.toLowerCase().includes(searchTerm) ||
      report.type.toLowerCase().includes(searchTerm) ||
      (report.weekNumber && report.weekNumber.toString().includes(searchTerm)) ||
      (report.monthYear && report.monthYear.toLowerCase().includes(searchTerm))
    );
  }

  getAvailableWeeks(): { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }[] {
    const weeklyReports = this.getReportsByType('weekly');
    const weeks: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }[] = [];
    
    for (let i = 0; i < 24; i++) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const weekNumber = this.getWeekNumber(startDate);
      const exists = weeklyReports.some(report => 
        report.period.startDate.getTime() === startDate.getTime() &&
        report.period.endDate.getTime() === endDate.getTime()
      );
      
      weeks.push({ weekNumber, startDate, endDate, exists });
    }
    
    return weeks;
  }

  getAvailableMonths(): { monthYear: string; startDate: Date; endDate: Date; exists: boolean }[] {
    const monthlyReports = this.getReportsByType('monthly');
    const months: { monthYear: string; startDate: Date; endDate: Date; exists: boolean }[] = [];
    
    for (let i = 0; i < 24; i++) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i);
      endDate.setDate(0);
      
      const startDate = new Date(endDate);
      startDate.setDate(1);
      
      const monthYear = this.getMonthYear(startDate);
      const exists = monthlyReports.some(report => 
        report.period.startDate.getTime() === startDate.getTime() &&
        report.period.endDate.getTime() === endDate.getTime()
      );
      
      months.push({ monthYear, startDate, endDate, exists });
    }
    
    return months;
  }

  getReportStatistics(): {
    totalReports: number;
    weeklyReports: number;
    monthlyReports: number;
    totalValue: number;
    averageValue: number;
    mostRecentReport: StoredReport | null;
    oldestReport: StoredReport | null;
  } {
    const reports = this.storedReports.value;
    const weeklyReports = reports.filter(r => r.type === 'weekly').length;
    const monthlyReports = reports.filter(r => r.type === 'monthly').length;
    const totalValue = reports.reduce((sum, report) => sum + report.summary.totalValue, 0);
    const averageValue = reports.length > 0 ? totalValue / reports.length : 0;
    
    const sortedReports = [...reports].sort((a, b) => b.generatedDate.getTime() - a.generatedDate.getTime());
    
    return {
      totalReports: reports.length,
      weeklyReports,
      monthlyReports,
      totalValue,
      averageValue,
      mostRecentReport: sortedReports[0] || null,
      oldestReport: sortedReports[sortedReports.length - 1] || null
    };
  }

  exportAllReports(): string {
    return JSON.stringify(this.storedReports.value, null, 2);
  }

  importReports(jsonData: string): boolean {
    try {
      const reports: StoredReport[] = JSON.parse(jsonData);
      const currentReports = this.storedReports.value;
      const combinedReports = [...reports, ...currentReports];
      
      const uniqueReports = combinedReports.filter((report, index, self) => 
        index === self.findIndex(r => r.id === report.id)
      );
      
      this.saveStoredReports(uniqueReports);
      return true;
    } catch (error) {
      console.error('Error importing reports:', error);
      return false;
    }
  }

  generateCustomReport(type: 'weekly' | 'monthly', startDate: Date, endDate: Date, options: {
    includeStocks: boolean;
    includeDisposals: boolean;
    includePCs: boolean;
    detailedAnalysis?: boolean;
  }): Observable<ReportData> {
    const request: ReportRequest = {
      type,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeStocks: options.includeStocks,
      includeDisposals: options.includeDisposals,
      includePCs: options.includePCs,
      detailedAnalysis: options.detailedAnalysis || true
    };
    
    return this.generateReport(request);
  }

  checkReportExists(type: 'weekly' | 'monthly', startDate: Date, endDate: Date): StoredReport | null {
    const reports = this.storedReports.value;
    return reports.find(report => 
      report.type === type && 
      report.period.startDate.getTime() === startDate.getTime() &&
      report.period.endDate.getTime() === endDate.getTime()
    ) || null;
  }
}

