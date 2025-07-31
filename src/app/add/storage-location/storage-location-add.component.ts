import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageLocationService } from '../../_services/storage-location.service';
import { StorageLocation } from '../../_models/storagelocation';

@Component({
  selector: 'app-storage-location-add',
  templateUrl: './storage-location-add.component.html'
})
export class StorageLocationAddComponent {
  model: Partial<StorageLocation> = {};

  constructor(
    private storageLocationService: StorageLocationService,
    private router: Router
  ) {}

  saveLocation() {
    if (!this.model.name) {
      alert('Location name is required');
      return;
    }

    this.storageLocationService.create(this.model as StorageLocation).subscribe({
      next: () => {
        alert('Storage location added!');
        this.router.navigate(['/add/storage-locations']);
      },
      error: (err) => console.error('Failed to create location', err)
    });
  }
}
