import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Stock } from '../_models/stock';
import { RealtimeUpdateService } from './realtime-update.service';

const baseUrl = `${environment.apiUrl}/api/stocks`;

@Injectable({ providedIn: 'root' })
export class StockService {
  constructor(
    private http: HttpClient,
    private realtimeUpdateService: RealtimeUpdateService
  ) {}

  getAll(): Observable<Stock[]> {
    return this.http.get<Stock[]>(baseUrl);
  }

  getById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${baseUrl}/${id}`);
  }

  create(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(baseUrl, stock).pipe(
      tap(() => {
        // Notify that stock data has been updated
        this.realtimeUpdateService.notifyStockUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  update(id: number, stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${baseUrl}/${id}`, stock).pipe(
      tap(() => {
        this.realtimeUpdateService.notifyStockUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`).pipe(
      tap(() => {
        this.realtimeUpdateService.notifyStockUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  getAvailableStock(itemId: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/available/${itemId}`);
  }
}
