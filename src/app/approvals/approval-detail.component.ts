import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ApprovalRequestService, AlertService, AccountService } from '@app/_services';
import { ApprovalRequest, Role } from '@app/_models';

@Component({
  selector: 'app-approval-detail',
  templateUrl: './approval-detail.component.html',
  styles: [`
    .detail-container {
      padding: 20px 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .page-header {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
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
      color: #667eea;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }

    .page-subtitle {
      color: #718096;
      margin: 5px 0 0 0;
      font-size: 1rem;
    }

    .detail-container-content {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .detail-section {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e2e8f0;
    }

    .detail-section:first-child {
      padding: 16px;
      max-width: 350px;
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-item {
      margin-bottom: 15px;
    }

    .detail-section:first-child .detail-item {
      margin-bottom: 10px;
    }

    .detail-label {
      font-size: 0.8rem;
      color: #718096;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .detail-value {
      font-weight: 500;
      color: #2d3748;
    }

    .request-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
    }

    .status-pending {
      background: #fef5e7;
      color: #d69e2e;
    }

    .status-approved {
      background: #f0fff4;
      color: #38a169;
    }

    .status-rejected {
      background: #fed7d7;
      color: #e53e3e;
    }

    .request-data {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    /* Enhanced detailed request data styling */
    .detailed-request-data {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .detail-subsection {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }

    .subsection-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid #f7fafc;
      padding-bottom: 10px;
    }

    .subsection-title i {
      color: #4299e1;
      font-size: 1rem;
    }

    .detail-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-value.highlight {
      font-weight: 600;
      color: #2b6cb0;
    }

    .detail-value.quantity {
      font-weight: 600;
      color: #38a169;
      font-size: 1.1rem;
    }

    .detail-value.price {
      font-weight: 600;
      color: #d69e2e;
      font-size: 1.1rem;
    }

    .detail-value.total-value {
      font-weight: 700;
      color: #e53e3e;
      font-size: 1.2rem;
      background: #fed7d7;
      padding: 8px 12px;
      border-radius: 6px;
      text-align: center;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .detail-row {
        grid-template-columns: 1fr;
        gap: 10px;
      }
      
      .detail-subsection {
        padding: 15px;
      }
      
      .subsection-title {
        font-size: 1rem;
      }
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    .btn-success {
      background: #48bb78;
      color: white;
    }

    .btn-success:hover {
      background: #38a169;
    }

    .btn-danger {
      background: #f56565;
      color: white;
    }

    .btn-danger:hover {
      background: #e53e3e;
    }

    .btn-secondary {
      background: #a0aec0;
      color: white;
    }

    .btn-secondary:hover {
      background: #718096;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #718096;
    }

    .loading i {
      font-size: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .rejection-reason {
      background: #fed7d7;
      border: 1px solid #feb2b2;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }

    .rejection-reason h5 {
      color: #c53030;
      margin-bottom: 8px;
      font-size: 1rem;
    }

    .rejection-reason p {
      color: #742a2a;
      margin: 0;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .detail-section:first-child {
        max-width: none;
        padding: 16px;
      }
    }
  `]
})
export class ApprovalDetailComponent implements OnInit {
  approvalRequest: ApprovalRequest | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private approvalRequestService: ApprovalRequestService,
    private alertService: AlertService,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadApprovalRequest(id);
    }
  }

  loadApprovalRequest(id: string) {
    this.loading = true;
    this.approvalRequestService.getById(+id)
      .pipe(first())
      .subscribe({
        next: (request) => {
          this.approvalRequest = request;
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Failed to load approval request');
          this.loading = false;
        }
      });
  }

  approveRequest() {
    if (this.approvalRequest && confirm('Are you sure you want to approve this request?')) {
      console.log('=== FRONTEND APPROVAL DEBUG ===');
      console.log('Approval Request ID:', this.approvalRequest.id);
      console.log('Approval Request Data:', JSON.stringify(this.approvalRequest, null, 2));
      console.log('Sending approval request...');
      
      this.approvalRequestService.approve(this.approvalRequest.id!, { remarks: '' })
        .pipe(first())
        .subscribe({
          next: (response) => {
            console.log('✅ Approval successful!');
            console.log('Server response:', JSON.stringify(response, null, 2));
            this.alertService.success('Request approved successfully');
            this.loadApprovalRequest(this.approvalRequest!.id!.toString());
          },
          error: (error) => {
            console.error('❌ APPROVAL ERROR - DETAILED DEBUG ===');
            console.error('Full error object:', error);
            console.error('Error status:', error.status);
            console.error('Error statusText:', error.statusText);
            console.error('Error headers:', error.headers);
            console.error('Error url:', error.url);
            console.error('Error message:', error.message);
            
            if (error.error) {
              console.error('Server error details:', error.error);
              console.error('Server error message:', error.error.message);
              console.error('Server error type:', error.error.type);
              console.error('Server error timestamp:', error.error.timestamp);
              
              if (error.error.stack) {
                console.error('Server stack trace:', error.error.stack);
              }
              
              if (error.error.missingFields) {
                console.error('Missing fields:', error.error.missingFields);
              }
              
              if (error.error.errors) {
                console.error('Validation errors:', error.error.errors);
              }
            }
            
            // Log the original request that failed
            console.error('Original approval request that failed:', JSON.stringify(this.approvalRequest, null, 2));
            
            let errorMessage = 'Unknown error occurred';
            if (error.status === 500) {
              errorMessage = `Internal Server Error (500): ${error.error?.message || 'Server encountered an error'}`;
            } else if (error.status === 400) {
              errorMessage = `Bad Request (400): ${error.error?.message || 'Invalid request'}`;
            } else if (error.status === 404) {
              errorMessage = `Not Found (404): ${error.error?.message || 'Resource not found'}`;
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            console.error('Final error message to display:', errorMessage);
            this.alertService.error('Failed to approve request: ' + errorMessage);
          }
        });
    }
  }

  rejectRequest() {
    if (this.approvalRequest) {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason && reason.trim()) {
        this.approvalRequestService.reject(this.approvalRequest.id!, { rejectionReason: reason.trim() })
          .pipe(first())
          .subscribe({
            next: () => {
              this.alertService.success('Request rejected successfully');
              this.loadApprovalRequest(this.approvalRequest!.id!.toString());
            },
            error: (error) => {
              this.alertService.error('Failed to reject request');
            }
          });
      }
    }
  }

  deleteRequest() {
    if (this.approvalRequest && this.approvalRequest.status === 'pending') {
      if (confirm('Are you sure you want to delete this request?')) {
        this.approvalRequestService.delete(this.approvalRequest.id!)
          .pipe(first())
          .subscribe({
            next: () => {
              this.alertService.success('Request deleted successfully');
              this.router.navigate(['/approvals/my-requests']);
            },
            error: (error) => {
              this.alertService.error('Failed to delete request');
            }
          });
      }
    }
  }

  goBack() {
    this.router.navigate(['/approvals']);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getTypeIcon(type: string): string {
    return type === 'stock' ? 'fas fa-boxes' : 'fas fa-trash-alt';
  }

  getTypeLabel(type: string): string {
    return type === 'stock' ? 'Stock Request' : 'Dispose Request';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canApprove(): boolean {
    return this.approvalRequest?.status === 'pending' && 
           this.hasRole([Role.SuperAdmin, Role.Admin]);
  }

  canReject(): boolean {
    return this.approvalRequest?.status === 'pending' && 
           this.hasRole([Role.SuperAdmin, Role.Admin]);
  }

  canDelete(): boolean {
    return this.approvalRequest?.status === 'pending' && 
           (this.approvalRequest?.createdBy === Number(this.accountService.accountValue?.id) || 
            this.hasRole([Role.SuperAdmin, Role.Admin]));
  }

  hasRole(roles: string[]): boolean {
    return this.accountService.accountValue && roles.includes(this.accountService.accountValue.role);
  }

  formatRequestData(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  // Get enhanced request data from backend
  getEnhancedData(): any {
    console.log('=== FRONTEND DEBUG: getEnhancedData() ===');
    console.log('Full approvalRequest:', this.approvalRequest);
    console.log('enhancedRequestData:', this.approvalRequest?.enhancedRequestData);
    return this.approvalRequest?.enhancedRequestData || null;
  }

  // Get basic request data with proper parsing
  getRequestData(): any {
    console.log('=== FRONTEND DEBUG: getRequestData() ===');
    console.log('requestData:', this.approvalRequest?.requestData);
    console.log('requestData type:', typeof this.approvalRequest?.requestData);
    
    let requestData = this.approvalRequest?.requestData;
    
    // If requestData is a string, parse it as JSON
    if (typeof requestData === 'string') {
      try {
        requestData = JSON.parse(requestData);
        console.log('✅ Successfully parsed requestData from string to object:', requestData);
      } catch (error) {
        console.error('❌ Failed to parse requestData JSON:', error);
        return null;
      }
    }
    
    console.log('Final parsed requestData:', requestData);
    return requestData || null;
  }

  // Get display quantity with robust fallback
  getDisplayQuantity(): number {
    console.log('Getting display quantity...');
    const enhanced = this.getEnhancedData();
    const basic = this.getRequestData();
    
    const quantity = enhanced?.quantity || basic?.quantity || 0;
    console.log('Display quantity result:', quantity);
    return quantity;
  }

  // Get display price with robust fallback
  getDisplayPrice(): number {
    console.log('Getting display price...');
    const enhanced = this.getEnhancedData();
    const basic = this.getRequestData();
    
    const price = enhanced?.price || basic?.price || 0;
    console.log('Display price result:', price);
    return price;
  }

  // Format currency with proper comma separation
  formatCurrency(amount: number): string {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
