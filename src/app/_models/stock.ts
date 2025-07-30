export class Stock {
  id?: number;
  itemId!: number;         // ID of the item
  quantity!: number;       // Quantity added or disposed
  type!: 'ADD' | 'DISPOSE'; // Action type
  location!: string;       // New field for storage location
  remarks?: string;        // Optional notes
  createdAt?: Date;
  createdBy?: number;      // User ID
}
