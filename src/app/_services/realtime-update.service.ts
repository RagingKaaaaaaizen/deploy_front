import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeUpdateService {
  private stockUpdateSubject = new BehaviorSubject<Date>(new Date());
  private disposalUpdateSubject = new BehaviorSubject<Date>(new Date());
  private analyticsUpdateSubject = new BehaviorSubject<Date>(new Date());

  constructor() { }

  // Stock update notifications
  notifyStockUpdate(): void {
    this.stockUpdateSubject.next(new Date());
  }

  getStockUpdateObservable(): Observable<Date> {
    return this.stockUpdateSubject.asObservable();
  }

  // Disposal update notifications
  notifyDisposalUpdate(): void {
    this.disposalUpdateSubject.next(new Date());
  }

  getDisposalUpdateObservable(): Observable<Date> {
    return this.disposalUpdateSubject.asObservable();
  }

  // Analytics update notifications
  notifyAnalyticsUpdate(): void {
    this.analyticsUpdateSubject.next(new Date());
  }

  getAnalyticsUpdateObservable(): Observable<Date> {
    return this.analyticsUpdateSubject.asObservable();
  }

  // General update notification
  notifyDataUpdate(): void {
    const now = new Date();
    this.stockUpdateSubject.next(now);
    this.disposalUpdateSubject.next(now);
    this.analyticsUpdateSubject.next(now);
  }
}
