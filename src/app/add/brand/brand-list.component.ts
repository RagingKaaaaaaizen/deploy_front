import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BrandService } from '../../_services/brand.service';
import { Brand } from '../../_models/brand';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html'
})
export class BrandListComponent implements OnInit {
  brands: Brand[] = [];

  constructor(private brandService: BrandService, private router: Router) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getAll().subscribe(data => (this.brands = data));
  }

  addBrand() {
    this.router.navigate(['/add/brand/add']);
  }

  editBrand(id: number) {
    this.router.navigate(['/add/brand/edit', id]);
  }

  deleteBrand(id: number) {
    if (confirm('Are you sure you want to delete this brand?')) {
      this.brandService.delete(id).subscribe(() => this.loadBrands());
    }
  }
}
