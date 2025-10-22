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
        // Convert date strings back to Date objects
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

  getAverageComponentLifespan(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/average-lifespan`);
  }

  getComponentReplacementPatterns(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/replacement-patterns`);
  }

  getAdvancedAnalytics(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/advanced-analytics`);
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/pending-requests`);
  }

  getAutomatedReportSchedule(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/automated-schedule`);
  }

  setAutomatedReportSchedule(schedule: any): Observable<any> {
    return this.http.post<any>(`${baseUrl}/automated-schedule`, schedule);
  }

  // Test method to verify analytics API connection
  testAnalyticsConnection(): Observable<any> {
    return this.http.get<any>(`${baseUrl}/test`);
  }

  // Check if report already exists for the given period
  checkReportExists(type: 'weekly' | 'monthly', startDate: Date, endDate: Date): StoredReport | null {
    const reports = this.storedReports.value;
    return reports.find(report => 
      report.type === type && 
      report.period.startDate.getTime() === startDate.getTime() &&
      report.period.endDate.getTime() === endDate.getTime()
    ) || null;
  }

  // Generate custom date range report
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

  storeReport(reportData: ReportData, reportType: 'weekly' | 'monthly', startDate: Date, endDate: Date): StoredReport {
    const weekNumber = this.getWeekNumber(startDate);
    const monthYear = this.getMonthYear(startDate);
    
    const report: StoredReport = {
      id: this.generateReportId(),
      type: reportType,
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generatedDate: new Date(),
      period: {
        startDate: startDate,
        endDate: endDate
      },
      summary: reportData.summary,
      data: reportData,
      fileName: `inventory-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`,
      weekNumber: reportType === 'weekly' ? weekNumber : undefined,
      monthYear: reportType === 'monthly' ? monthYear : undefined,
      metadata: {
        generatedBy: 'System User', // This could be enhanced to get actual user
        generationTime: new Date(),
        dataSource: 'Computer Lab Inventory System',
        filters: {
          includeStocks: true,
          includeDisposals: true,
          includePCs: true,
          detailedAnalysis: true
        },
        version: '2.0.0'
      }
    };

    const currentReports = this.storedReports.value;
    const updatedReports = [report, ...currentReports].slice(0, 50); // Keep only last 50 reports
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

  // Generate PDF and return as blob for preview
  generatePDFBlob(reportData: ReportData, reportType: string): Blob {
    console.log('Generating PDF for report type:', reportType);
    console.log('Report data structure:', reportData);
    console.log('Summary data:', reportData.summary);
    
    // Create PDF in portrait orientation
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Add simple header without logo
    this.addSimpleHeader(doc, reportType);
    
    let yPosition = 50;
    
    // Simple Executive Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    // Use same data as tables to prevent duplicates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Stocks: ${reportData.stocks.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Disposals: ${reportData.disposals.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total PCs: ${reportData.summary.totalPCs}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Value: ₱${(typeof reportData.summary.totalValue === 'number' ? reportData.summary.totalValue.toFixed(2) : '0.00')}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Stock Value: ₱${(typeof reportData.summary.stockValue === 'number' ? reportData.summary.stockValue.toFixed(2) : '0.00')}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Disposal Value: ₱${(typeof reportData.summary.disposalValue === 'number' ? reportData.summary.disposalValue.toFixed(2) : '0.00')}`, 20, yPosition);
    yPosition += 7;
    doc.text(`PC Value: ₱${(typeof reportData.summary.pcValue === 'number' ? reportData.summary.pcValue.toFixed(2) : '0.00')}`, 20, yPosition);
    yPosition += 15;

    // Detailed Analysis section
    if (reportData.summary.stockCategories && Object.keys(reportData.summary.stockCategories).length > 0) {
      doc.setFontSize(14);
      doc.text('Stock Categories Analysis', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(8);
      Object.entries(reportData.summary.stockCategories).forEach(([category, count]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${category}: ${count} items`, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    if (reportData.summary.disposalReasons && Object.keys(reportData.summary.disposalReasons).length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Disposal Reasons Analysis', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(8);
      Object.entries(reportData.summary.disposalReasons).forEach(([reason, count]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${reason}: ${count} items`, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }

    if (reportData.summary.topItems && reportData.summary.topItems.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Top Items by Quantity', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(8);
      reportData.summary.topItems.slice(0, 10).forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${index + 1}. ${item.name}: ${item.quantity} units`, 20, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    // Stocks section - show all stocks without duplicate filtering
    if (reportData.stocks.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Stocks Report', 20, yPosition);
      yPosition += 15;
      
      // Create simple table with all stocks
      this.createStocksTable(doc, reportData.stocks, yPosition);
      yPosition += (Math.ceil(reportData.stocks.length / 8) * 8) + 20; // Calculate space needed
    }
    
    // Disposals section - show all disposals without duplicate filtering
    if (reportData.disposals.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Disposals Report', 20, yPosition);
      yPosition += 15;
      
      // Create simple disposals table with all disposals
      this.createDisposalsTable(doc, reportData.disposals, yPosition);
      yPosition += (Math.ceil(reportData.disposals.length / 8) * 8) + 20;
    }
    
    // PCs section with precise data
    if (reportData.pcs.length > 0) {
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed PC Management Report', 20, yPosition);
      yPosition += 15;
      
      // Create PC table
      this.createPCTable(doc, reportData.pcs, yPosition);
      yPosition += (Math.ceil(reportData.pcs.length / 8) * 8) + 20;
    }

    // Receipt Images section
    const receiptsWithImages = [
      ...reportData.stocks.filter(stock => stock.receiptAttachment),
      ...reportData.disposals.filter(disposal => disposal.receiptAttachment)
    ];

    if (receiptsWithImages.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Receipt Images', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Receipt Images: ${receiptsWithImages.length}`, 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(8);
      const receiptHeaders = ['Type', 'Item', 'Date Added', 'Receipt File', 'Value'];
      let xPosition = 20;
      receiptHeaders.forEach(header => {
        doc.text(header, xPosition, yPosition);
        xPosition += 35;
      });
      yPosition += 7;
      
      receiptsWithImages.forEach(receipt => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        xPosition = 20;
        
        // Determine type (Stock or Disposal)
        const isStock = reportData.stocks.some(stock => stock.id === receipt.id);
        doc.text(isStock ? 'Stock' : 'Disposal', xPosition, yPosition);
        xPosition += 35;
        
        doc.text(receipt.itemName || 'N/A', xPosition, yPosition);
        xPosition += 35;
        
        const dateAdded = new Date(receipt.createdAt).toLocaleDateString();
        const timeAdded = new Date(receipt.createdAt).toLocaleTimeString();
        doc.text(`${dateAdded}`, xPosition, yPosition);
        yPosition += 4;
        doc.text(`${timeAdded}`, xPosition, yPosition);
        yPosition -= 4;
        xPosition += 35;
        
        doc.text(receipt.receiptAttachment || 'N/A', xPosition, yPosition);
        xPosition += 35;
        
        const value = isStock ? receipt.totalPrice : receipt.totalValue;
        doc.text(`₱${(typeof value === 'number' ? value.toFixed(2) : '0.00')}`, xPosition, yPosition);
        yPosition += 8;
      });
    }

    // Footer with metadata
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text(`Generated by Computer Lab Inventory System v2.0`, 105, 295, { align: 'center' });
    }
    
    return doc.output('blob');
  }

  // Add simple header without logo
  private addSimpleHeader(doc: jsPDF, reportType: string): void {
    // Simple header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Computer Lab Inventory System', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 105, 30, { align: 'center' });
    
    // Precise date formatting
    const now = new Date();
    const preciseDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const preciseTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${preciseDate} at ${preciseTime}`, 105, 40, { align: 'center' });
  }

  // Add simplified Benedicto College logo
  private addSchoolLogo(doc: jsPDF): void {
    const logoX = 20;
    const logoY = 8;
    const logoSize = 25;
    
    // Draw circular logo background
    doc.setFillColor(255, 255, 255); // White background
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    
    // Draw outer ring (blue)
    doc.setFillColor(0, 51, 102);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    
    // Draw inner circle (white)
    doc.setFillColor(255, 255, 255);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/3, 'F');
    
    // Add "BC" text
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BC', logoX + logoSize/2, logoY + logoSize/2 + 2, { align: 'center' });
    
    // Add year
    doc.setFontSize(6);
    doc.text('2000', logoX + logoSize/2, logoY + logoSize/2 + 8, { align: 'center' });
  }

  // Create simple stocks table for portrait format
  private createStocksTable(doc: jsPDF, stocks: any[], startY: number): void {
    const pageWidth = 210; // Portrait A4 width
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    
    // Column widths for portrait format
    const colWidths = [60, 20, 30, 25, 25]; // Item, Quantity, Location, Value, Category
    const rowHeight = 6;
    
    // Table headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, startY, tableWidth, rowHeight, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    let xPos = margin;
    const headers = ['Item', 'Quantity', 'Location', 'Value', 'Category'];
    
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, startY + 4);
      xPos += colWidths[index];
    });
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    stocks.forEach((stock, index) => {
      const currentY = startY + (index + 1) * rowHeight;
      
      // Check if we need a new page
      if (currentY > 200) {
        doc.addPage();
        this.addSimpleHeader(doc, '');
        return this.createStocksTable(doc, stocks.slice(index), 50);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      }
      
      xPos = margin;
      
      // Item name (truncate if too long)
      const itemName = (stock.itemName || 'N/A').length > 25 ? 
        (stock.itemName || 'N/A').substring(0, 22) + '...' : 
        (stock.itemName || 'N/A');
      doc.text(itemName, xPos + 2, currentY + 5);
      xPos += colWidths[0];
      
      // Quantity
      doc.text(stock.quantity?.toString() || '0', xPos + 2, currentY + 5);
      xPos += colWidths[1];
      
      // Location (truncate if too long)
      const location = (stock.locationName || 'N/A').length > 15 ? 
        (stock.locationName || 'N/A').substring(0, 12) + '...' : 
        (stock.locationName || 'N/A');
      doc.text(location, xPos + 2, currentY + 5);
      xPos += colWidths[2];
      
      // Value
      const value = typeof stock.totalPrice === 'number' ? 
        `₱${stock.totalPrice.toFixed(2)}` : '₱0.00';
      doc.text(value, xPos + 2, currentY + 5);
      xPos += colWidths[3];
      
      // Category
      doc.text(stock.categoryName || 'N/A', xPos + 2, currentY + 5);
    });
  }

  // Create simple disposals table for portrait format
  private createDisposalsTable(doc: jsPDF, disposals: any[], startY: number): void {
    const pageWidth = 210; // Portrait A4 width
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    
    // Column widths for portrait format
    const colWidths = [45, 20, 40, 25, 30]; // Item, Quantity, Reason, Date, Value
    const rowHeight = 6;
    
    // Table headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, startY, tableWidth, rowHeight, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    let xPos = margin;
    const headers = ['Item', 'Quantity', 'Reason', 'Date', 'Value'];
    
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, startY + 4);
      xPos += colWidths[index];
    });
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    disposals.forEach((disposal, index) => {
      const currentY = startY + (index + 1) * rowHeight;
      
      // Check if we need a new page
      if (currentY > 200) {
        doc.addPage();
        this.addSimpleHeader(doc, '');
        return this.createDisposalsTable(doc, disposals.slice(index), 50);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      }
      
      xPos = margin;
      
      // Item name (truncate if too long)
      const itemName = (disposal.itemName || 'N/A').length > 20 ? 
        (disposal.itemName || 'N/A').substring(0, 17) + '...' : 
        (disposal.itemName || 'N/A');
      doc.text(itemName, xPos + 2, currentY + 5);
      xPos += colWidths[0];
      
      // Quantity
      doc.text(disposal.quantity?.toString() || '0', xPos + 2, currentY + 5);
      xPos += colWidths[1];
      
      // Reason (truncate if too long)
      const reason = (disposal.reason || 'N/A').length > 20 ? 
        (disposal.reason || 'N/A').substring(0, 17) + '...' : 
        (disposal.reason || 'N/A');
      doc.text(reason, xPos + 2, currentY + 5);
      xPos += colWidths[2];
      
      // Date
      const date = new Date(disposal.disposalDate).toLocaleDateString();
      doc.text(date, xPos + 2, currentY + 5);
      xPos += colWidths[3];
      
      // Value
      const value = typeof disposal.totalValue === 'number' ? 
        `₱${disposal.totalValue.toFixed(2)}` : '₱0.00';
      doc.text(value, xPos + 2, currentY + 5);
    });
  }

  // Create simple PC table for portrait format
  private createPCTable(doc: jsPDF, pcs: any[], startY: number): void {
    const pageWidth = 210; // Portrait A4 width
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    
    // Column widths for portrait format
    const colWidths = [50, 40, 30, 25, 35]; // PC Name, Location, Status, Components, Last Updated
    const rowHeight = 6;
    
    // Table headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, startY, tableWidth, rowHeight, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    let xPos = margin;
    const headers = ['PC Name', 'Location', 'Status', 'Components', 'Last Updated'];
    
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, startY + 4);
      xPos += colWidths[index];
    });
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    pcs.forEach((pc, index) => {
      const currentY = startY + (index + 1) * rowHeight;
      
      // Check if we need a new page
      if (currentY > 200) {
        doc.addPage();
        this.addSimpleHeader(doc, '');
        return this.createPCTable(doc, pcs.slice(index), 50);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
      }
      
      xPos = margin;
      
      // PC Name (truncate if too long)
      const pcName = (pc.name || 'N/A').length > 20 ? 
        (pc.name || 'N/A').substring(0, 17) + '...' : 
        (pc.name || 'N/A');
      doc.text(pcName, xPos + 2, currentY + 5);
      xPos += colWidths[0];
      
      // Location (truncate if too long)
      const location = (pc.roomLocationName || 'N/A').length > 15 ? 
        (pc.roomLocationName || 'N/A').substring(0, 12) + '...' : 
        (pc.roomLocationName || 'N/A');
      doc.text(location, xPos + 2, currentY + 5);
      xPos += colWidths[1];
      
      // Status
      doc.text(pc.status || 'N/A', xPos + 2, currentY + 5);
      xPos += colWidths[2];
      
      // Components
      doc.text(pc.componentsCount?.toString() || '0', xPos + 2, currentY + 5);
      xPos += colWidths[3];
      
      // Last Updated (precise date)
      const lastUpdated = new Date(pc.updatedAt || pc.createdAt);
      const preciseDate = lastUpdated.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      const preciseTime = lastUpdated.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      doc.text(`${preciseDate}`, xPos + 2, currentY + 5);
      doc.text(`${preciseTime}`, xPos + 2, currentY + 8);
    });
  }

  downloadPDF(reportData: ReportData, reportType: string): void {
    try {
      console.log('Downloading PDF for report type:', reportType);
      console.log('Report data:', reportData);
      const blob = this.generatePDFBlob(reportData, reportType);
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
      console.log('Downloading PDF for report:', report);
      console.log('Report data:', report.data);
      this.downloadPDF(report.data, report.type);
    } catch (error) {
      console.error('Error generating PDF for download:', error);
      alert('Error generating PDF download. Please check the console for details.');
    }
  }

  // Preview PDF in new window
  previewPDF(report: StoredReport): void {
    try {
      console.log('Previewing PDF for report:', report);
      console.log('Report data:', report.data);
      const blob = this.generatePDFBlob(report.data, report.type);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up after a delay
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

  // Get reports by type
  getReportsByType(type: 'weekly' | 'monthly'): StoredReport[] {
    return this.storedReports.value.filter(report => report.type === type);
  }

  // Get recent reports (last 10)
  getRecentReports(limit: number = 10): StoredReport[] {
    return this.storedReports.value.slice(0, limit);
  }

  // Search reports by title, week number, or month
  searchReports(query: string): StoredReport[] {
    const searchTerm = query.toLowerCase();
    return this.storedReports.value.filter(report => 
      report.title.toLowerCase().includes(searchTerm) ||
      report.type.toLowerCase().includes(searchTerm) ||
      (report.weekNumber && report.weekNumber.toString().includes(searchTerm)) ||
      (report.monthYear && report.monthYear.toLowerCase().includes(searchTerm))
    );
  }

  // Get available weeks for weekly reports
  getAvailableWeeks(): { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }[] {
    const weeklyReports = this.getReportsByType('weekly');
    const weeks: { weekNumber: number; startDate: Date; endDate: Date; exists: boolean }[] = [];
    
    // Generate last 24 weeks (6 months) for more flexibility
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

  // Get available months for monthly reports
  getAvailableMonths(): { monthYear: string; startDate: Date; endDate: Date; exists: boolean }[] {
    const monthlyReports = this.getReportsByType('monthly');
    const months: { monthYear: string; startDate: Date; endDate: Date; exists: boolean }[] = [];
    
    // Generate last 24 months (2 years) for more flexibility
    for (let i = 0; i < 24; i++) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i);
      endDate.setDate(0); // Last day of the month
      
      const startDate = new Date(endDate);
      startDate.setDate(1); // First day of the month
      
      const monthYear = this.getMonthYear(startDate);
      const exists = monthlyReports.some(report => 
        report.period.startDate.getTime() === startDate.getTime() &&
        report.period.endDate.getTime() === endDate.getTime()
      );
      
      months.push({ monthYear, startDate, endDate, exists });
    }
    
    return months;
  }

  // Get report statistics
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

  // Export all reports as JSON
  exportAllReports(): string {
    return JSON.stringify(this.storedReports.value, null, 2);
  }

  // Import reports from JSON
  importReports(jsonData: string): boolean {
    try {
      const reports: StoredReport[] = JSON.parse(jsonData);
      const currentReports = this.storedReports.value;
      const combinedReports = [...reports, ...currentReports];
      
      // Remove duplicates based on ID
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
}
