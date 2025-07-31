export class Stock {
  id?: number;
  itemId!: number;            // ID of the item
  quantity!: number;          // Quantity added or disposed
  type!: 'ADD' | 'DISPOSE';
  price!: number;        // NEW
  totalPrice?: number;    // Action type
  locationId!: number;        // Foreign key to StorageLocation
  remarks?: string;           // Optional notes
  createdAt?: Date;
  createdBy?: number;         // User ID

  // Optional joined data from backend (for display only)
  item?: { id: number; name: string };
  location?: { id: number; name: string };
}
