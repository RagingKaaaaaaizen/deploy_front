import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageLocationService } from '../../_services/storage-location.service';
import { StorageLocation } from '../../_models/storagelocation';

@Component({
  selector: 'app-storage-location-edit',
  templateUrl: './storage-location-edit.component.html'
})
export class StorageLocationEditComponent implements OnInit {
  model: Partial<StorageLocation> = {};
  id?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageLocationService: StorageLocationService
  ) {}

  ngOnInit() {
    this.id = +this.route.snapshot.params['id'];
    if (this.id) {
      this.storageLocationService.getById(this.id).subscribe({
        next: (data) => (this.model = data),
        error: (err) => console.error('Failed to load location', err)
      });
    }
  }

  saveLocation() {
    if (!this.model.name) {
      alert('Location name is required');
      return;
    }

    this.storageLocationService.update(this.id!, this.model as StorageLocation).subscribe({
      next: () => {
        alert('Storage location updated!');
        this.router.navigate(['/add/storage-locations']);
      },
      error: (err) => console.error('Failed to update location', err)
    });
  }
}
