import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services/account.service';
import { ActivityLogService } from '@app/_services/activity-log.service';
import { Account } from '@app/_models/account';
import { ActivityLog } from '@app/_models/activity-log';

interface UserLoginHistory {
  user: Account;
  loginCount: number;
  loginDates: Date[];
}

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.css']
})
export class LoginHistoryComponent implements OnInit {
  userLoginHistories: UserLoginHistory[] = [];
  loading = true;
  error: string | null = null;

  headerName: string = 'Stock Inventory System';
  isEditingHeader: boolean = false;
  tempHeaderName: string = '';

  constructor(
    private accountService: AccountService,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit() {
    this.fetchLoginHistory();
  }

  fetchLoginHistory() {
    this.loading = true;
    const now = new Date();
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
    this.accountService.getAll().subscribe({
      next: users => {
        this.activityLogService.getAllActivity(10000, 0, { action: 'LOGIN' }).subscribe({
          next: logs => {
            this.userLoginHistories = users.map(user => {
              // Only logins in the last 7 days
              const userLogs = logs.filter(log => log.userId === user.id && new Date(log.createdAt) >= lastWeek);
              const loginDates = userLogs.map(log => new Date(log.createdAt)).sort((a, b) => b.getTime() - a.getTime());
              return {
                user,
                loginCount: loginDates.length,
                loginDates
              };
            });
            this.loading = false;
          },
          error: err => {
            this.error = 'Failed to fetch login activity.';
            this.loading = false;
          }
        });
      },
      error: err => {
        this.error = 'Failed to fetch users.';
        this.loading = false;
      }
    });
  }

  // Editable header methods
  startEditHeader() {
    this.tempHeaderName = this.headerName;
    this.isEditingHeader = true;
  }

  saveHeaderName() {
    if (this.tempHeaderName.trim()) {
      this.headerName = this.tempHeaderName.trim();
    }
    this.isEditingHeader = false;
  }

  cancelEditHeader() {
    this.isEditingHeader = false;
  }
}
