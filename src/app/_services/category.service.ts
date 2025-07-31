import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/categories`, data);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/categories/${id}`);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/categories/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/categories/${id}`);
  }
}
