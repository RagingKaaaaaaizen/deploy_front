import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <div class="modal fade" 
         [class.show]="isVisible" 
         [style.display]="isVisible ? 'block' : 'none'"
         tabindex="-1" 
         role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">
              <i class="fas fa-check-circle text-success"></i>
              {{ title }}
            </h4>
            <button type="button" class="btn-close" (click)="onCancel()"></button>
          </div>
          
          <div class="modal-body">
            <p class="lead">{{ message }}</p>
            
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
                  <tfoot>
                    <tr class="table-success">
                      <th colspan="3">Total Value ({{ items.length }} item{{ items.length > 1 ? 's' : '' }}):</th>
                      <th class="text-success">₱{{ getTotalValue() | number:'1.2-2' }}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Role-specific message -->
            <div class="alert mt-3" [ngClass]="alertClass">
              <i [class]="alertIcon"></i>
              {{ roleMessage }}
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" 
                    class="btn btn-secondary" 
                    (click)="onCancel()">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="button" 
                    class="btn" 
                    [ngClass]="confirmButtonClass"
                    (click)="onConfirm()">
              <i [class]="confirmIcon"></i> {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal backdrop -->
    <div class="modal-backdrop fade" 
         [class.show]="isVisible" 
         *ngIf="isVisible"
         (click)="onCancel()">
    </div>
  `,
  styles: [`
    .modal {
      z-index: 1055;
    }
    
    .modal-backdrop {
      z-index: 1054;
    }
    
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
      border-radius: 8px;
      border: none;
      font-weight: 500;
    }
    
    .alert-info {
      background: linear-gradient(135deg, #17a2b8, #138496);
      color: white;
    }
    
    .alert-warning {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: #212529;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      font-weight: bold;
      color: #6c757d;
    }
    
    .btn-close:hover {
      color: #000;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() items: any[] = [];
  @Input() allItems: any[] = [];
  @Input() allLocations: any[] = [];
  @Input() userRole = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

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
      return 'fas fa-check-circle';
    } else {
      return 'fas fa-clock';
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
    const item = this.allItems.find(i => i.id == itemId);
    return item ? item.name : `Item #${itemId}`;
  }

  getItemCategory(itemId: number): string {
    const item = this.allItems.find(i => i.id == itemId);
    return item?.category?.name || 'Unknown Category';
  }

  getLocationName(locationId: number): string {
    const location = this.allLocations.find(l => l.id == locationId);
    return location ? location.name : `Location #${locationId}`;
  }

  getTotalValue(): number {
    return this.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
