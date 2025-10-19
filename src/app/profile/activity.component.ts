import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ActivityLogService, AccountService, ActivityActionService } from '@app/_services';
import { ActivityLog, ActivityAction, EntityType, Account } from '@app/_models';

@Component({
    selector: 'app-activity-log',
    templateUrl: 'activity.component.html',
    styleUrls: ['activity.component.css']
})
export class ActivityComponent implements OnInit, OnChanges {
    @Input() userId?: number;
    @Input() entityType?: string;
    @Input() entityId?: number;
    @Input() showFilters = true;
    @Input() isAdmin = false;
    
    logs: ActivityLog[] = [];
    loading = false;
    currentPage = 0;
    pageSize = 20;
    hasMore = true;
    
    // User management for admins
    users: Account[] = [];
    selectedUserId: string | null = null;
    currentUser: Account | null = null;
    
    filters = {
        action: '',
        entityType: ''
    };
    
    actions = Object.values(ActivityAction);
    entityTypes = Object.values(EntityType);
    filteredActions: string[] = [];
    filterTimeout: any;

    constructor(
        private activityLogService: ActivityLogService,
        private accountService: AccountService,
        private activityActionService: ActivityActionService
    ) { }

    ngOnInit() {
        this.loadCurrentUser();
        if (this.isAdmin) {
            this.loadUsers();
        }
        this.initializeFilteredActions();
        this.loadLogs();
    }

    ngOnChanges() {
        // Reload logs when inputs change
        if (this.userId !== undefined || this.entityType || this.entityId) {
            this.loadLogs(true);
        }
    }

    loadLogs(reset = false) {
        if (reset) {
            this.currentPage = 0;
            this.logs = [];
        }
        
        this.loading = true;
        
        const offset = this.currentPage * this.pageSize;
        
        let observable;
        
        // Priority order: selected user > input userId > entity > all
        if (this.selectedUserId && this.canViewOtherUserLogs()) {
            // Admin viewing specific user's logs
            observable = this.activityLogService.getUserActivity(Number(this.selectedUserId), this.pageSize, offset, this.filters);
        } else if (this.userId) {
            // Component input userId
            observable = this.activityLogService.getUserActivity(this.userId, this.pageSize, offset, this.filters);
        } else if (this.entityType && this.entityId) {
            // Entity-specific logs (filters not applicable for entity-specific logs)
            observable = this.activityLogService.getEntityActivity(this.entityType, this.entityId, this.pageSize);
        } else if (this.canViewOtherUserLogs()) {
            // Admin viewing all logs
            observable = this.activityLogService.getAllActivity(this.pageSize, offset, this.filters);
        } else {
            // Regular user viewing their own logs
            observable = this.activityLogService.getMyActivity(this.pageSize, offset, this.filters);
        }
        
        observable.subscribe({
            next: (newLogs) => {
                if (reset) {
                    this.logs = newLogs;
                } else {
                    this.logs.push(...newLogs);
                }
                this.hasMore = newLogs.length === this.pageSize;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading activity logs:', error);
                this.loading = false;
            }
        });
    }

    loadMore() {
        if (!this.loading && this.hasMore) {
            this.currentPage++;
            this.loadLogs();
        }
    }

    applyFilters() {
        this.loadLogs(true);
    }

    clearFilters() {
        this.filters = { action: '', entityType: '' };
        this.loadLogs(true);
    }

    onFilterChange() {
        // Update filtered actions when entity type changes
        if (this.filters.entityType) {
            this.updateFilteredActions();
        } else {
            this.initializeFilteredActions();
        }
        
        // Auto-apply filters when they change (with a small delay to avoid excessive requests)
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
            this.loadLogs(true);
        }, 300);
    }

    getActionDisplayName(action: string): string {
        const config = this.activityActionService.getActionConfig(action);
        return config.label;
    }

    getEntityTypeDisplayName(entityType: string): string {
        return entityType.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    viewDetails(log: ActivityLog) {
        console.log('Activity log details:', log);
        // You can implement a modal or expandable view here
    }

    // Load current user information
    loadCurrentUser() {
        // Get current user from the account service
        this.currentUser = this.accountService.accountValue;
        if (this.currentUser) {
            this.isAdmin = this.currentUser.role === 'Admin' || this.currentUser.role === 'SuperAdmin';
        }
    }

    // Load all users for admin selection
    loadUsers() {
        this.accountService.getAll().subscribe({
            next: (users) => {
                this.users = users;
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    // Handle user selection change
    onUserChange() {
        this.currentPage = 0;
        this.logs = [];
        this.loadLogs();
    }

    // Get display name for user selection
    getUserDisplayName(user: Account): string {
        return `${user.title} ${user.firstName} ${user.lastName} (${user.role})`;
    }

    // Check if current user can view other users' logs
    canViewOtherUserLogs(): boolean {
        return this.isAdmin && this.currentUser && 
               (this.currentUser.role === 'Admin' || this.currentUser.role === 'SuperAdmin');
    }

    // Get the name of the selected user
    getSelectedUserName(): string {
        if (!this.selectedUserId) return '';
        const selectedUser = this.users.find(user => user.id === this.selectedUserId);
        return selectedUser ? `${selectedUser.title} ${selectedUser.firstName} ${selectedUser.lastName}` : 'Unknown User';
    }

    // Initialize filtered actions (show all actions initially)
    initializeFilteredActions() {
        this.filteredActions = [...this.actions];
    }

    // Update filtered actions based on selected entity type
    updateFilteredActions() {
        const entityType = this.filters.entityType;
        
        // Define which actions are relevant for each entity type
        const entityActionMap: { [key: string]: string[] } = {
            'ITEM': [
                ActivityAction.CREATE_ITEM,
                ActivityAction.UPDATE_ITEM,
                ActivityAction.DELETE_ITEM,
                ActivityAction.DISPOSE_ITEM,
                ActivityAction.ADD_STOCK,
                ActivityAction.UPDATE_STOCK
            ],
            'PC': [
                ActivityAction.CREATE_PC,
                ActivityAction.UPDATE_PC,
                ActivityAction.ADD_PC_COMPONENT,
                ActivityAction.REMOVE_PC_COMPONENT
            ],
            'PC_COMPONENT': [
                ActivityAction.ADD_PC_COMPONENT,
                ActivityAction.REMOVE_PC_COMPONENT
            ],
            'STOCK': [
                ActivityAction.ADD_STOCK,
                ActivityAction.UPDATE_STOCK
            ],
            'DISPOSE': [
                ActivityAction.DISPOSE_ITEM
            ],
            'EMPLOYEE': [
                ActivityAction.CREATE_EMPLOYEE,
                ActivityAction.UPDATE_EMPLOYEE
            ],
            'DEPARTMENT': []
        };

        if (entityActionMap[entityType]) {
            this.filteredActions = entityActionMap[entityType];
        } else {
            this.filteredActions = [...this.actions];
        }

        // Clear action filter if the currently selected action is not available for the selected entity type
        if (this.filters.action && !this.filteredActions.includes(this.filters.action)) {
            this.filters.action = '';
        }
    }

    // Get entity type icon
    getEntityTypeIcon(entityType: string): string {
        const iconMap: { [key: string]: string } = {
            'ITEM': 'fas fa-box',
            'PC': 'fas fa-desktop',
            'PC_COMPONENT': 'fas fa-microchip',
            'STOCK': 'fas fa-warehouse',
            'DISPOSE': 'fas fa-trash',
            'EMPLOYEE': 'fas fa-user',
            'DEPARTMENT': 'fas fa-building'
        };
        return iconMap[entityType] || 'fas fa-tag';
    }
}
