import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemService } from '../../_services/item.service';
import { CategoryService } from '../../_services/category.service';
import { BrandService } from '../../_services/brand.service';

@Component({
  selector: 'app-item-edit',
  templateUrl: './item-edit.component.html'
})
export class ItemEditComponent implements OnInit {
  form!: FormGroup;
  categories: any[] = [];
  brands: any[] = [];
  id?: number;
  title = 'Add Item';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    // Initialize form
    this.form = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      brandId: ['', Validators.required], // NEW
      description: ['']
    });

    // Load categories and brands
    this.loadCategories();
    this.loadBrands();

    // If editing, load existing item
    if (this.id) {
      this.title = 'Edit Item';
      this.itemService.getById(this.id).subscribe(item => {
        this.form.patchValue(item);
      });
    }
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => (this.categories = data));
  }

  loadBrands() {
    this.brandService.getAll().subscribe(data => (this.brands = data));
  }

  save() {
    if (this.form.invalid) return;

    const saveOperation = this.id
      ? this.itemService.update(this.id, this.form.value)
      : this.itemService.create(this.form.value);

    saveOperation.subscribe(() => {
      this.router.navigate(['/add/item']); // Go back to item list
    });
  }
}
