import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageLocationService } from '../../_services/storage-location.service';
import { StorageLocation } from '../../_models/storagelocation';

@Component({
  selector: 'app-storage-location-list',
  templateUrl: './storage-location-list.component.html'
})
export class StorageLocationListComponent implements OnInit {
  locations: StorageLocation[] = [];

  constructor(
    private storageLocationService: StorageLocationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.storageLocationService.getAll().subscribe({
      next: (data) => (this.locations = data),
      error: (err) => console.error('Failed to load locations', err)
    });
  }

  addLocation() {
    this.router.navigate(['/add/storage-locations/add']);
  }

  editLocation(id: number) {
    this.router.navigate(['/add/storage-locations/edit', id]);
  }

  deleteLocation(id: number) {
    if (confirm('Are you sure you want to delete this location?')) {
      this.storageLocationService.delete(id).subscribe({
        next: () => {
          alert('Location deleted');
          this.loadLocations();
        },
        error: (err) => console.error('Failed to delete location', err)
      });
    }
  }
}
