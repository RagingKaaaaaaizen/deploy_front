import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Dispose } from '../_models';
import { RealtimeUpdateService } from './realtime-update.service';

const baseUrl = `${environment.apiUrl}/api/dispose`;

export interface DisposalValidation {
  valid: boolean;
  availableStock: number;
  totalStock?: number;
  usedInPCComponents?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DisposeService {
  constructor(
    private http: HttpClient,
    private realtimeUpdateService: RealtimeUpdateService
  ) {}

  getAll(): Observable<Dispose[]> {
    return this.http.get<Dispose[]>(baseUrl);
  }

  getById(id: number): Observable<Dispose> {
    return this.http.get<Dispose>(`${baseUrl}/${id}`);
  }

  create(dispose: Dispose): Observable<Dispose> {
    console.log('=== DISPOSE SERVICE: CREATE ===');
    console.log('URL:', baseUrl);
    console.log('Data being sent:', dispose);
    console.log('Data types:', {
      stockEntryId: typeof dispose.stockEntryId,
      quantity: typeof dispose.quantity,
      locationId: typeof dispose.locationId,
      reason: typeof dispose.reason
    });
    return this.http.post<Dispose>(baseUrl, dispose).pipe(
      tap(() => {
        // Notify that disposal data has been updated
        this.realtimeUpdateService.notifyDisposalUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  update(id: number, dispose: Partial<Dispose>): Observable<Dispose> {
    return this.http.put<Dispose>(`${baseUrl}/${id}`, dispose).pipe(
      tap(() => {
        this.realtimeUpdateService.notifyDisposalUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`).pipe(
      tap(() => {
        this.realtimeUpdateService.notifyDisposalUpdate();
        this.realtimeUpdateService.notifyAnalyticsUpdate();
      })
    );
  }

  getByItem(itemId: number): Observable<Dispose[]> {
    return this.http.get<Dispose[]>(`${baseUrl}/item/${itemId}`);
  }

  validateDisposal(itemId: number, quantity: number): Observable<DisposalValidation> {
    return this.http.post<DisposalValidation>(`${baseUrl}/validate`, { itemId, quantity });
  }

  getDisposalWithStock(disposalId: number): Observable<any> {
    return this.http.get<any>(`${baseUrl}/${disposalId}/with-stock`);
  }

  getStockWithDisposal(itemId: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/stock-with-disposal/${itemId}`);
  }

  returnToStock(disposalId: number): Observable<any> {
    return this.http.post<any>(`${baseUrl}/${disposalId}/return-to-stock`, {});
  }

  returnToStockPartial(disposalId: number, quantity: number, remarks?: string): Observable<any> {
    return this.http.post<any>(`${baseUrl}/${disposalId}/return-to-stock-partial`, { quantity, remarks });
  }
} 