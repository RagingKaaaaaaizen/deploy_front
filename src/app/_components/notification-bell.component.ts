import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../_services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  template: `
    <div class="notification-container">
      <!-- Notification Bell -->
      <div class="notification-bell" (click)="toggleDropdown()" [class.active]="isDropdownOpen">
        <i class="fas fa-bell"></i>
        <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </div>

      <!-- Dropdown -->
      <div class="notification-dropdown" [class.show]="isDropdownOpen" *ngIf="isDropdownOpen">
        <div class="dropdown-header">
          <h6>Notifications</h6>
          <div class="header-actions">
            <button class="btn btn-sm btn-outline-secondary" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
              Mark All Read
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="clearAll()">
              Clear All
            </button>
          </div>
        </div>

        <div class="notification-list" *ngIf="notifications.length > 0; else noNotifications">
          <div class="notification-item" 
               *ngFor="let notification of notifications.slice(0, 10)" 
               [class.unread]="!notification.read"
               [class]="'severity-' + notification.severity"
               (click)="handleNotificationClick(notification)">
            <div class="notification-icon">
              <i class="fas" [ngClass]="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <button class="btn btn-sm btn-outline-secondary" 
                      (click)="markAsRead(notification.id); $event.stopPropagation()"
                      *ngIf="!notification.read">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" 
                      (click)="deleteNotification(notification.id); $event.stopPropagation()">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noNotifications>
          <div class="no-notifications">
            <i class="fas fa-bell-slash"></i>
            <p>No notifications</p>
          </div>
        </ng-template>

        <div class="dropdown-footer" *ngIf="notifications.length > 0">
          <a href="#" class="view-all-link" (click)="viewAllNotifications()">
            View All Notifications
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
      display: inline-block;
    }

    .notification-bell {
      position: relative;
      width: 40px;
      height: 40px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #6c757d;
    }

    .notification-bell:hover {
      background: #e9ecef;
      color: #495057;
      transform: scale(1.05);
    }

    .notification-bell.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .notification-bell i {
      font-size: 1.1rem;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #dc3545;
      color: white;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      line-height: 1.2;
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 350px;
      max-height: 400px;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .notification-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-header {
      padding: 15px 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .dropdown-header h6 {
      margin: 0;
      font-weight: 600;
      color: #495057;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 15px 20px;
      border-bottom: 1px solid #f8f9fa;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #e3f2fd;
      border-left: 3px solid #2196f3;
    }

    .notification-item.severity-error {
      border-left: 3px solid #dc3545;
    }

    .notification-item.severity-warning {
      border-left: 3px solid #ffc107;
    }

    .notification-item.severity-success {
      border-left: 3px solid #28a745;
    }

    .notification-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-item.severity-error .notification-icon {
      background: #f8d7da;
      color: #dc3545;
    }

    .notification-item.severity-warning .notification-icon {
      background: #fff3cd;
      color: #ffc107;
    }

    .notification-item.severity-success .notification-icon {
      background: #d4edda;
      color: #28a745;
    }

    .notification-item.severity-info .notification-icon {
      background: #d1ecf1;
      color: #17a2b8;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      color: #495057;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }

    .notification-message {
      color: #6c757d;
      font-size: 0.85rem;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .notification-time {
      color: #adb5bd;
      font-size: 0.75rem;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      margin-left: 8px;
      flex-shrink: 0;
    }

    .notification-actions .btn {
      padding: 4px 8px;
      font-size: 0.75rem;
    }

    .no-notifications {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .no-notifications i {
      font-size: 2rem;
      margin-bottom: 10px;
      opacity: 0.5;
    }

    .dropdown-footer {
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
      text-align: center;
    }

    .view-all-link {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    /* Scrollbar styling */
    .notification-list::-webkit-scrollbar {
      width: 6px;
    }

    .notification-list::-webkit-scrollbar-track {
      background: #f1f3f4;
    }

    .notification-list::-webkit-scrollbar-thumb {
      background: #c1c8cd;
      border-radius: 3px;
    }

    .notification-list::-webkit-scrollbar-thumb:hover {
      background: #a8b0b5;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .notification-dropdown {
        width: 300px;
        right: -50px;
      }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId);
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  handleNotificationClick(notification: Notification): void {
    this.markAsRead(notification.id);
    
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
    
    this.isDropdownOpen = false;
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.isDropdownOpen = false;
  }

  getNotificationIcon(type: string): string {
    const iconMap = {
      'low_stock': 'fa-exclamation-triangle',
      'out_of_stock': 'fa-times-circle',
      'pending_request': 'fa-hourglass-half',
      'system_alert': 'fa-info-circle'
    };
    return iconMap[type] || 'fa-bell';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }
}
