import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { format } from 'date-fns';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css']
})
export class DateRangePickerComponent implements OnInit {
  @Input() dateRange: DateRange = { startDate: null, endDate: null };
  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() apply = new EventEmitter<DateRange>();
  @Output() clear = new EventEmitter<void>();

  startDateInput: string = '';
  endDateInput: string = '';

  constructor() { }

  ngOnInit(): void {
    if (this.dateRange.startDate) {
      this.startDateInput = format(this.dateRange.startDate, 'yyyy-MM-dd');
    }
    if (this.dateRange.endDate) {
      this.endDateInput = format(this.dateRange.endDate, 'yyyy-MM-dd');
    }
  }

  onStartDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.dateRange.startDate = new Date(value);
    } else {
      this.dateRange.startDate = null;
    }
    this.emitChange();
  }

  onEndDateChange(event: any): void {
    const value = event.target.value;
    if (value) {
      this.dateRange.endDate = new Date(value);
    } else {
      this.dateRange.endDate = null;
    }
    this.emitChange();
  }

  emitChange(): void {
    this.dateRangeChange.emit(this.dateRange);
  }

  applyDateRange(): void {
    this.apply.emit(this.dateRange);
  }

  clearDateRange(): void {
    this.dateRange = { startDate: null, endDate: null };
    this.startDateInput = '';
    this.endDateInput = '';
    this.emitChange();
    this.clear.emit();
  }

  get isValid(): boolean {
    if (!this.dateRange.startDate || !this.dateRange.endDate) {
      return true; // Allow partial selection
    }
    return this.dateRange.startDate <= this.dateRange.endDate;
  }

  get hasDateRange(): boolean {
    return !!(this.dateRange.startDate || this.dateRange.endDate);
  }
}

