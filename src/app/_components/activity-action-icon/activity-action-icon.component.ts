import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { ActivityActionService, ActionConfig } from '@app/_services/activity-action.service';

@Component({
  selector: 'app-activity-action-icon',
  templateUrl: './activity-action-icon.component.html',
  styleUrls: ['./activity-action-icon.component.css']
})
export class ActivityActionIconComponent implements OnInit, OnChanges {
  @Input() action: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showLabel: boolean = false;

  actionConfig: ActionConfig = {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    icon: 'fas fa-circle',
    label: ''
  };

  constructor(private activityActionService: ActivityActionService) { }

  ngOnInit(): void {
    this.updateActionConfig();
  }

  ngOnChanges(): void {
    this.updateActionConfig();
  }

  private updateActionConfig(): void {
    if (this.action) {
      this.actionConfig = this.activityActionService.getActionConfig(this.action);
    }
  }

  get iconSize(): string {
    switch (this.size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }

  get containerSize(): string {
    switch (this.size) {
      case 'sm':
        return 'w-6 h-6';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  }
}
