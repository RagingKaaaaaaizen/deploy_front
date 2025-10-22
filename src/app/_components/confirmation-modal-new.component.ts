import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal-new',
  template: `
    <!-- Modal Overlay - Fixed positioning for popup -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
         *ngIf="isVisible"
         (click)="!isLoading && onCancel()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden" 
           (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center mr-4 text-xl">
                <i class="fas fa-check-circle"></i>
              </div>
              <div>
                <h4 class="text-xl font-bold text-white">{{ title }}</h4>
                <p class="text-white/80 text-sm">{{ message }}</p>
              </div>
            </div>
            <button type="button" class="text-white/80 hover:text-white text-2xl" (click)="onCancel()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          <!-- Items Summary -->
          <div class="items-summary mt-4" *ngIf="items && items.length > 0">
            <h5><i class="fas fa-list"></i> Items to Add ({{ items.length }} item{{ items.length > 1 ? 's' : '' }}):</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of items; let i = index">
                    <td>
                      <strong>{{ getItemName(item.itemId) }}</strong>
                      <br>
                      <small class="text-muted">{{ getItemCategory(item.itemId) }}</small>
                    </td>
                    <td>{{ item.quantity }}</td>
                    <td>₱{{ item.price | number:'1.2-2' }}</td>
                    <td class="text-success font-weight-bold">₱{{ (item.quantity * item.price) | number:'1.2-2' }}</td>
                    <td>{{ getLocationName(item.locationId) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Total Value -->
            <div class="mt-3 p-3 bg-success text-white rounded">
              <strong>TOTAL VALUE ({{ items.length }} ITEM{{ items.length > 1 ? 'S' : '' }}): ₱{{ getTotalValue() | number:'1.2-2' }}</strong>
            </div>
          </div>

          <!-- Role-specific message -->
          <div class="alert mt-3" [ngClass]="alertClass">
            <i [class]="alertIcon"></i>
            {{ roleMessage }}
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button type="button" 
                  class="inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300" 
                  (click)="onCancel()">
            <i class="fas fa-times mr-2"></i> Cancel
          </button>
          <button type="button" 
                  class="inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold transition bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed" 
                  [disabled]="isLoading"
                  (click)="onConfirm()">
            <div *ngIf="isLoading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            <i *ngIf="!isLoading" class="fas fa-paper-plane mr-2"></i> 
            <span *ngIf="!isLoading">{{ confirmText }}</span>
            <span *ngIf="isLoading">Processing...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .items-summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e9ecef;
    }
    
    .table {
      margin-bottom: 0;
    }
    
    .table th {
      border-top: none;
      background: #495057;
      color: white;
      font-weight: 600;
    }
    
    .table-success th {
      background: #28a745 !important;
    }
    
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid transparent;
    }
    
    .alert-warning {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }
    
    .alert-info {
      background-color: #d1ecf1;
      border-color: #bee5eb;
      color: #0c5460;
    }
  `]
})
export class ConfirmationModalNewComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() items: any[] = [];
  @Input() allItems: any[] = [];
  @Input() allLocations: any[] = [];
  @Input() userRole = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isLoading = false;
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit() {
    console.log('ConfirmationModalNewComponent initialized');
  }

  ngOnChanges() {
    console.log('ConfirmationModalNewComponent - isVisible changed to:', this.isVisible);
    console.log('ConfirmationModalNewComponent - items:', this.items);
    console.log('ConfirmationModalNewComponent - userRole:', this.userRole);
  }

  get roleMessage(): string {
    if (this.userRole === 'SuperAdmin' || this.userRole === 'Admin') {
      return 'As a ' + this.userRole + ', these items will be added directly to inventory without approval.';
    } else {
      return 'As a Staff member, these items will be sent for approval before being added to inventory.';
    }
  }

  get alertClass(): string {
    if (this.userRole === 'SuperAdmin' || this.userRole === 'Admin') {
      return 'alert-info';
    } else {
      return 'alert-warning';
    }
  }

  get alertIcon(): string {
    if (this.userRole === 'SuperAdmin' || this.userRole === 'Admin') {
      return 'fas fa-info-circle';
    } else {
      return 'fas fa-exclamation-triangle';
    }
  }

  get confirmButtonClass(): string {
    if (this.userRole === 'SuperAdmin' || this.userRole === 'Admin') {
      return 'btn-success';
    } else {
      return 'btn-warning';
    }
  }

  get confirmIcon(): string {
    if (this.userRole === 'SuperAdmin' || this.userRole === 'Admin') {
      return 'fas fa-check';
    } else {
      return 'fas fa-paper-plane';
    }
  }

  getItemName(itemId: number): string {
    const item = this.allItems.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  }

  getItemCategory(itemId: number): string {
    const item = this.allItems.find(i => i.id === itemId);
    return item && item.category ? item.category.name : 'No Category';
  }

  getLocationName(locationId: number): string {
    const location = this.allLocations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  }

  getTotalValue(): number {
    return this.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    // Prevent closing while loading
    if (this.isLoading) {
      return;
    }
    this.cancelled.emit();
  }
}
