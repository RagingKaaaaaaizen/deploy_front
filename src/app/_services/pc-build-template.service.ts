import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
    PCBuildTemplate, 
    PCTemplateComparison, 
    ApplyTemplateOptions, 
    TemplateStats 
} from '@app/_models/pc-build-template';

const baseUrl = `${environment.apiUrl}/api/pc-build-templates`;

@Injectable({ providedIn: 'root' })
export class PCBuildTemplateService {
    constructor(private http: HttpClient) {}

    // Get all templates
    getAll(): Observable<PCBuildTemplate[]> {
        return this.http.get<PCBuildTemplate[]>(baseUrl);
    }

    // Get template by ID
    getById(id: number): Observable<PCBuildTemplate> {
        return this.http.get<PCBuildTemplate>(`${baseUrl}/${id}`);
    }

    // Create new template
    create(template: PCBuildTemplate): Observable<PCBuildTemplate> {
        return this.http.post<PCBuildTemplate>(baseUrl, template);
    }

    // Update template
    update(id: number, template: Partial<PCBuildTemplate>): Observable<PCBuildTemplate> {
        return this.http.put<PCBuildTemplate>(`${baseUrl}/${id}`, template);
    }

    // Delete template
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }

    // Duplicate template
    duplicate(id: number, newName: string): Observable<PCBuildTemplate> {
        return this.http.post<PCBuildTemplate>(`${baseUrl}/${id}/duplicate`, { newName });
    }

    // Compare PC with template
    comparePC(pcId: number, templateId: number): Observable<PCTemplateComparison> {
        return this.http.post<PCTemplateComparison>(`${baseUrl}/compare/${pcId}/${templateId}`, {});
    }

    // Compare multiple PCs with template
    comparePCs(pcIds: number[], templateId: number): Observable<PCTemplateComparison[]> {
        return this.http.post<PCTemplateComparison[]>(`${baseUrl}/compare-bulk`, { pcIds, templateId });
    }

    // Apply template to PC
    applyTemplate(pcId: number, templateId: number, options: ApplyTemplateOptions): Observable<any> {
        return this.http.post(`${baseUrl}/apply/${pcId}/${templateId}`, { options });
    }

    // Get template statistics
    getStats(templateId: number): Observable<TemplateStats> {
        return this.http.get<TemplateStats>(`${baseUrl}/${templateId}/stats`);
    }
}

