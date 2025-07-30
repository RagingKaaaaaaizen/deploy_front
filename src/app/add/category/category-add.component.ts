import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../_services/category.service';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html'
})
export class CategoryAddComponent {
  model: any = {};

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  saveCategory() {
    if (!this.model.name) {
      alert('Category name is required');
      return;
    }

    this.categoryService.create(this.model).subscribe({
      next: () => {
        alert('Category saved!');
        this.router.navigate(['/add']); // redirect to overview
      },
      error: (err) => {
        console.error(err);
        alert('Failed to save category');
      }
    });
  }
}
