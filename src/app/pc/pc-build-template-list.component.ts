import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { PCBuildTemplateService, AlertService, AccountService } from '@app/_services';
import { PCBuildTemplate, Role } from '@app/_models';

@Component({
    selector: 'app-pc-build-template-list',
    templateUrl: './pc-build-template-list.component.html',
    styleUrls: ['./pc-build-template-list.component.css']
})
export class PCBuildTemplateListComponent implements OnInit {
    Role = Role;
    templates: PCBuildTemplate[] = [];
    filteredTemplates: PCBuildTemplate[] = [];
    searchTerm = '';
    loading = false;

    constructor(
        private router: Router,
        private templateService: PCBuildTemplateService,
        private alertService: AlertService,
        public accountService: AccountService
    ) {}

    ngOnInit() {
        this.loadTemplates();
    }

    loadTemplates() {
        this.loading = true;
        this.templateService.getAll()
            .pipe(first())
            .subscribe({
                next: (templates) => {
                    this.templates = templates;
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading templates: ' + error);
                    this.loading = false;
                }
            });
    }

    applyFilters() {
        if (this.searchTerm) {
            this.filteredTemplates = this.templates.filter(t =>
                t.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                (t.description || '').toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        } else {
            this.filteredTemplates = [...this.templates];
        }
    }

    onSearch() {
        this.applyFilters();
    }

    addTemplate() {
        this.router.navigate(['/pc/templates/add']);
    }

    viewTemplate(id: number) {
        this.router.navigate(['/pc/templates', id]);
    }

    editTemplate(id: number) {
        this.router.navigate(['/pc/templates', id, 'edit']);
    }

    duplicateTemplate(template: PCBuildTemplate) {
        const newName = prompt(`Enter name for duplicated template:`, `${template.name} (Copy)`);
        if (newName && newName.trim()) {
            this.templateService.duplicate(template.id!, newName.trim())
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Template duplicated successfully');
                        this.loadTemplates();
                    },
                    error: (error) => {
                        this.alertService.error('Error duplicating template: ' + error);
                    }
                });
        }
    }

    deleteTemplate(template: PCBuildTemplate) {
        if (confirm(`Are you sure you want to delete template "${template.name}"?`)) {
            this.templateService.delete(template.id!)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Template deleted successfully');
                        this.loadTemplates();
                    },
                    error: (error) => {
                        this.alertService.error('Error deleting template: ' + error);
                    }
                });
        }
    }

    viewStats(template: PCBuildTemplate) {
        this.router.navigate(['/pc/templates', template.id, 'stats']);
    }

    hasRole(roles: Role[]): boolean {
        const account = this.accountService.accountValue;
        if (!account) return false;
        return roles.some(role => role === account.role);
    }
}

