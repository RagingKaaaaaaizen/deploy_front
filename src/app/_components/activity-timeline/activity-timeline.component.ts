import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivityLog } from '@app/_models/activity-log';
import { ActivityActionService } from '@app/_services/activity-action.service';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface GroupedLog {
  date: string;
  relativeDate: string;
  logs: ActivityLog[];
}

@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css']
})
export class ActivityTimelineComponent implements OnInit, OnChanges {
  @Input() logs: ActivityLog[] = [];
  @Input() loading: boolean = false;
  @Input() showUserInfo: boolean = true;
  @Input() compact: boolean = false;

  groupedLogs: GroupedLog[] = [];

  constructor(private activityActionService: ActivityActionService) { }

  ngOnInit(): void {
    this.processLogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs'] && changes['logs'].currentValue !== changes['logs'].previousValue) {
      this.processLogs();
    }
  }

  processLogs(): void {
    console.log('ActivityTimeline: Processing logs:', this.logs);
    if (!this.logs || this.logs.length === 0) {
      console.log('ActivityTimeline: No logs to process');
      this.groupedLogs = [];
      return;
    }

    const groups: { [key: string]: ActivityLog[] } = {};

    this.logs.forEach(log => {
      const logDate = new Date(log.createdAt);
      const dateKey = format(logDate, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    this.groupedLogs = Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort by date descending
      .map(dateKey => {
        const date = new Date(dateKey);
        let relativeDate = format(date, 'EEEE, MMMM d, yyyy'); // Default full date

        if (isToday(date)) {
          relativeDate = 'Today';
        } else if (isYesterday(date)) {
          relativeDate = 'Yesterday';
        }

        return {
          date: dateKey,
          relativeDate: relativeDate,
          logs: groups[dateKey].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort logs within group by time descending
        };
      });
    
    console.log('ActivityTimeline: Grouped logs result:', this.groupedLogs);
  }

  /**
   * Get relative time display (e.g., "2 hours ago", "Yesterday")
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  }

  /**
   * Get formatted date for display
   */
  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get formatted time for display
   */
  getFormattedTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get user display name
   */
  getUserDisplayName(log: ActivityLog): string {
    if (log.user) {
      return `${log.user.firstName} ${log.user.lastName}`;
    }
    return 'Unknown User';
  }

  /**
   * Get action configuration for colors and icons
   */
  getActionConfig(action: string) {
    return this.activityActionService.getActionConfig(action);
  }

  /**
   * Get entity type display name
   */
  getEntityTypeDisplayName(entityType: string): string {
    return entityType.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Handle activity detail view
   */
  viewDetails(log: ActivityLog): void {
    console.log('Activity log details:', log);
    // Implement modal or expandable view here
  }
}
