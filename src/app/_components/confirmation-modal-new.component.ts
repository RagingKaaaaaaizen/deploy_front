import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal-new',
  template: `
    <!-- Modal Overlay - Fixed positioning for popup -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop" 
         *ngIf="isVisible"
         (click)="!isLoading && onCancel()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden modal-shadow" 
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
                  class="inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed btn-loading" 
                  [class.btn-loading]="isLoading"
                  [disabled]="isLoading"
                  (click)="onConfirm()">
            <div *ngIf="isLoading" class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 loading-spinner"></div>
            <i *ngIf="!isLoading" class="fas fa-paper-plane mr-2 text-lg"></i> 
            <span *ngIf="!isLoading" class="font-medium">{{ confirmText }}</span>
            <span *ngIf="isLoading" class="font-medium">Processing Request...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .items-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 24px;
      border-radius: 12px;
      border: 1px solid #dee2e6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .table {
      margin-bottom: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .table th {
      border-top: none;
      background: linear-gradient(135deg, #495057 0%, #343a40 100%);
      color: white;
      font-weight: 600;
      padding: 16px 12px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table td {
      padding: 16px 12px;
      vertical-align: middle;
      border-top: 1px solid #dee2e6;
    }
    
    .table tbody tr:hover {
      background-color: #f8f9fa;
    }
    
    .table tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .table tbody tr:nth-child(even):hover {
      background-color: #e9ecef;
    }
    
    .alert {
      padding: 16px 20px;
      border-radius: 8px;
      border: 1px solid transparent;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .alert-warning {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border-color: #ffeaa7;
      color: #856404;
      box-shadow: 0 2px 4px rgba(255, 234, 167, 0.3);
    }
    
    .alert-info {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-color: #bee5eb;
      color: #0c5460;
      box-shadow: 0 2px 4px rgba(190, 229, 235, 0.3);
    }
    
    .alert i {
      font-size: 18px;
    }
    
    /* Loading spinner animation */
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Button hover effects */
    .btn-loading {
      position: relative;
      overflow: hidden;
    }
    
    .btn-loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    /* Modal backdrop blur effect */
    .modal-backdrop {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    
    /* Enhanced shadow for modal */
    .modal-shadow {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
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
    console.log('ConfirmationModalNewComponent - Confirm button clicked');
    console.log('Current loading state:', this.isLoading);
    
    // Prevent multiple clicks while loading
    if (this.isLoading) {
      console.log('Already loading, ignoring click');
      return;
    }
    
    // Set loading state
    this.isLoading = true;
    console.log('Setting loading state to true');
    
    // Emit the confirmation event
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
