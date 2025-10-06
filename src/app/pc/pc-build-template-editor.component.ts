import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import {
    PCBuildTemplateService,
    CategoryService,
    ItemService,
    AlertService
} from '@app/_services';
import { PCBuildTemplate, PCBuildTemplateComponent } from '@app/_models';

@Component({
    selector: 'app-pc-build-template-editor',
    templateUrl: './pc-build-template-editor.component.html'
})
export class PCBuildTemplateEditorComponent implements OnInit, AfterViewInit {
    form: FormGroup;
    templateId: number;
    isAddMode: boolean;
    loading = false;
    submitted = false;

    categories: any[] = [];
    items: any[] = [];
    selectedComponents: PCBuildTemplateComponent[] = [];
    enableStickyUi = true;

    @ViewChildren('componentsHeader, templateInfoCard, componentRow') stickyEls!: QueryList<ElementRef<HTMLElement>>;
    private componentsContainerEl?: HTMLElement;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private templateService: PCBuildTemplateService,
        private categoryService: CategoryService,
        private itemService: ItemService,
        private alertService: AlertService
    ) {
        this.form = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
        });
    }

    ngOnInit() {
        this.templateId = this.route.snapshot.params['id'];
        this.isAddMode = !this.templateId;

        this.loadCategories();
        this.loadItems();

        if (!this.isAddMode) {
            this.loadTemplate();
        }
        // Check profile preference (localStorage flag can be toggled from Profile)
        const pref = localStorage.getItem('ui.stickyTemplateEditor');
        this.enableStickyUi = pref !== 'false';
    }

    ngAfterViewInit(): void {
        // Capture container to scroll to component list on add
        setTimeout(() => {
            const header = (this.stickyEls?.find((ref: any) => ref.nativeElement?.classList.contains('card-header')) as any)?.nativeElement as HTMLElement;
            this.componentsContainerEl = header?.parentElement as HTMLElement;
        });
    }

    loadCategories() {
        this.categoryService.getAll()
            .pipe(first())
            .subscribe({
                next: (categories) => {
                    this.categories = categories;
                },
                error: (error) => {
                    this.alertService.error('Error loading categories: ' + error);
                }
            });
    }

    loadItems() {
        this.itemService.getAll()
            .pipe(first())
            .subscribe({
                next: (items) => {
                    this.items = items;
                },
                error: (error) => {
                    this.alertService.error('Error loading items: ' + error);
                }
            });
    }

    loadTemplate() {
        this.templateService.getById(this.templateId)
            .pipe(first())
            .subscribe({
                next: (template) => {
                    this.form.patchValue({
                        name: template.name,
                        description: template.description
                    });
                    this.selectedComponents = template.components || [];
                },
                error: (error) => {
                    this.alertService.error('Error loading template: ' + error);
                }
            });
    }

    addComponent() {
        this.selectedComponents.push({
            categoryId: null,
            itemId: null,
            quantity: 1,
            remarks: ''
        });
        // Auto-scroll newly added component into view if header is out of viewport
        setTimeout(() => {
            if (!this.enableStickyUi) return;
            const lastRow = this.getLastComponentRow();
            if (lastRow) {
                const rect = lastRow.getBoundingClientRect();
                const inView = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
                if (!inView) {
                    lastRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    removeComponent(index: number) {
        this.selectedComponents.splice(index, 1);
    }

    getItemsByCategory(categoryId: number) {
        return this.items.filter(item => item.categoryId === categoryId);
    }

    getCategoryName(categoryId: number): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : '';
    }

    getItemName(itemId: number): string {
        const item = this.items.find(i => i.id === itemId);
        return item ? item.name : '';
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            this.alertService.error('Please fill in all required fields');
            return;
        }

        if (this.selectedComponents.length === 0) {
            this.alertService.error('Please add at least one component');
            return;
        }

        // Validate components
        for (const comp of this.selectedComponents) {
            if (!comp.categoryId || !comp.itemId) {
                this.alertService.error('Please complete all component selections');
                return;
            }
        }

        // Check for duplicate categories
        const categoryIds = this.selectedComponents.map(c => c.categoryId);
        const uniqueCategories = [...new Set(categoryIds)];
        if (categoryIds.length !== uniqueCategories.length) {
            this.alertService.error('Cannot have multiple components from the same category');
            return;
        }

        this.loading = true;

        const templateData: PCBuildTemplate = {
            name: this.form.value.name,
            description: this.form.value.description,
            components: this.selectedComponents
        };

        if (this.isAddMode) {
            this.createTemplate(templateData);
        } else {
            this.updateTemplate(templateData);
        }
    }

    private createTemplate(template: PCBuildTemplate) {
        this.templateService.create(template)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Template created successfully');
                    this.router.navigate(['/pc/templates']);
                },
                error: (error) => {
                    this.alertService.error('Error creating template: ' + error);
                    this.loading = false;
                }
            });
    }

    private updateTemplate(template: PCBuildTemplate) {
        this.templateService.update(this.templateId, template)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Template updated successfully');
                    this.router.navigate(['/pc/templates']);
                },
                error: (error) => {
                    this.alertService.error('Error updating template: ' + error);
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.router.navigate(['/pc/templates']);
    }

    private getLastComponentRow(): HTMLElement | null {
        const rows = (this.stickyEls || new QueryList<ElementRef<HTMLElement>>())
            .toArray()
            .map(r => r.nativeElement)
            .filter(el => el.classList.contains('component-row'));
        return rows.length ? rows[rows.length - 1] : null;
    }
}

