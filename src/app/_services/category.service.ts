import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/category`, data);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/category`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/category/${id}`);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/category/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/category/${id}`);
  }
}
