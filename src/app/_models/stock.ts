export class Stock {
  id?: number;
  itemId!: number;            // ID of the item
  quantity!: number;          // Quantity added or disposed
  price!: number;             // Price per unit
  totalPrice?: number;        // Total price
  locationId!: number;        // Foreign key to StorageLocation
  remarks?: string;           // Optional notes
  disposeId?: number;         // Link to disposal record (null for additions)
  createdAt?: Date;
  createdBy?: number;         // User ID

  // Complete joined data from backend (for display and functionality)
  item?: { 
    id?: number; 
    name: string; 
    description?: string;
    category?: { id?: number; name: string };
    brand?: { id?: number; name: string };
  };
  location?: { 
    id?: number; 
    name: string; 
    description?: string;
  };
  user?: { 
    id?: number; 
    firstName: string; 
    lastName: string; 
    email?: string;
  };
  disposal?: { 
    id?: number; 
    quantity: number; 
    disposalValue: number; 
    reason: string; 
    disposalDate: Date;
    returnedToStock?: boolean;
    user?: { firstName: string; lastName: string };
  };
}
