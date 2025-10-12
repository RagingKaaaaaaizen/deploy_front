import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService, ApprovalRequestService } from '@app/_services';
import { Role } from '@app/_models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-nav',
  template: `
    <!-- Mobile Overlay -->
    <div class="sidebar-overlay" 
         [class.active]="isMobileOpen" 
         (click)="closeMobileSidebar()"></div>
    
    <!-- Sidebar -->
    <div class="sidebar" 
         [ngClass]="{ 
           'collapsed': isCollapsed && !isMobile, 
           'mobile-open': isMobileOpen,
           'mobile': isMobile,
           'modal-blur': isModalOpen
         }">
      
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-logo">
            <span class="text-blue-600 font-akira">B</span>
            <span class="text-orange-500 font-akira">C</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="toggle-btn mobile-toggle" 
                  (click)="toggleMobileSidebar()"
                  *ngIf="isMobile">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- User Profile Section with Dropdown -->
      <div class="user-profile" *ngIf="accountService.accountValue">
        <div class="user-avatar cursor-pointer" (click)="toggleDropdown('profile')">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-info" *ngIf="!isCollapsed || isMobile">
          <div class="user-name font-montserrat">{{ accountService.accountValue.firstName }} {{ accountService.accountValue.lastName }}</div>
          <div class="user-role font-inter">{{ accountService.accountValue.role }}</div>
        </div>
        <div class="profile-dropdown" *ngIf="!isCollapsed || isMobile">
          <i class="fas fa-chevron-down dropdown-arrow cursor-pointer" 
             [class.rotated]="isDropdownOpen('profile')"
             (click)="toggleDropdown('profile')"></i>
        </div>
        
        <!-- Profile Dropdown Menu -->
        <div class="profile-dropdown-menu" 
             [class.show]="isDropdownOpen('profile')"
             *ngIf="(!isCollapsed || isMobile) && isDropdownOpen('profile')">
          <a class="profile-dropdown-item" routerLink="/profile" (click)="closeMobileSidebar()">
            <i class="fas fa-user"></i>
            <span>View Profile</span>
          </a>
          <a class="profile-dropdown-item" routerLink="/profile/update" (click)="closeMobileSidebar()">
            <i class="fas fa-edit"></i>
            <span>Edit Profile</span>
          </a>
          <div class="profile-dropdown-divider"></div>
          <button class="profile-dropdown-item logout-option" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <a class="nav-link" 
               routerLink="/" 
               routerLinkActive="active" 
               [routerLinkActiveOptions]="{exact: true}"
               (click)="closeMobileSidebar()">
              <i class="fas fa-tachometer-alt"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Dashboard</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Dashboard</span>
            </a>
          </li>

          <!-- Inventory Dropdown -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer])">
            <a class="nav-link cursor-pointer" 
               (click)="toggleDropdown('inventory')"
               [class.active]="isDropdownOpen('inventory')">
              <i class="fas fa-boxes"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Inventory</span>
              <i class="fas fa-chevron-down dropdown-arrow ml-auto" 
                 [class.rotated]="isDropdownOpen('inventory')"
                 *ngIf="!isCollapsed || isMobile"></i>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Inventory</span>
            </a>
            <ul class="dropdown-menu" 
                [class.show]="isDropdownOpen('inventory')"
                *ngIf="!isCollapsed || isMobile">
              <li class="dropdown-item">
                <a class="nav-link" 
                   routerLink="/stocks" 
                   routerLinkActive="active"
                   (click)="closeMobileSidebar()">
                  <i class="fas fa-boxes"></i>
                  <span class="font-inter">Stock Management</span>
                </a>
              </li>
              <li class="dropdown-item">
                <a class="nav-link" 
                   routerLink="/dispose" 
                   routerLinkActive="active"
                   (click)="closeMobileSidebar()">
                  <i class="fas fa-trash-alt"></i>
                  <span class="font-inter">Dispose</span>
                </a>
              </li>
            </ul>
          </li>

          <!-- Add -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin, Role.Staff])">
            <a class="nav-link" 
               routerLink="/add" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-plus-circle"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Add</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Add</span>
            </a>
          </li>

          <!-- Approvals -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin, Role.Staff])">
            <a class="nav-link" 
               routerLink="/approvals" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-clipboard-check"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Approvals</span>
              <span class="badge" *ngIf="pendingCount > 0">{{ pendingCount }}</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Approvals</span>
            </a>
          </li>

          <!-- PC Management -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer])">
            <a class="nav-link" 
               routerLink="/pc" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-desktop"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">PC Management</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">PC Management</span>
            </a>
          </li>

          <!-- Activity Logs -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin])">
            <a class="nav-link" 
               routerLink="/activity" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-history"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Activity Logs</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Activity Logs</span>
            </a>
          </li>

          <!-- Archive Reports -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin, Role.Staff, Role.Viewer])">
            <a class="nav-link" 
               routerLink="/archive" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-archive"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Archive Reports</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Archive Reports</span>
            </a>
          </li>

          <!-- Analytics Dashboard -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin]) && analyticsEnabled">
            <a class="nav-link" 
               routerLink="/analytics" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-chart-line"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Analytics</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Analytics</span>
            </a>
          </li>

          <!-- Manage Accounts -->
          <li class="nav-item" *ngIf="hasRole([Role.SuperAdmin, Role.Admin])">
            <a class="nav-link" 
               routerLink="/admin/accounts" 
               routerLinkActive="active"
               (click)="closeMobileSidebar()">
              <i class="fas fa-users-cog"></i>
              <span class="font-inter" *ngIf="!isCollapsed || isMobile">Manage Accounts</span>
              <span class="tooltip" *ngIf="isCollapsed && !isMobile">Manage Accounts</span>
            </a>
          </li>

        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 240px;
      background: white;
      color: #374151;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e5e7eb;
    }

    .sidebar.modal-blur {
      filter: blur(4px);
      opacity: 0.7;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar.mobile {
      transform: translateX(-100%);
      width: 240px;
    }

    .sidebar.mobile-open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      min-height: 80px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 1.8rem;
      font-weight: 900;
    }

    .brand-text {
      transition: all 0.3s ease;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .toggle-btn {
      background: #f3f4f6;
      border: none;
      color: #6b7280;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }

    .toggle-btn:hover {
      background: #e5e7eb;
      color: #374151;
      transform: scale(1.05);
    }

    .toggle-btn.rotated i {
      transform: rotate(180deg);
    }

    .mobile-toggle {
      display: none;
    }

    .desktop-toggle {
      display: flex;
    }

    .user-profile {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
      min-height: 80px;
      background: #f9fafb;
      position: relative;
    }

    .user-avatar {
      transition: all 0.3s ease;
    }

    .user-avatar.cursor-pointer {
      cursor: pointer;
    }

    .user-avatar i {
      font-size: 2.5rem;
      color: #3b82f6;
    }

    .user-info {
      flex: 1;
      transition: all 0.3s ease;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 4px;
      color: #1f2937;
    }

    .user-role {
      font-size: 0.8rem;
      color: #6b7280;
      text-transform: capitalize;
    }

    .profile-dropdown {
      margin-left: auto;
    }

    .profile-dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      overflow: hidden;
      margin: 8px 0;
    }

    .profile-dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #374151;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 0.9rem;
    }

    .profile-dropdown-item:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .profile-dropdown-item.logout-option:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .profile-dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 4px 0;
    }

    .profile-dropdown-item i {
      width: 16px;
      text-align: center;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin-bottom: 2px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 20px;
      color: #374151;
      text-decoration: none;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      position: relative;
      font-weight: 500;
    }

    .nav-link.cursor-pointer {
      cursor: pointer;
    }

    .nav-link:hover {
      background: #f3f4f6;
      border-left-color: #3b82f6;
      color: #1f2937;
      text-decoration: none;
      transform: translateX(3px);
    }

    .nav-link.active {
      background: #eff6ff;
      border-left-color: #3b82f6;
      color: #1d4ed8;
    }

    .nav-link i {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .dropdown-arrow {
      margin-left: auto;
      font-size: 0.8rem;
      transition: all 0.3s ease;
    }

    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }

    .ml-auto {
      margin-left: auto;
    }

    .dropdown-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      background: #f9fafb;
      border-left: 3px solid #e5e7eb;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .dropdown-menu.show {
      max-height: 200px;
    }

    .dropdown-item {
      margin: 0;
    }

    .dropdown-item a {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px 20px 10px 50px;
      color: #6b7280;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .dropdown-item a:hover {
      background: #f3f4f6;
      color: #374151;
      text-decoration: none;
    }

    .dropdown-item a.active {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .dropdown-item a i {
      font-size: 1rem;
      width: 16px;
    }

    .dropdown-item .nav-link {
      padding: 10px 20px 10px 50px;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .dropdown-item .nav-link:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .dropdown-item .nav-link.active {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .badge {
      position: absolute;
      top: 8px;
      right: 15px;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      line-height: 1.2;
    }

    .nav-link:hover .badge {
      background: #dc2626;
    }

    .tooltip {
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 1001;
      margin-left: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .tooltip::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: #1f2937;
    }

    .nav-link:hover .tooltip {
      opacity: 1;
      visibility: visible;
    }


    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .mobile-toggle {
        display: flex;
      }

      .desktop-toggle {
        display: none;
      }

      .sidebar.collapsed {
        width: 280px;
      }

      .brand-text,
      .user-info,
      .nav-link span,
      .logout-btn span {
        display: block !important;
      }

      .tooltip {
        display: none !important;
      }
    }

    @media (min-width: 769px) {
      .sidebar-overlay {
        display: none;
      }
    }

    /* Scrollbar Styling */
    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class NavComponent implements OnInit, OnDestroy {
  Role = Role;
  isCollapsed = false;
  isMobile = false;
  isMobileOpen = false;
  pendingCount = 0;
  openDropdowns: Set<string> = new Set();
  isModalOpen = false;
  analyticsEnabled = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public accountService: AccountService,
    private approvalRequestService: ApprovalRequestService
  ) {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnInit() {
    // Load pending count only if user has permission to see approvals
    if (this.hasRole([Role.SuperAdmin, Role.Admin])) {
      this.loadPendingCount();
      
      // Refresh pending count every 1 second
      setInterval(() => {
        if (this.hasRole([Role.SuperAdmin, Role.Admin])) {
          this.loadPendingCount();
        }
      }, 1000);
    }
    
    // Check analytics preference
    const analyticsPref = localStorage.getItem('ui.analyticsEnabled');
    this.analyticsEnabled = analyticsPref === 'true';
    
    // Listen for modal state changes
    this.listenForModalEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  listenForModalEvents() {
    // Listen for modal open/close events
    window.addEventListener('modalOpen', () => {
      this.isModalOpen = true;
    });
    
    window.addEventListener('modalClose', () => {
      this.isModalOpen = false;
    });
  }

  loadPendingCount() {
    this.approvalRequestService.getPendingCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.pendingCount = response.count || 0;
        },
        error: (error) => {
          console.error('Error loading pending count:', error);
          this.pendingCount = 0;
        }
      });
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileOpen = false;
    }
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    
    const userRole = account.role;
    return roles.some(role => role === userRole);
  }

  toggleSidebar() {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleMobileSidebar() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobileSidebar() {
    if (this.isMobile) {
      this.isMobileOpen = false;
    }
  }

  logout() {
    this.accountService.logout();
  }

  toggleDropdown(dropdownName: string) {
    if (this.openDropdowns.has(dropdownName)) {
      this.openDropdowns.delete(dropdownName);
    } else {
      this.openDropdowns.add(dropdownName);
    }
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.openDropdowns.has(dropdownName);
  }
} 