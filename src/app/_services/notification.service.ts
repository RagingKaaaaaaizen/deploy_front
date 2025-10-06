import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { environment } from '@environments/environment';
import { first, take } from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/api/analytics`;

export interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'pending_request' | 'system_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export interface NotificationSettings {
  lowStockAlerts: {
    enabled: boolean;
    threshold: number;
    email: boolean;
    inApp: boolean;
  };
  outOfStockAlerts: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
  pendingRequestAlerts: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
  systemAlerts: {
    enabled: boolean;
    email: boolean;
    inApp: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notifications.asObservable();
  
  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();
  
  private settings = new BehaviorSubject<NotificationSettings>({
    lowStockAlerts: { enabled: true, threshold: 10, email: false, inApp: true },
    outOfStockAlerts: { enabled: true, email: false, inApp: true },
    pendingRequestAlerts: { enabled: true, email: false, inApp: true },
    systemAlerts: { enabled: true, email: false, inApp: true }
  });
  public settings$ = this.settings.asObservable();

  constructor(private http: HttpClient) {
    this.loadNotifications();
    this.loadSettings();
    this.startPolling();
  }

  private loadNotifications(): void {
    const stored = localStorage.getItem('inventory_notifications');
    if (stored) {
      try {
        const notifications: Notification[] = JSON.parse(stored);
        notifications.forEach(notification => {
          notification.timestamp = new Date(notification.timestamp);
        });
        this.notifications.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error loading notifications:', error);
        this.notifications.next([]);
      }
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    localStorage.setItem('inventory_notifications', JSON.stringify(notifications));
    this.notifications.next(notifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unread = this.notifications.value.filter(n => !n.read).length;
    this.unreadCount.next(unread);
  }

  private loadSettings(): void {
    const stored = localStorage.getItem('notification_settings');
    if (stored) {
      try {
        const settings: NotificationSettings = JSON.parse(stored);
        this.settings.next(settings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }

  private saveSettings(settings: NotificationSettings): void {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    this.settings.next(settings);
  }

  private startPolling(): void {
    // Poll for new notifications every 30 seconds
    interval(30000).subscribe(() => {
      this.checkForNewNotifications();
    });
  }

  private checkForNewNotifications(): void {
    // Check for low stock items
    this.http.get<any[]>(`${baseUrl}/low-stock-items?threshold=10`)
      .pipe(first())
      .subscribe({
        next: (lowStockItems) => {
          if (lowStockItems.length > 0) {
            this.createLowStockNotification(lowStockItems);
          }
        },
        error: (error) => console.error('Error checking low stock:', error)
      });

    // Check for out of stock items
    this.http.get<any[]>(`${baseUrl}/out-of-stock-items`)
      .pipe(first())
      .subscribe({
        next: (outOfStockItems) => {
          if (outOfStockItems.length > 0) {
            this.createOutOfStockNotification(outOfStockItems);
          }
        },
        error: (error) => console.error('Error checking out of stock:', error)
      });

    // Check for pending requests
    this.http.get<any[]>(`${baseUrl}/pending-requests`)
      .pipe(first())
      .subscribe({
        next: (pendingRequests) => {
          if (pendingRequests.length > 0) {
            this.createPendingRequestNotification(pendingRequests);
          }
        },
        error: (error) => console.error('Error checking pending requests:', error)
      });
  }

  private createLowStockNotification(items: any[]): void {
    const settings = this.settings.value;
    if (!settings.lowStockAlerts.enabled || !settings.lowStockAlerts.inApp) return;

    const existingNotification = this.notifications.value.find(n => 
      n.type === 'low_stock' && !n.read
    );

    if (existingNotification) return; // Don't create duplicate notifications

    const notification: Notification = {
      id: this.generateId(),
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${items.length} item(s) are running low on stock`,
      severity: 'warning',
      timestamp: new Date(),
      read: false,
      actionUrl: '/stocks',
      metadata: { items: items.slice(0, 5) } // Store first 5 items
    };

    this.addNotification(notification);
  }

  private createOutOfStockNotification(items: any[]): void {
    const settings = this.settings.value;
    if (!settings.outOfStockAlerts.enabled || !settings.outOfStockAlerts.inApp) return;

    const existingNotification = this.notifications.value.find(n => 
      n.type === 'out_of_stock' && !n.read
    );

    if (existingNotification) return;

    const notification: Notification = {
      id: this.generateId(),
      type: 'out_of_stock',
      title: 'Out of Stock Alert',
      message: `${items.length} item(s) are completely out of stock`,
      severity: 'error',
      timestamp: new Date(),
      read: false,
      actionUrl: '/stocks',
      metadata: { items: items.slice(0, 5) }
    };

    this.addNotification(notification);
  }

  private createPendingRequestNotification(requests: any[]): void {
    const settings = this.settings.value;
    if (!settings.pendingRequestAlerts.enabled || !settings.pendingRequestAlerts.inApp) return;

    const existingNotification = this.notifications.value.find(n => 
      n.type === 'pending_request' && !n.read
    );

    if (existingNotification) return;

    const notification: Notification = {
      id: this.generateId(),
      type: 'pending_request',
      title: 'Pending Requests',
      message: `${requests.length} approval request(s) are pending`,
      severity: 'info',
      timestamp: new Date(),
      read: false,
      actionUrl: '/approvals',
      metadata: { requests: requests.slice(0, 5) }
    };

    this.addNotification(notification);
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = [notification, ...currentNotifications].slice(0, 100); // Keep only last 100
    this.saveNotifications(updatedNotifications);
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  getNotifications(): Notification[] {
    return this.notifications.value;
  }

  getUnreadCount(): number {
    return this.unreadCount.value;
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notifications.value;
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.saveNotifications(updatedNotifications);
  }

  markAllAsRead(): void {
    const notifications = this.notifications.value;
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications(updatedNotifications);
  }

  deleteNotification(notificationId: string): void {
    const notifications = this.notifications.value;
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(updatedNotifications);
  }

  clearAllNotifications(): void {
    this.saveNotifications([]);
  }

  getSettings(): NotificationSettings {
    return this.settings.value;
  }

  updateSettings(settings: Partial<NotificationSettings>): void {
    const currentSettings = this.settings.value;
    const updatedSettings = { ...currentSettings, ...settings };
    this.saveSettings(updatedSettings);
  }

  // Manual notification creation
  createSystemNotification(title: string, message: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info', actionUrl?: string): void {
    const settings = this.settings.value;
    if (!settings.systemAlerts.enabled || !settings.systemAlerts.inApp) return;

    const notification: Notification = {
      id: this.generateId(),
      type: 'system_alert',
      title,
      message,
      severity,
      timestamp: new Date(),
      read: false,
      actionUrl,
      metadata: {}
    };

    this.addNotification(notification);
  }

  // Filter notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.value.filter(n => n.type === type);
  }

  // Get recent notifications (last 24 hours)
  getRecentNotifications(): Notification[] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.notifications.value.filter(n => n.timestamp > oneDayAgo);
  }

  // Export notifications
  exportNotifications(): string {
    return JSON.stringify(this.notifications.value, null, 2);
  }

  // Import notifications
  importNotifications(jsonData: string): boolean {
    try {
      const notifications: Notification[] = JSON.parse(jsonData);
      notifications.forEach(notification => {
        notification.timestamp = new Date(notification.timestamp);
      });
      this.saveNotifications(notifications);
      return true;
    } catch (error) {
      console.error('Error importing notifications:', error);
      return false;
    }
  }
}
