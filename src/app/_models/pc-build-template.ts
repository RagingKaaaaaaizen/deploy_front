export interface PCBuildTemplate {
    id?: number;
    name: string;
    description?: string;
    components: PCBuildTemplateComponent[];
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    creator?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface PCBuildTemplateComponent {
    id?: number;
    templateId?: number;
    categoryId: number;
    itemId: number;
    quantity: number;
    remarks?: string;
    category?: {
        id: number;
        name: string;
    };
    item?: {
        id: number;
        name: string;
        brand?: any;
    };
}

export interface PCTemplateComparison {
    pcId: number;
    templateId: number;
    templateName: string;
    totalComponents: number;
    matchCount: number;
    mismatchCount: number;
    matches: boolean;
    matchPercentage: number;
    mismatches: ComponentMismatch[];
}

export interface ComponentMismatch {
    categoryId: number;
    categoryName: string;
    reason: 'missing' | 'different_item' | 'different_quantity';
    template: {
        itemId: number;
        itemName: string;
        quantity: number;
    };
    actual: {
        itemId: number;
        itemName: string;
        quantity: number;
    } | null;
    suggestedAction: string;
}

export interface ApplyTemplateOptions {
    replaceAll?: boolean;
    replaceCategories?: number[];
}

export interface TemplateStats {
    templateId: number;
    templateName: string;
    totalPCs: number;
    matchingPCs: number;
    partialMatchPCs: number;
    nonMatchingPCs: number;
    complianceRate: number;
}

