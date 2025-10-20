import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DisposeService } from '../_services/dispose.service';
import { Dispose } from '../_models';
import { ItemService } from '../_services/item.service';
import { StorageLocationService } from '../_services/storage-location.service';
import { AlertService } from '../_services/alert.service';
import { StockService } from '../_services/stock.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-dispose',
  templateUrl: './dispose.component.html',
  styles: [`
    /* Custom animations for modal */
    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Ensure proper modal positioning */
    .modal-overlay {
      animation: modalFadeIn 0.3s ease-out;
    }

    .modal-container {
      animation: modalSlideIn 0.3s ease-out;
    }

    /* Responsive modal positioning */
    @media (max-width: 768px) {
      .modal-overlay {
        top: 60px !important;
        left: 16px !important;
        right: 16px !important;
        bottom: 16px !important;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .modal-overlay {
        top: 80px !important;
        left: 240px !important;
        right: 16px !important;
        bottom: 16px !important;
      }
    }

    /* Custom button styles for disposal actions */
    .btn-dispose {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      border-color: #dc3545;
      color: white;
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-dispose:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }

    .btn-warning-custom {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      border-color: #ffc107;
      color: #212529;
      border-radius: 8px;
      padding: 12px 24px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-warning-custom:hover {
      background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
    }
  `]
})
export class DisposeComponent implements OnInit {
  form: FormGroup;
  items: any[] = [];
  locations: any[] = [];
  availableStock: number = 0;
  loading = false;
  submitted = false;
  error = '';
  showAddDisposalModal = false;
  isEditMode = false;
  disposalId: number | null = null;
  selectedItemPrice: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private disposeService: DisposeService,
    private itemService: ItemService,
    private locationService: StorageLocationService,
    private alertService: AlertService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFormListeners();
    
    // Automatically open the modal when component loads (if not in edit/view mode)
    if (!this.isEditMode && !this.disposalId) {
      this.openAddDisposalModal();
    }
    
    // Listen for stock data changes from other components
    window.addEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }

     // Modal control methods
   openAddDisposalModal() {
     this.showAddDisposalModal = true;
     document.body.style.overflow = 'hidden'; // Prevent background scrolling
   }

  closeAddDisposalModal() {
    this.showAddDisposalModal = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // If we're in edit/view mode, navigate back to disposal list
    if (this.isEditMode || this.disposalId) {
      this.router.navigate(['/dispose']);
    }
    
    // Reset form when closing modal
    this.resetForm();
  }

  private resetForm() {
    this.form.reset();
    this.submitted = false;
    this.loading = false;
    this.error = '';
    this.availableStock = 0;
    this.selectedItemPrice = 0;
  }

  initForm() {
    this.form = this.formBuilder.group({
      itemId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      disposalValue: ['', [Validators.required, Validators.min(0.01)]],
      locationId: ['', Validators.required],
      reason: ['']
    });
  }

  setupFormListeners() {
    // Listen for item changes to get price and available stock
    this.form.get('itemId')?.valueChanges.subscribe(itemId => {
      if (itemId) {
        // Clear any existing validation errors
        this.error = '';
        this.form.get('quantity')?.setErrors(null);
        
        this.checkAvailableStock(itemId);
        this.getItemPrice(itemId);
      } else {
        this.availableStock = 0;
        this.selectedItemPrice = 0;
        this.form.patchValue({ disposalValue: '' });
        this.error = '';
        this.form.get('quantity')?.setErrors(null);
      }
    });

    // Listen for quantity changes to auto-fill price and validate against available stock
    this.form.get('quantity')?.valueChanges.subscribe(quantity => {
      if (quantity && quantity > 0) {
        // Auto-fill disposal value if we have a price
        if (this.selectedItemPrice > 0) {
          const disposalValue = this.selectedItemPrice * quantity;
          this.form.patchValue({ disposalValue: disposalValue });
          console.log('Auto-filled disposal value:', disposalValue, 'for quantity:', quantity, 'at price:', this.selectedItemPrice);
        }
        
        // Validate against available stock
        if (quantity > this.availableStock) {
          this.form.get('quantity')?.setErrors({ 
            insufficientStock: true,
            availableStock: this.availableStock 
          });
          this.error = `Cannot dispose ${quantity} items. Only ${this.availableStock} items available.`;
        } else {
          this.form.get('quantity')?.setErrors(null);
          this.error = '';
        }
      } else {
        this.form.get('quantity')?.setErrors(null);
        this.error = '';
      }
    });
  }

  loadData() {
    // Check if we're in edit or view mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.disposalId = parseInt(params['id']);
        
        // Check if we're in edit mode or view mode based on the route
        const url = this.router.url;
        if (url.includes('/edit/')) {
          this.isEditMode = true;
          this.loadDisposalForEdit(this.disposalId);
        } else if (url.includes('/view/')) {
          this.loadDisposalForView(this.disposalId);
        }
      }
    });

    // Load items
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        console.log('Items loaded:', items.length);
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.alertService.error('Error loading items');
      }
    });

    // Load locations
    this.locationService.getAll().subscribe({
      next: (locations) => {
        this.locations = locations;
        console.log('Locations loaded:', locations.length);
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.alertService.error('Error loading locations');
      }
    });

    // Check for pre-selected item (only in add mode)
    if (!this.isEditMode) {
      this.route.queryParams.subscribe(params => {
        if (params['itemId']) {
          const itemId = parseInt(params['itemId']);
          console.log('Pre-selected item:', itemId);
          this.form.patchValue({ itemId: itemId });
          this.checkAvailableStock(itemId);
          this.getItemPrice(itemId);
        }
      });
    }
  }

  loadDisposalForEdit(id: number) {
    this.loading = true;
    this.disposeService.getById(id).subscribe({
      next: (disposal) => {
        console.log('=== LOADING DISPOSAL FOR EDIT ===');
        console.log('Disposal data:', disposal);
        console.log('Form before patch:', this.form.value);
        
        this.form.patchValue({
          itemId: disposal.itemId,
          quantity: disposal.quantity,
          disposalValue: disposal.disposalValue,
          locationId: disposal.locationId,
          reason: disposal.reason
        });
        
        console.log('Form after patch:', this.form.value);
        
        // Get price and available stock for the item
        this.getItemPrice(disposal.itemId);
        this.checkAvailableStock(disposal.itemId);
        
        // Open modal for editing
        this.showAddDisposalModal = true;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading disposal for edit:', error);
        this.alertService.error('Error loading disposal record');
        this.loading = false;
      }
    });
  }

  loadDisposalForView(id: number) {
    this.loading = true;
    this.disposeService.getById(id).subscribe({
      next: (disposal) => {
        console.log('Loaded disposal for view:', disposal);
        this.form.patchValue({
          itemId: disposal.itemId,
          quantity: disposal.quantity,
          disposalValue: disposal.disposalValue,
          locationId: disposal.locationId,
          reason: disposal.reason
        });
        
        // Get price and available stock for the item
        this.getItemPrice(disposal.itemId);
        this.checkAvailableStock(disposal.itemId);
        
        // Disable form for view mode
        this.form.disable();
        
        // Open modal for viewing
        this.showAddDisposalModal = true;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading disposal for view:', error);
        this.alertService.error('Error loading disposal record');
        this.loading = false;
      }
    });
  }

  getItemPrice(itemId: number) {
    console.log('Getting item price for itemId:', itemId);
    
    // Get the latest stock entry for this item to get the price
    this.stockService.getAll().subscribe({
      next: (stockEntries) => {
        console.log('All stock entries:', stockEntries.length);
        const itemStockEntries = stockEntries.filter(entry => entry.itemId === itemId);
        console.log('Stock entries for item', itemId, ':', itemStockEntries.length);
        
        if (itemStockEntries.length > 0) {
          // Get the most recent stock entry with a price
          const entriesWithPrice = itemStockEntries.filter(entry => entry.price > 0);
          console.log('Entries with price:', entriesWithPrice.length);
          
          if (entriesWithPrice.length > 0) {
            const latestStockEntry = entriesWithPrice
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            
            this.selectedItemPrice = latestStockEntry.price;
            console.log('Latest price for item:', this.selectedItemPrice, 'from stock entry:', latestStockEntry.id);
            
            // Auto-fill disposal value if quantity is already set
            const currentQuantity = this.form.get('quantity')?.value;
            if (currentQuantity && currentQuantity > 0) {
              const disposalValue = this.selectedItemPrice * currentQuantity;
              this.form.patchValue({ disposalValue: disposalValue });
              console.log('Auto-filled disposal value:', disposalValue, 'for quantity:', currentQuantity, 'at price:', this.selectedItemPrice);
            }
          } else {
            console.log('No stock entries with price found for item:', itemId);
            console.log('Available stock entries:', itemStockEntries.map(e => ({ id: e.id, price: e.price, quantity: e.quantity })));
            this.selectedItemPrice = 0;
            this.alertService.info('No price information found for this item. Please enter the disposal value manually.');
          }
        } else {
          console.log('No stock entries found for item:', itemId);
          this.selectedItemPrice = 0;
          this.alertService.info('No stock information found for this item.');
        }
      },
      error: (error) => {
        console.error('Error getting item price:', error);
        this.selectedItemPrice = 0;
        this.alertService.error('Error loading item price information');
      }
    });
  }

  checkAvailableStock(itemId: number) {
    console.log('Checking available stock for item:', itemId);
    
    // Use dispose service to get actual available stock
    this.disposeService.validateDisposal(itemId, 0).subscribe({
      next: (result) => {
        console.log('Available stock result:', result);
        if (result && result.valid !== undefined) {
          this.availableStock = result.availableStock || 0;
          console.log('Available stock set to:', this.availableStock);
          
          // Show detailed stock information
          if (result.totalStock !== undefined && result.usedInPCComponents !== undefined) {
            console.log('Stock breakdown:', {
              totalStock: result.totalStock,
              usedInPCComponents: result.usedInPCComponents,
              availableStock: result.availableStock
            });
            
            // Show alert with detailed information
            if (result.usedInPCComponents > 0) {
              this.alertService.info(`Stock Info: ${result.totalStock} total - ${result.usedInPCComponents} used in PC components = ${result.availableStock} available for disposal`);
            }
          }
          
          // Update quantity field with available stock if it's greater than 0
          if (this.availableStock > 0) {
            this.form.patchValue({ quantity: this.availableStock });
            // Also trigger price calculation if we have a price
            if (this.selectedItemPrice > 0) {
              const disposalValue = this.selectedItemPrice * this.availableStock;
              this.form.patchValue({ disposalValue: disposalValue });
              console.log('Auto-filled disposal value for available stock:', disposalValue);
            }
          } else {
            this.form.patchValue({ quantity: '' });
          }
        } else {
          console.log('Invalid result format:', result);
          this.availableStock = 0;
          this.form.patchValue({ quantity: '' });
        }
      },
      error: (error) => {
        console.error('Error checking available stock:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        this.availableStock = 0;
        this.form.patchValue({ quantity: '' });
        this.alertService.error('Error loading available stock: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Pre-submission validation
    const requestedQuantity = this.form.get('quantity')?.value;
    if (requestedQuantity > this.availableStock) {
      this.error = `Cannot dispose ${requestedQuantity} items. Only ${this.availableStock} items available.`;
      return;
    }

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    // Server-side validation before proceeding
    const itemId = this.form.get('itemId')?.value;
    const quantity = this.form.get('quantity')?.value;
    
    this.validateDisposalWithServer(itemId, quantity).then(isValid => {
      if (isValid) {
        this.proceedWithSubmission(this.form.value, quantity);
      } else {
        this.loading = false;
      }
    }).catch(error => {
      console.error('Validation error:', error);
      this.error = 'Validation failed. Please try again.';
      this.loading = false;
    });
  }

  private validateDisposalWithServer(itemId: number, quantity: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.disposeService.validateDisposal(itemId, quantity).subscribe({
        next: (result) => {
          if (result.valid) {
            console.log('Server validation passed');
            resolve(true);
          } else {
            console.log('Server validation failed:', result.message);
            this.error = result.message || 'Validation failed';
            this.alertService.error(this.error);
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Error during server validation:', error);
          // Continue with submission even if validation fails (fallback)
          resolve(true);
        }
      });
    });
  }

  private proceedWithSubmission(formData: any, requestedQuantity: number) {
    if (this.disposalId && this.isEditMode) {
      this.update(formData);
    } else {
      this.create(formData);
    }
  }

  private create(formData: any) {
    this.disposeService.create(formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Disposal created successfully');
          this.closeAddDisposalModal(); // Close modal on success
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('stockDataChanged', {
            detail: {
              action: 'disposalCreated',
              itemId: formData.itemId,
              quantity: formData.quantity
            }
          }));
        },
        error: error => {
          console.error('Error creating disposal:', error);
          this.loading = false;
          
          // Prioritize specific backend error messages
          if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Error creating disposal record';
          }
        }
      });
  }

  private update(formData: any) {
    this.disposeService.update(this.disposalId!, formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Disposal updated successfully');
          this.closeAddDisposalModal(); // Close modal on success
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('stockDataChanged', {
            detail: {
              action: 'disposalUpdated',
              itemId: formData.itemId,
              quantity: formData.quantity
            }
          }));
        },
        error: error => {
          console.error('Error updating disposal:', error);
          this.loading = false;
          
          // Prioritize specific backend error messages
          if (error.error?.message) {
            this.error = error.error.message;
          } else if (error.message) {
            this.error = error.message;
          } else {
            this.error = 'Error updating disposal record';
          }
        }
      });
  }

  disposeAll() {
    if (!this.form.value.itemId) {
      this.alertService.error('Please select an item first');
      return;
    }

    if (this.availableStock <= 0) {
      this.alertService.error('No stock available to dispose');
      return;
    }

    if (!confirm(`Are you sure you want to dispose ALL ${this.availableStock} available items?`)) {
      return;
    }

    // Validate with server before proceeding
    this.validateDisposalWithServer(this.form.value.itemId, this.availableStock).then(isValid => {
      if (isValid) {
        this.form.patchValue({ quantity: this.availableStock });
        this.onSubmit();
      }
    });
  }

  testNavigation() {
    console.log('Testing navigation to dispose list...');
    this.router.navigate(['/dispose']).then(() => {
      console.log('Navigation successful');
    }).catch(error => {
      console.error('Navigation failed:', error);
    });
  }

  // Method to manually refresh stock data
  refreshStockData() {
    console.log('Manually refreshing stock data...');
    const currentItemId = this.form.get('itemId')?.value;
    if (currentItemId) {
      this.checkAvailableStock(currentItemId);
      this.getItemPrice(currentItemId);
      
      // Re-validate quantity if it's already set
      const currentQuantity = this.form.get('quantity')?.value;
      if (currentQuantity && currentQuantity > 0) {
        if (currentQuantity > this.availableStock) {
          this.form.get('quantity')?.setErrors({ 
            insufficientStock: true,
            availableStock: this.availableStock 
          });
          this.error = `Cannot dispose ${currentQuantity} items. Only ${this.availableStock} items available.`;
        } else {
          this.form.get('quantity')?.setErrors(null);
          this.error = '';
        }
      }
    }
  }

  // Method to notify stock list component to refresh its data
  private notifyStockListRefresh() {
    // Dispatch a custom event that stock list component can listen to
    const event = new CustomEvent('stockDataChanged', {
      detail: {
        timestamp: new Date().getTime(),
        message: 'Items disposed - stock data updated',
        action: 'dispose',
        itemId: this.form.get('itemId')?.value
      }
    });
    window.dispatchEvent(event);
    console.log('Stock data change event dispatched from dispose component');
  }

  // Handle stock data changes from other components
  private handleStockDataChange(event: CustomEvent) {
    console.log('Stock data change detected in dispose component:', event.detail);
    
    // Re-check available stock for the currently selected item
    const currentItemId = this.form.get('itemId')?.value;
    if (currentItemId) {
      console.log('Re-checking available stock for item:', currentItemId);
      this.checkAvailableStock(currentItemId);
      
      // Re-validate quantity if it's already set
      const currentQuantity = this.form.get('quantity')?.value;
      if (currentQuantity && currentQuantity > 0) {
        if (currentQuantity > this.availableStock) {
          this.form.get('quantity')?.setErrors({ 
            insufficientStock: true,
            availableStock: this.availableStock 
          });
          this.error = `Cannot dispose ${currentQuantity} items. Only ${this.availableStock} items available.`;
        } else {
          this.form.get('quantity')?.setErrors(null);
          this.error = '';
        }
      }
    }
    
    // Show a brief notification
    this.alertService.info('Stock data updated - available quantities refreshed');
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }
} 