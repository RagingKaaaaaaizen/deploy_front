import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { Brand } from '../_models/brand';

const baseUrl = `${environment.apiUrl}/brand`;

@Injectable({ providedIn: 'root' })
export class BrandService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Brand[]> {
    return this.http.get<Brand[]>(baseUrl);
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${baseUrl}/${id}`);
  }

  create(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(baseUrl, brand);
  }

  update(id: number, brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(`${baseUrl}/${id}`, brand);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/${id}`);
  }
}
