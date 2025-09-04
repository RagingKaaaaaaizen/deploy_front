import { Component } from '@angular/core';

@Component({ templateUrl: 'overview.component.html' })
export class OverviewComponent {
  adminCards = [
    {
      title: 'Accounts',
      description: 'Manage user accounts and permissions',
      icon: 'fas fa-users-cog',
      route: '/admin/accounts'
    },
    {
      title: 'Employees',
      description: 'Manage employee information and assignments',
      icon: 'fas fa-user-tie',
      route: '/admin/employees'
    },
    {
      title: 'Departments',
      description: 'Organize departments and structure',
      icon: 'fas fa-building',
      route: '/admin/departments'
    },
    {
      title: 'Requests',
      description: 'Review and manage system requests',
      icon: 'fas fa-clipboard-list',
      route: '/admin/requests'
    },
    {
      title: 'Workflows',
      description: 'Configure system workflows and processes',
      icon: 'fas fa-project-diagram',
      route: '/admin/workflows'
    },
    {
      title: 'Employee Transfer',
      description: 'Manage employee transfers between departments',
      icon: 'fas fa-exchange-alt',
      route: '/admin/employee-transfer'
    }
  ];
}