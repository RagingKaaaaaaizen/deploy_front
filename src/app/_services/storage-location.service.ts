import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { StorageLocation } from '../_models/storagelocation';

@Injectable({ providedIn: 'root' })
export class StorageLocationService {
  private baseUrl = `${environment.apiUrl}/storage-locations`;

  constructor(private http: HttpClient) {}

  /** Get all storage locations */
  getAll(): Observable<StorageLocation[]> {
    return this.http.get<StorageLocation[]>(this.baseUrl);
  }

  /** Get a storage location by ID */
  getById(id: number): Observable<StorageLocation> {
    return this.http.get<StorageLocation>(`${this.baseUrl}/${id}`);
  }

  /** Create new storage location */
  create(location: StorageLocation): Observable<StorageLocation> {
    return this.http.post<StorageLocation>(this.baseUrl, location);
  }

  /** Update existing storage location */
  update(id: number, location: StorageLocation): Observable<StorageLocation> {
    return this.http.put<StorageLocation>(`${this.baseUrl}/${id}`, location);
  }

  /** Delete storage location */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
