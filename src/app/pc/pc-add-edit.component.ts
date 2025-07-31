import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { PCService, ItemService, StorageLocationService, AlertService } from '../_services';
import { PC, SpecificationField } from '../_models/pc';

@Component({ templateUrl: 'pc-add-edit.component.html' })
export class PCAddEditComponent implements OnInit {
    form: FormGroup;
    id: number;
    isAddMode: boolean;
    isViewMode: boolean;
    loading = false;
    submitted = false;
    items: any[] = [];
    roomLocations: any[] = [];
    specificationFields: SpecificationField[] = [];
    selectedItem: any = null;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private pcService: PCService,
        private itemService: ItemService,
        private storageLocationService: StorageLocationService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        this.isViewMode = this.router.url.includes('/view/');

        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            serialNumber: [''],
            itemId: ['', Validators.required],
            roomLocationId: ['', Validators.required],
            specifications: [''],
            status: ['Active', Validators.required],
            assignedTo: [''],
            notes: ['']
        });

        this.loadItems();
        this.loadRoomLocations();

        if (!this.isAddMode) {
            this.loadPC();
        }

        // Disable form in view mode
        if (this.isViewMode) {
            this.form.disable();
        }
    }

    loadItems() {
        this.itemService.getAll()
            .pipe(first())
            .subscribe(items => {
                this.items = items;
            });
    }

    loadRoomLocations() {
        this.storageLocationService.getAll()
            .pipe(first())
            .subscribe(locations => {
                this.roomLocations = locations;
            });
    }

    loadPC() {
        this.pcService.getById(this.id)
            .pipe(first())
            .subscribe(pc => {
                this.form.patchValue(pc);
                this.selectedItem = this.items.find(item => item.id === pc.itemId);
                if (this.selectedItem) {
                    this.loadSpecificationFields(this.selectedItem.categoryId);
                }
            });
    }

    onItemChange() {
        const itemId = this.form.get('itemId').value;
        this.selectedItem = this.items.find(item => item.id === itemId);
        if (this.selectedItem) {
            this.loadSpecificationFields(this.selectedItem.categoryId);
        }
    }

    loadSpecificationFields(categoryId: number) {
        this.pcService.getSpecificationFields(categoryId)
            .pipe(first())
            .subscribe(fields => {
                this.specificationFields = fields;
                // Add form controls for specification fields
                fields.forEach(field => {
                    if (!this.form.contains(field.fieldName)) {
                        this.form.addControl(field.fieldName, this.formBuilder.control(''));
                    }
                });
            });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        const pc = this.form.value;

        if (this.isAddMode) {
            this.createPC(pc);
        } else {
            this.updatePC(pc);
        }
    }

    private createPC(pc: PC) {
        this.pcService.create(pc)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('PC created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updatePC(pc: PC) {
        this.pcService.update(this.id, pc)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('PC updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 