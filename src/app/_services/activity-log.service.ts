import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ActivityLog } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
    private baseUrl = `${environment.apiUrl}/api/activity-logs`;

    constructor(private http: HttpClient) { }

    getMyActivity(limit = 50, offset = 0, filters?: any): Observable<ActivityLog[]> {
        let params = `limit=${limit}&offset=${offset}`;
        if (filters?.entityType) params += `&entityType=${filters.entityType}`;
        if (filters?.action) params += `&action=${filters.action}`;
        if (filters?.dateRange?.startDate) {
            params += `&startDate=${filters.dateRange.startDate.toISOString()}`;
        }
        if (filters?.dateRange?.endDate) {
            params += `&endDate=${filters.dateRange.endDate.toISOString()}`;
        }
        
        const url = `${this.baseUrl}/my-activity?${params}`;
        console.log('Fetching activity logs from:', url);
        return this.http.get<ActivityLog[]>(url);
    }

    getUserActivity(userId: number, limit = 50, offset = 0, filters?: any): Observable<ActivityLog[]> {
        let params = `limit=${limit}&offset=${offset}`;
        if (filters?.entityType) params += `&entityType=${filters.entityType}`;
        if (filters?.action) params += `&action=${filters.action}`;
        if (filters?.dateRange?.startDate) {
            params += `&startDate=${filters.dateRange.startDate.toISOString()}`;
        }
        if (filters?.dateRange?.endDate) {
            params += `&endDate=${filters.dateRange.endDate.toISOString()}`;
        }
        
        return this.http.get<ActivityLog[]>(`${this.baseUrl}/user/${userId}?${params}`);
    }

    getAllActivity(limit = 100, offset = 0, filters?: any): Observable<ActivityLog[]> {
        let params = `limit=${limit}&offset=${offset}`;
        if (filters?.userId) params += `&userId=${filters.userId}`;
        if (filters?.entityType) params += `&entityType=${filters.entityType}`;
        if (filters?.action) params += `&action=${filters.action}`;
        if (filters?.dateRange?.startDate) {
            params += `&startDate=${filters.dateRange.startDate.toISOString()}`;
        }
        if (filters?.dateRange?.endDate) {
            params += `&endDate=${filters.dateRange.endDate.toISOString()}`;
        }
        
        return this.http.get<ActivityLog[]>(`${this.baseUrl}?${params}`);
    }

    getEntityActivity(entityType: string, entityId: number, limit = 50): Observable<ActivityLog[]> {
        return this.http.get<ActivityLog[]>(`${this.baseUrl}/entity/${entityType}/${entityId}?limit=${limit}`);
    }

    getActivityByDateRange(startDate: string, endDate: string, limit = 100, offset = 0): Observable<ActivityLog[]> {
        const params = `startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`;
        return this.http.get<ActivityLog[]>(`${this.baseUrl}/date-range?${params}`);
    }
}
