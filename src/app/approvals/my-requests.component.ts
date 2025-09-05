import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ApprovalRequestService, AlertService, AccountService } from '@app/_services';
import { ApprovalRequest, Role } from '@app/_models';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styles: [`
    .list-container {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      text-align: center;
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
    }

    .pending { color: #f6ad55; }
    .approved { color: #68d391; }
    .rejected { color: #fc8181; }

    .requests-container {
      background: white;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
    }

    .requests-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e2e8f0;
    }

    .requests-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .request-item {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 15px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .request-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .request-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .request-status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
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

    .request-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 0.8rem;
      color: #718096;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .info-value {
      font-weight: 500;
      color: #2d3748;
    }

    .request-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
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

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #718096;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 20px;
      color: #cbd5e0;
    }

    .empty-state h3 {
      margin-bottom: 10px;
      color: #4a5568;
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
      padding: 12px;
      margin-top: 10px;
    }

    .rejection-reason h5 {
      color: #c53030;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .rejection-reason p {
      color: #742a2a;
      margin: 0;
      font-size: 0.85rem;
    }
  `]
})
export class MyRequestsComponent implements OnInit {
  myRequests: ApprovalRequest[] = [];
  loading = false;
  stats = {
    pending: 0,
    approved: 0,
    rejected: 0
  };

  constructor(
    private approvalRequestService: ApprovalRequestService,
    private alertService: AlertService,
    private accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadMyRequests();
  }

  loadMyRequests() {
    this.loading = true;
    this.approvalRequestService.getMyRequests()
      .pipe(first())
      .subscribe({
        next: (requests) => {
          this.myRequests = requests;
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error('Failed to load your requests');
          this.loading = false;
        }
      });
  }

  calculateStats() {
    this.stats = {
      pending: this.myRequests.filter(r => r.status === 'pending').length,
      approved: this.myRequests.filter(r => r.status === 'approved').length,
      rejected: this.myRequests.filter(r => r.status === 'rejected').length
    };
  }

  viewRequest(request: ApprovalRequest) {
    this.router.navigate(['/approvals', request.id]);
  }

  deleteRequest(request: ApprovalRequest) {
    if (request.status !== 'pending') {
      this.alertService.error('Only pending requests can be deleted');
      return;
    }

    if (confirm('Are you sure you want to delete this request?')) {
      this.approvalRequestService.delete(request.id!)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Request deleted successfully');
            this.loadMyRequests();
          },
          error: (error) => {
            this.alertService.error('Failed to delete request');
          }
        });
    }
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

  canDelete(request: ApprovalRequest): boolean {
    return request.status === 'pending';
  }

  hasRole(roles: string[]): boolean {
    return this.accountService.accountValue && roles.includes(this.accountService.accountValue.role);
  }

  get Role() {
    return Role;
  }
}
