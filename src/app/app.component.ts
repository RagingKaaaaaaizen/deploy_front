import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ 
  selector: 'app', 
  templateUrl: 'app.component.html',
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .mobile-menu-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1002;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }

    .mobile-menu-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .main-content {
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      min-height: 100vh;
      background: #f8f9fa;
    }

    .main-content.with-sidebar {
      margin-left: 280px;
    }

    /* When sidebar is collapsed */
    .sidebar.collapsed + .main-content.with-sidebar {
      margin-left: 70px;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: flex;
      }

      .main-content.with-sidebar {
        margin-left: 0;
      }
    }

    /* Global styles for better appearance */
    .container {
      padding: 20px;
    }

    .card {
      border: none;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0 !important;
      padding: 20px;
      font-weight: 600;
    }

    .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: none;
      padding: 10px 20px;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
      transform: translateY(-2px);
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
      transform: translateY(-2px);
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #138496;
      transform: translateY(-2px);
    }

    .table {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      background: white;
    }

    .table thead th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-weight: 600;
      padding: 15px;
    }

    .table tbody tr {
      transition: all 0.3s ease;
    }

    .table tbody tr:hover {
      background-color: #f8f9fa;
      transform: scale(1.01);
    }

    .table td {
      padding: 15px;
      vertical-align: middle;
      border-top: 1px solid #dee2e6;
    }

    .form-control {
      border-radius: 8px;
      border: 2px solid #e1e5e9;
      transition: all 0.3s ease;
      padding: 12px 15px;
      font-size: 1rem;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .form-select {
      border-radius: 8px;
      border: 2px solid #e1e5e9;
      transition: all 0.3s ease;
      padding: 12px 15px;
      font-size: 1rem;
    }

    .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .alert {
      border-radius: 10px;
      border: none;
      padding: 15px 20px;
      margin-bottom: 20px;
    }

    .alert-success {
      background: #d4edda;
      color: #155724;
    }

    .alert-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .alert-warning {
      background: #fff3cd;
      color: #856404;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    /* Page headers */
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .page-subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    /* Stats cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      text-align: center;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 1rem;
    }

    /* Responsive utilities */
    @media (max-width: 768px) {
      .container {
        padding: 15px;
      }

      .page-header {
        padding: 20px;
      }

      .page-title {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AppComponent {
    Role = Role;
    account: Account;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }
    
    toggleMobileMenu() {
        // This will be handled by the nav component
        const navComponent = document.querySelector('app-nav') as any;
        if (navComponent && navComponent.toggleMobileSidebar) {
            navComponent.toggleMobileSidebar();
        }
    }
    
    logout() {
        this.accountService.logout();
    }
}