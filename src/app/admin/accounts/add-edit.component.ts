import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';
import { Role } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form: UntypedFormGroup;
    id: string;
    isAddMode: boolean;
    isViewMode = false;
    loading = false;
    submitted = false;
    Role = Role;
    showPassword = false;
    showConfirmPassword = false;
    temporaryPassword: string | null = null;
    generatingPassword = false;

    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        this.isViewMode = this.router.url.includes('/view/');

        // Password and confirmPassword are required in add mode, optional in edit mode
        const passwordValidators = this.isAddMode 
            ? [Validators.required, Validators.minLength(6)] 
            : [Validators.minLength(6)];
        
        const confirmPasswordValidators = this.isAddMode 
            ? [Validators.required] 
            : [];

        this.form = this.formBuilder.group({
            title: ['Mr', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: [Role.Viewer, Validators.required],    
            status: ['Active', Validators.required], 
            password: ['', passwordValidators],
            confirmPassword: ['', confirmPasswordValidators]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });

        if (!this.isAddMode) {
            this.accountService.getById(this.id)
                .pipe(first())
                .subscribe(x => {
                    // Patch form without password fields
                    this.form.patchValue(x);
                });
        }

        // Disable form in view mode
        if (this.isViewMode) {
            this.form.disable();
        }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createAccount();
        } else {
            this.updateAccount();
        }
    }

    private createAccount() {
        this.accountService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateAccount() {
        this.accountService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Account Updated successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    generateTemporaryPassword() {
        this.generatingPassword = true;
        
        // Generate a random password (8-12 characters, mix of letters and numbers)
        const length = 10;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Update the user's password
        const updateData = { password: password };
        this.accountService.update(this.id, updateData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.temporaryPassword = password;
                    this.generatingPassword = false;
                    this.alertService.success('Temporary password generated successfully!', { autoClose: true });
                },
                error: error => {
                    this.alertService.error('Error generating password: ' + error);
                    this.generatingPassword = false;
                }
            });
    }

    copyPassword() {
        if (this.temporaryPassword) {
            navigator.clipboard.writeText(this.temporaryPassword).then(() => {
                this.alertService.success('Password copied to clipboard!', { autoClose: true });
            }).catch(() => {
                this.alertService.error('Failed to copy password');
            });
        }
    }
}