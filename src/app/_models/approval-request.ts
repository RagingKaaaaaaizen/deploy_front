export interface ApprovalRequest {
    id?: number;
    type: 'stock' | 'dispose';
    status: 'pending' | 'approved' | 'rejected';
    requestData: any; // JSON data containing the request details
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
    };
    approver?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
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
