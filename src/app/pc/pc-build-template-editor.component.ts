import { Component, OnInit } from '@angular/core';
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
export class PCBuildTemplateEditorComponent implements OnInit {
    form: FormGroup;
    templateId: number;
    isAddMode: boolean;
    loading = false;
    submitted = false;

    categories: any[] = [];
    items: any[] = [];
    selectedComponents: PCBuildTemplateComponent[] = [];

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
            categoryId: 0,
            itemId: 0,
            quantity: 1,
            remarks: ''
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
}

