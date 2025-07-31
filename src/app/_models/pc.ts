export interface PC {
    id: number;
    name: string;
    serialNumber?: string;
    itemId: number;
    roomLocationId: number;
    specifications?: string;
    status: 'Active' | 'Inactive' | 'Maintenance' | 'Retired';
    assignedTo?: string;
    notes?: string;
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
    isDeleting?: boolean;
    item?: {
        id: number;
        name: string;
        description?: string;
        category?: {
            id: number;
            name: string;
        };
        brand?: {
            id: number;
            name: string;
        };
    };
    roomLocation?: {
        id: number;
        name: string;
    };
}

export interface SpecificationField {
    id: number;
    categoryId: number;
    fieldName: string;
    fieldLabel: string;
    fieldType: 'text' | 'textarea' | 'number' | 'select' | 'date';
    isRequired: boolean;
    fieldOrder: number;
    options?: string;
    category?: {
        id: number;
        name: string;
    };
} 