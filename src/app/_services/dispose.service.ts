import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

const baseUrl = `${environment.apiUrl}/api/dispose`;

export interface Dispose {
  id?: number;
  itemId: number;
  quantity: number;
  disposalValue: number;
  totalValue?: number; // Optional for creation
  locationId: number;
  reason?: string;
  disposalDate: Date;
  createdBy?: number; // Optional for creation
  item?: { id: number; name: string; category?: { name: string }; brand?: { name: string } };
  location?: { id: number; name: string };
  user?: { id: number; firstName: string; lastName: string };
}

export interface DisposalValidation {
  valid: boolean;
  availableStock: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DisposeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Dispose[]> {
    return this.http.get<Dispose[]>(baseUrl);
  }

  getById(id: number): Observable<Dispose> {
    return this.http.get<Dispose>(`${baseUrl}/${id}`);
  }

  create(dispose: Dispose): Observable<Dispose> {
    return this.http.post<Dispose>(baseUrl, dispose);
  }

  update(id: number, dispose: Partial<Dispose>): Observable<Dispose> {
    return this.http.put<Dispose>(`${baseUrl}/${id}`, dispose);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
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
} 