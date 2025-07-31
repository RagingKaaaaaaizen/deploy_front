import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ 
    templateUrl: 'forgot-password.component.html',
    styles: [`
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }

        .auth-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            position: relative;
            overflow: hidden;
        }

        .auth-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .auth-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .auth-logo {
            margin-bottom: 20px;
        }

        .auth-logo i {
            font-size: 4rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .auth-header h1 {
            margin: 0 0 10px 0;
            font-size: 2rem;
            font-weight: bold;
            color: #333;
        }

        .auth-header p {
            margin: 0;
            color: #666;
            font-size: 1rem;
        }

        .auth-form {
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-label i {
            color: #667eea;
            font-size: 1rem;
        }

        .form-control {
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 12px 15px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: #f8f9fa;
        }

        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            background: white;
        }

        .form-control.is-invalid {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .auth-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .auth-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .auth-btn:disabled {
            opacity: 0.7;
            transform: none;
        }

        .auth-links {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .auth-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
            padding: 8px 12px;
            border-radius: 6px;
        }

        .auth-link:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #5a6fd8;
            text-decoration: none;
        }

        .auth-success {
            border-radius: 10px;
            border: none;
            background: #d4edda;
            color: #155724;
            padding: 12px 15px;
            margin-top: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .auth-error {
            border-radius: 10px;
            border: none;
            background: #f8d7da;
            color: #721c24;
            padding: 12px 15px;
            margin-top: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .invalid-feedback {
            display: block;
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .invalid-feedback i {
            font-size: 0.8rem;
        }

        /* Responsive */
        @media (max-width: 480px) {
            .auth-card {
                padding: 30px 20px;
                margin: 10px;
            }

            .auth-header h1 {
                font-size: 1.75rem;
            }
        }
    `]
})
export class ForgotPasswordComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    submitted = false;
    success = '';
    error = '';

    constructor(
        private formBuilder: UntypedFormBuilder,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.success = '';
        this.error = '';

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.alertService.clear();
        this.accountService.forgotPassword(this.f.email.value)
            .pipe(first())
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: () => {
                    this.success = 'Please check your email for password reset instructions';
                    this.alertService.success('Please check your email for password reset instructions');
                },
                error: error => {
                    this.error = error;
                    this.alertService.error(error);
                }
            });
    }
}