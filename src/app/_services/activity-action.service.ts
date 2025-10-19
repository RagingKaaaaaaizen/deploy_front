import { Injectable } from '@angular/core';

export interface ActionConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityActionService {

  private actionConfigs: { [key: string]: ActionConfig } = {
    // CREATE Actions - Green
    'CREATE_ITEM': {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: 'fas fa-plus-circle',
      label: 'Create Item'
    },
    'CREATE_PC': {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: 'fas fa-desktop',
      label: 'Create PC'
    },
    'CREATE_EMPLOYEE': {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: 'fas fa-user-plus',
      label: 'Create Employee'
    },
    'ADD_STOCK': {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: 'fas fa-boxes',
      label: 'Add Stock'
    },
    'ADD_PC_COMPONENT': {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: 'fas fa-microchip',
      label: 'Add PC Component'
    },

    // UPDATE Actions - Blue
    'UPDATE_ITEM': {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: 'fas fa-edit',
      label: 'Update Item'
    },
    'UPDATE_PC': {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: 'fas fa-desktop',
      label: 'Update PC'
    },
    'UPDATE_EMPLOYEE': {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: 'fas fa-user-edit',
      label: 'Update Employee'
    },
    'UPDATE_STOCK': {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      icon: 'fas fa-boxes',
      label: 'Update Stock'
    },

    // DELETE Actions - Red
    'DELETE_ITEM': {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: 'fas fa-trash-alt',
      label: 'Delete Item'
    },
    'REMOVE_PC_COMPONENT': {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: 'fas fa-microchip',
      label: 'Remove PC Component'
    },

    // DISPOSE Actions - Orange
    'DISPOSE_ITEM': {
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      icon: 'fas fa-trash',
      label: 'Dispose Item'
    },

    // LOGIN Actions - Purple
    'LOGIN': {
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      icon: 'fas fa-sign-in-alt',
      label: 'Login'
    },
    'LOGOUT': {
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      icon: 'fas fa-sign-out-alt',
      label: 'Logout'
    }
  };

  constructor() { }

  /**
   * Get configuration for a specific action
   */
  getActionConfig(action: string): ActionConfig {
    return this.actionConfigs[action] || this.getDefaultConfig(action);
  }

  /**
   * Get all available action configurations
   */
  getAllActionConfigs(): { [key: string]: ActionConfig } {
    return { ...this.actionConfigs };
  }

  /**
   * Get action categories for grouping
   */
  getActionCategories(): { [category: string]: string[] } {
    return {
      'CREATE': ['CREATE_ITEM', 'CREATE_PC', 'CREATE_EMPLOYEE', 'ADD_STOCK', 'ADD_PC_COMPONENT'],
      'UPDATE': ['UPDATE_ITEM', 'UPDATE_PC', 'UPDATE_EMPLOYEE', 'UPDATE_STOCK'],
      'DELETE': ['DELETE_ITEM', 'REMOVE_PC_COMPONENT'],
      'DISPOSE': ['DISPOSE_ITEM'],
      'AUTH': ['LOGIN', 'LOGOUT']
    };
  }

  /**
   * Check if action is a CREATE action
   */
  isCreateAction(action: string): boolean {
    return action.startsWith('CREATE_') || action === 'ADD_STOCK' || action === 'ADD_PC_COMPONENT';
  }

  /**
   * Check if action is an UPDATE action
   */
  isUpdateAction(action: string): boolean {
    return action.startsWith('UPDATE_');
  }

  /**
   * Check if action is a DELETE action
   */
  isDeleteAction(action: string): boolean {
    return action.startsWith('DELETE_') || action === 'REMOVE_PC_COMPONENT' || action === 'DISPOSE_ITEM';
  }

  /**
   * Check if action is a LOGIN action
   */
  isLoginAction(action: string): boolean {
    return action === 'LOGIN' || action === 'LOGOUT';
  }

  /**
   * Get default configuration for unknown actions
   */
  private getDefaultConfig(action: string): ActionConfig {
    return {
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      icon: 'fas fa-circle',
      label: action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    };
  }
}
