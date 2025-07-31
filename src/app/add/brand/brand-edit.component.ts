import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../_services/brand.service';

@Component({
  selector: 'app-brand-edit',
  templateUrl: './brand-edit.component.html'
})
export class BrandEditComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  title = 'Add Brand';
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private brandService: BrandService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });

    if (this.id) {
      this.title = 'Edit Brand';
      this.brandService.getById(this.id).subscribe(x => this.form.patchValue(x));
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    if (this.id) {
      this.brandService.update(this.id, this.form.value)
        .subscribe({
          next: () => this.router.navigate(['/add/brand']),
          error: error => {
            this.loading = false;
            console.error(error);
          }
        });
    } else {
      this.brandService.create(this.form.value)
        .subscribe({
          next: () => this.router.navigate(['/add/brand']),
          error: error => {
            this.loading = false;
            console.error(error);
          }
        });
    }
  }
  

  // Go back to brand list
  goBack() {
    this.router.navigate(['/add/brand']);
  }
}
