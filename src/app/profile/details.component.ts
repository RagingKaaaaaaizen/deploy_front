import { Component } from '@angular/core';

import { AccountService } from '@app/_services';

@Component({
    templateUrl: 'details.component.html',
    styles: [`
        .profile-container {
            padding: 20px 0;
        }

        .page-header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header-title i {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .page-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #333;
            margin: 0 0 5px 0;
        }

        .page-subtitle {
            color: #666;
            font-size: 1.1rem;
            margin: 0;
        }

        .header-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .profile-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            transition: all 0.3s ease;
        }

        .profile-card:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }

        .card {
            border: none;
            border-radius: 12px;
            overflow: hidden;
        }

        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card-body {
            padding: 30px;
        }

        .profile-info {
            display: flex;
            gap: 30px;
            align-items: flex-start;
        }

        .profile-avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            color: white;
            font-size: 2.5rem;
            flex-shrink: 0;
        }

        .profile-details {
            flex: 1;
        }

        .detail-row {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            flex: 0 0 200px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .detail-label i {
            color: #667eea;
            width: 20px;
        }

        .detail-value {
            flex: 1;
            color: #666;
        }

        .detail-value .badge {
            font-size: 0.8rem;
            padding: 5px 10px;
        }

        .quick-actions {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #f0f0f0;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-outline-primary {
            border: 2px solid #667eea;
            color: #667eea;
            background: transparent;
        }

        .btn-outline-primary:hover {
            background: #667eea;
            color: white;
        }

        .btn-outline-secondary {
            border: 2px solid #6c757d;
            color: #6c757d;
            background: transparent;
        }

        .btn-outline-secondary:hover {
            background: #6c757d;
            color: white;
        }

        .btn-outline-info {
            border: 2px solid #17a2b8;
            color: #17a2b8;
            background: transparent;
        }

        .btn-outline-info:hover {
            background: #17a2b8;
            color: white;
        }

        .stats-section {
            margin-top: 30px;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            height: 100%;
        }

        .stat-card:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }

        .stat-card h3 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin: 0 0 10px 0;
        }

        .stat-card p {
            color: #666;
            margin: 0;
            font-size: 0.95rem;
        }

        .stat-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
            font-size: 1.5rem;
            margin-bottom: 15px;
        }

        .stat-content {
            flex: 1;
        }

        .stat-content h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin: 0 0 5px 0;
        }

        .stat-content p {
            color: #666;
            margin: 0;
            font-size: 0.95rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                align-items: stretch;
            }

            .header-actions {
                justify-content: center;
            }

            .profile-info {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .detail-label {
                flex: none;
                width: 100%;
            }

            .action-buttons {
                justify-content: center;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }
        }

        @media (max-width: 480px) {
            .page-title {
                font-size: 2rem;
            }

            .card-body {
                padding: 20px;
            }

            .avatar-circle {
                width: 80px;
                height: 80px;
                font-size: 2rem;
            }

            .stat-card {
                padding: 20px;
            }

            .stat-icon {
                width: 50px;
                height: 50px;
                font-size: 1.2rem;
            }
        }
    `]
})
export class DetailsComponent {
    account = this.accountService.accountValue;
    profileStats = [
        {
            value: 0,
            label: 'Items Managed',
            icon: 'fas fa-boxes'
        },
        {
            value: 0,
            label: 'Disposals Made',
            icon: 'fas fa-trash-alt'
        },
        {
            value: 0,
            label: 'Activities',
            icon: 'fas fa-clock'
        },
        {
            value: 0,
            label: 'Days Active',
            icon: 'fas fa-calendar'
        }
    ];

    constructor(private accountService: AccountService) { }

    // Check if current user is an admin
    get isAdmin(): boolean {
        return this.account?.role === 'Admin' || this.account?.role === 'SuperAdmin';
    }
}