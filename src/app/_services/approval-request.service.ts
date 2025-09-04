import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ApprovalRequest, CreateApprovalRequest, ApproveRequest, RejectRequest } from '@app/_models';

const baseUrl = `${environment.apiUrl}/api/approval-requests`;

@Injectable({ providedIn: 'root' })
export class ApprovalRequestService {
    constructor(private http: HttpClient) { }

    // Get all approval requests (SuperAdmin/Admin only)
    getAll(): Observable<ApprovalRequest[]> {
        return this.http.get<ApprovalRequest[]>(baseUrl);
    }

    // Get current user's approval requests
    getMyRequests(): Observable<ApprovalRequest[]> {
        return this.http.get<ApprovalRequest[]>(`${baseUrl}/my`);
    }

    // Get approval request by ID
    getById(id: number): Observable<ApprovalRequest> {
        return this.http.get<ApprovalRequest>(`${baseUrl}/${id}`);
    }

    // Create new approval request
    create(request: CreateApprovalRequest): Observable<ApprovalRequest> {
        return this.http.post<ApprovalRequest>(baseUrl, request);
    }

    // Approve request
    approve(id: number, request: ApproveRequest): Observable<ApprovalRequest> {
        return this.http.put<ApprovalRequest>(`${baseUrl}/${id}/approve`, request);
    }

    // Reject request
    reject(id: number, request: RejectRequest): Observable<ApprovalRequest> {
        return this.http.put<ApprovalRequest>(`${baseUrl}/${id}/reject`, request);
    }

    // Delete approval request
    delete(id: number): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }

    // Get pending requests count
    getPendingCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${baseUrl}/stats/pending`);
    }
}
