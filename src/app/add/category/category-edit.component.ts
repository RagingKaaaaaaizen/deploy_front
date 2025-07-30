import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../_services/category.service';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html'
})
export class CategoryEditComponent implements OnInit {
  category: any = { name: '', description: '' };
  isEdit = false;
  id!: number;

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.isEdit = !!this.id;

    if (this.isEdit) {
      this.categoryService.getById(this.id).subscribe(data => this.category = data);
    }
  }

  onSubmit() {
    if (this.isEdit) {
      this.categoryService.update(this.id, this.category).subscribe(() => {
        this.router.navigate(['/add/category']);
      });
    } else {
      this.categoryService.create(this.category).subscribe(() => {
        this.router.navigate(['/add/category']);
      });
    }
  }
}
