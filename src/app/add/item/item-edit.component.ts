import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';
import { BrandService } from '../../_services/brand.service';
import { AlertService } from '../../_services/alert.service';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html',
  styles: [`
    .form-container {
      padding: 20px 0;
    }

    .page-header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .header-title i {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin: 0 0 5px 0;
    }

    .page-subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .form-card:hover {
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .card {
      border: none;
      border-radius: 12px;
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .card-body {
      padding: 30px;
    }

    .item-form {
      max-width: 100%;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .form-label i {
      margin-right: 8px;
      color: #667eea;
      width: 16px;
    }

    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background-color: #fff;
    }

    .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      outline: none;
    }

    .form-control.is-invalid {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    .form-control:disabled,
    .form-control[readonly] {
      background-color: #f8f9fa;
      opacity: 0.8;
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 25px;
    }

    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 5px;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      color: white;
    }

    .btn-primary:disabled {
      background: #6c757d;
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    .btn-outline-secondary {
      border-color: #6c757d;
      color: #6c757d;
      background: transparent;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .form-actions {
        flex-direction: column;
        gap: 10px;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 2rem;
      }

      .card-body {
        padding: 20px;
      }
    }
  `]
})
export class ItemEditComponent implements OnInit {
  form: FormGroup;
  id: number;
  isViewMode: boolean;
  loading = false;
  submitted = false;
  categories: any[] = [];
  brands: any[] = [];
  title: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isViewMode = this.route.snapshot.data['viewMode'] || false;
    this.title = this.isViewMode ? 'View Item' : (this.id ? 'Edit Item' : 'Add Item');

    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      brandId: ['', Validators.required],
      description: ['']
    });

    this.loadCategories();
    this.loadBrands();

    if (this.id) {
      this.loadItem();
    }
  }

  loadItem() {
    this.loading = true;
    this.itemService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (item) => {
          this.form.patchValue({
            name: item.name,
            categoryId: item.categoryId,
            brandId: item.brandId,
            description: item.description
          });
          this.loading = false;
        },
        error: (error) => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  loadCategories() {
    this.categoryService.getAll()
      .pipe(first())
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadBrands() {
    this.brandService.getAll()
      .pipe(first())
      .subscribe({
        next: (brands) => {
          this.brands = brands;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const item = this.form.value;

    if (this.id) {
      this.itemService.update(this.id, item)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Item updated successfully');
            this.router.navigate(['/add/item']);
          },
          error: (error) => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    } else {
      this.itemService.create(item)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Item created successfully');
            this.router.navigate(['/add/item']);
          },
          error: (error) => {
            this.alertService.error(error);
            this.loading = false;
          }
        });
    }
  }
}
