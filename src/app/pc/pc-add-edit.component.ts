import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { PCService, RoomLocationService, AlertService, PCComponentService } from '@app/_services';
import { PC, PCComponent } from '../_models';

@Component({ templateUrl: 'pc-add-edit.component.html' })
export class PCAddEditComponent implements OnInit {
    form: FormGroup;
    id: number;
    isAddMode: boolean;
    isViewMode: boolean;
    loading = false;
    submitted = false;
    roomLocations: any[] = [];
    pcComponents: PCComponent[] = [];
    totalPCCost: number = 0;
    loadingComponents = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private pcService: PCService,
        private roomLocationService: RoomLocationService,
        private alertService: AlertService,
        private pcComponentService: PCComponentService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        // Check if URL is /pc/:id (view mode) or /pc/edit/:id (edit mode)
        this.isViewMode = this.router.url.includes('/pc/') && !this.router.url.includes('/edit/') && !this.router.url.includes('/add');
        
        console.log('PC Add/Edit Component - ID:', this.id, 'isAddMode:', this.isAddMode, 'isViewMode:', this.isViewMode, 'URL:', this.router.url);

        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            serialNumber: [''],
            roomLocationId: ['', Validators.required],
            status: ['Active', Validators.required],
            assignedTo: [''],
            notes: ['']
        });

        this.loadRoomLocations();

        // Only load PC if we have a valid ID and we're not in add mode
        if (!this.isAddMode && this.id) {
            this.loadPC();
        }

        // Load PC components and calculate cost for view mode
        if (this.isViewMode && this.id) {
            this.loadPCComponents();
        }

        // Disable form in view mode
        if (this.isViewMode) {
            this.form.disable();
        }
    }

    loadRoomLocations() {
        this.roomLocationService.getAll()
            .pipe(first())
            .subscribe(locations => {
                this.roomLocations = locations;
            });
    }

    loadPC() {
        console.log('Loading PC with ID:', this.id);
        this.pcService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: (pc) => {
                    console.log('PC loaded for editing:', pc);
                    this.form.patchValue(pc);
                },
                error: (error) => {
                    console.error('Error loading PC:', error);
                    this.alertService.error('Error loading PC data');
                }
            });
    }

    get f() { return this.form.controls; }

    canSubmit(): boolean {
        return this.form.valid;
    }

    goToStock() {
        this.router.navigate(['/stocks']);
    }

    loadPCComponents() {
        if (!this.id) return;
        
        this.loadingComponents = true;
        this.pcComponentService.getByPCId(this.id)
            .pipe(first())
            .subscribe({
                next: (components) => {
                    this.pcComponents = components;
                    this.calculateTotalCost();
                    this.loadingComponents = false;
                },
                error: (error) => {
                    console.error('Error loading PC components:', error);
                    this.loadingComponents = false;
                }
            });
    }

    calculateTotalCost() {
        this.totalPCCost = this.pcComponents.reduce((total, component) => {
            return total + (component.totalPrice || 0);
        }, 0);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    onSubmit() {
        this.submitted = true;
        console.log('PC Add Form Submitted:', this.form.value);
        console.log('Form Valid:', this.form.valid);
        console.log('Can Submit:', this.canSubmit());

        if (!this.canSubmit()) {
            console.log('Form validation failed');
            return;
        }

        this.loading = true;
        const pcData = this.form.value;
        console.log('PC Data to send:', pcData);

        if (this.isAddMode) {
            this.createPC(pcData);
        } else {
            this.updatePC(pcData);
        }
    }

    private createPC(pcData: any) {
        console.log('Creating PC with data:', pcData);
        this.pcService.create(pcData)
            .pipe(first())
            .subscribe({
                next: (pc) => {
                    console.log('PC created successfully:', pc);
                    this.alertService.success('PC created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    console.error('Error creating PC:', error);
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updatePC(pcData: any) {
        this.pcService.update(this.id, pcData)
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