export interface ApprovalRequest {
    id?: number;
    type: 'stock' | 'dispose';
    status: 'pending' | 'approved' | 'rejected';
    requestData: any; // JSON data containing the request details
    enhancedRequestData?: any; // Enhanced data from backend with item/location details
    createdBy: number;
    approvedBy?: number;
    approvedAt?: Date;
    rejectionReason?: string;
    remarks?: string;
    createdAt?: Date;
    updatedAt?: Date;
    
    // Related data
    creator?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role?: string;
    };
    approver?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role?: string;
    };
}

export interface CreateApprovalRequest {
    type: 'stock' | 'dispose';
    requestData: any;
}

export interface ApproveRequest {
    remarks?: string;
}

export interface RejectRequest {
    rejectionReason: string;
    remarks?: string;
}
