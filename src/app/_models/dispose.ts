export interface Dispose {
    id?: number;
    itemId?: number; // Optional for creation when using stockEntryId
    stockEntryId?: number; // New field for stock entry-based disposal
    locationId: number;
    quantity: number;
    disposalValue?: number; // Optional for creation, will be calculated from stock entry
    totalValue?: number;
    disposalDate?: Date; // Optional for creation, will be set by backend
    reason?: string; // Optional for creation
    remarks?: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    // Return to stock fields
    returnedToStock?: boolean;
    returnedAt?: Date;
    returnedBy?: number;
    returnStockId?: number;
    
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
    // Stock entry information (when using stockEntryId)
    stockEntry?: {
        id?: number;
        quantity: number;
        price: number;
        totalPrice: number;
        location?: { id?: number; name: string };
        item?: { id?: number; name: string };
    };
} 