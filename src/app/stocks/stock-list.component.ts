import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { StockService } from '../_services/stock.service';
import { ItemService } from '../_services/item.service';
import { CategoryService } from '../_services/category.service';
import { BrandService } from '../_services/brand.service';
import { StorageLocationService } from '../_services/storage-location.service';
import { PCService } from '../_services/pc.service';
import { PCComponentService } from '../_services/pc-component.service';
import { AccountService, AlertService } from '@app/_services';
import { Role } from '../_models';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styles: [`
    .list-container {
      padding: 20px 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .page-header {
      background: white;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
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

    .header-actions .btn {
      border-radius: 25px;
      padding: 12px 24px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .header-actions      .btn:hover {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(0,0,0,0.15);
     }

     /* Highlighted item effect */
     .highlighted-item {
       animation: highlightPulse 2s ease-in-out;
       border: 3px solid #667eea !important;
       box-shadow: 0 0 20px rgba(102, 126, 234, 0.5) !important;
     }

     @keyframes highlightPulse {
       0% { transform: scale(1); }
       50% { transform: scale(1.02); }
       100% { transform: scale(1); }
     }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.2);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-number {
      font-size: 2.2rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .quantity-info, .in-use-info {
      min-width: 120px;
    }

    .quantity-info small, .in-use-info small {
      font-size: 0.75rem;
      line-height: 1.2;
    }

    .filters-section {
      background: white;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 25px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
    }

    .search-box {
      position: relative;
    }

    .search-box i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #667eea;
      z-index: 1;
    }

    .search-box .form-control {
      padding-left: 45px;
      border-radius: 25px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .search-box .form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .filter-controls {
      display: flex;
      gap: 15px;
    }

    .filter-controls .form-select {
      border-radius: 25px;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .filter-controls .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    .card {
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      margin-bottom: 25px;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .card:hover {
      box-shadow: 0 16px 48px rgba(0,0,0,0.15);
      transform: translateY(-4px);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px 16px 0 0 !important;
      padding: 25px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-actions {
      display: flex;
      gap: 10px;
    }

    .table-actions .btn {
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
    }

    .table {
      margin-bottom: 0;
    }

    .table thead th {
      background: #f8f9fa;
      border: none;
      padding: 15px;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    .table tbody td {
      padding: 15px;
      vertical-align: middle;
      border: none;
      border-bottom: 1px solid #f1f3f4;
    }

    .table tbody tr {
      transition: all 0.3s ease;
    }

    .table tbody tr:hover {
      background-color: #f8f9fa;
      transform: scale(1.005);
    }

    .item-info {
      display: flex;
      flex-direction: column;
    }

    .item-info strong {
      color: #333;
      font-weight: 600;
    }

    .category-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .brand-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 600;
      background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .location-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 600;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quantity-badge {
      padding: 10px 20px;
      border-radius: 30px;
      font-size: 1rem;
      font-weight: 700;
      display: inline-block;
      text-align: center;
      min-width: 100px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .quantity-positive {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      border: 2px solid #28a745;
    }

    .quantity-negative {
      background: linear-gradient(135deg, #dc3545, #e83e8c);
      color: white;
      border: 2px solid #dc3545;
    }

    .quantity-zero {
      background: linear-gradient(135deg, #6c757d, #495057);
      color: white;
      border: 2px solid #6c757d;
    }

    .stock-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #495057;
    }

    .stock-summary strong {
      color: #667eea;
    }

    .price-value,
    .total-value {
      font-weight: 600;
      color: #333;
    }

    .total-price {
      font-weight: 600;
      color: #28a745;
    }

    .created-date {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
    }

    .action-buttons .btn {
      padding: 10px 14px;
      font-size: 0.9rem;
      border-radius: 25px;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      min-width: 45px;
      border: 2px solid transparent;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .action-buttons .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .action-buttons .btn-outline-primary {
      color: #007bff;
      border-color: #007bff;
      background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%);
    }

    .action-buttons .btn-outline-primary:hover {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border-color: #007bff;
    }

    .action-buttons .btn-outline-warning {
      color: #ffc107;
      border-color: #ffc107;
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
    }

    .action-buttons .btn-outline-warning:hover {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: white;
      border-color: #ffc107;
    }

    .action-buttons .btn-outline-info {
      color: #17a2b8;
      border-color: #17a2b8;
      background: linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%);
    }

    .action-buttons .btn-outline-info:hover {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      border-color: #17a2b8;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 4rem;
      color: #dee2e6;
      margin-bottom: 20px;
    }

    .empty-state h4 {
      color: #495057;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .pagination-section {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .pagination-info {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .pagination {
      margin: 0;
    }

    .page-link {
      color: #667eea;
      border: none;
      padding: 10px 16px;
      margin: 0 3px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .page-link:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      transform: translateY(-2px);
    }

    .page-item.active .page-link {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .page-item.disabled .page-link {
      color: #adb5bd;
      cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .list-container {
        padding: 10px 0;
      }

      .page-header {
        padding: 20px;
        margin-bottom: 20px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .header-title {
        justify-content: center;
        margin-bottom: 20px;
      }

      .page-title {
        font-size: 2rem;
      }

      .header-actions {
        justify-content: center;
        flex-direction: column;
      }

      .header-actions .btn {
        width: 100%;
        margin-bottom: 10px;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .stat-card {
        padding: 20px;
      }

      .stat-icon {
        font-size: 2.5rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .filters-section {
        padding: 20px;
      }

      .filter-controls {
        flex-direction: column;
        gap: 10px;
      }

      .card-header {
        padding: 20px;
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .table-responsive {
        border-radius: 0;
      }

      .table thead {
        display: none;
      }

      .table tbody tr {
        display: block;
        margin-bottom: 20px;
        border: 1px solid #dee2e6;
        border-radius: 12px;
        padding: 15px;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .table tbody td {
        display: block;
        text-align: left;
        padding: 8px 0;
        border: none;
      }

      .table tbody td::before {
        content: attr(data-label) ": ";
        font-weight: 600;
        color: #495057;
        margin-right: 10px;
      }

      .action-buttons {
        justify-content: center;
        margin-top: 15px;
      }

      .action-buttons .btn {
        flex: 1;
        max-width: 80px;
      }

      .pagination-section {
        flex-direction: column;
        text-align: center;
        padding: 20px;
      }

      .pagination {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.8rem;
      }

      .header-title i {
        font-size: 2rem;
      }

      .stat-card {
        padding: 15px;
      }

      .stat-icon {
        font-size: 2rem;
      }

      .stat-number {
        font-size: 1.8rem;
      }

      .btn {
        padding: 6px 12px;
        font-size: 0.8rem;
      }
    }

    /* Tablet Responsive */
    @media (min-width: 769px) and (max-width: 1024px) {
      .container {
        max-width: 100%;
        padding: 0 20px;
      }
    }

    /* Large Desktop */
    @media (min-width: 1200px) {
      .container {
        max-width: 1400px;
      }
    }

         /* Enhanced Modal Styles */
     .modal-overlay {
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.5);
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
       z-index: 1050;
       display: flex;
       justify-content: center;
       align-items: center;
       padding: 20px;
       animation: fadeIn 0.3s ease-out;
     }

     @keyframes fadeIn {
       from {
         opacity: 0;
       }
       to {
         opacity: 1;
       }
     }

         .modal-container {
       background: white;
       border-radius: 20px;
       box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
       max-width: 95%;
       max-height: 95%;
       width: 900px;
       overflow: hidden;
       display: flex;
       flex-direction: column;
       animation: modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       border: 1px solid rgba(255, 255, 255, 0.1);
     }

         @keyframes modalSlideIn {
       from {
         opacity: 0;
         transform: translateY(-30px) scale(0.96);
       }
       to {
         opacity: 1;
         transform: translateY(0) scale(1);
       }
     }

         .modal-header {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       padding: 30px;
       border-radius: 20px 20px 0 0;
       position: relative;
       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
     }

    .modal-header .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .modal-header .header-title {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .modal-header .header-title i {
      font-size: 2.5rem;
      color: white;
    }

    .modal-header .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 0 0 5px 0;
    }

    .modal-header .page-subtitle {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
    }

    .modal-header .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

         .modal-header .btn-close {
       background: rgba(255, 255, 255, 0.15);
       border: 2px solid rgba(255, 255, 255, 0.2);
       color: white;
       border-radius: 50%;
       width: 45px;
       height: 45px;
       display: flex;
       align-items: center;
       justify-content: center;
       font-size: 1.3rem;
       transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       backdrop-filter: blur(10px);
     }

     .modal-header .btn-close:hover {
       background: rgba(255, 255, 255, 0.25);
       border-color: rgba(255, 255, 255, 0.4);
       transform: scale(1.1) rotate(90deg);
       box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
     }

         .modal-body {
       flex: 1;
       overflow-y: auto;
       padding: 30px;
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
     }

    /* Responsive Modal */
    @media (max-width: 768px) {
      .modal-overlay {
        padding: 10px;
      }

      .modal-container {
        width: 100%;
        max-height: 100%;
        border-radius: 12px;
      }

      .modal-header {
        padding: 20px;
        border-radius: 12px 12px 0 0;
      }

      .modal-header .page-title {
        font-size: 1.8rem;
      }

      .modal-header .header-content {
        flex-direction: column;
        text-align: center;
      }

      .modal-header .header-actions {
        justify-content: center;
        flex-direction: column;
        width: 100%;
      }

      .modal-body {
        padding: 15px;
      }
    }

         /* Enhanced Form Styles */
     .form-card {
       background: white;
       border-radius: 16px;
       box-shadow: 0 8px 32px rgba(0,0,0,0.1);
       border: 1px solid rgba(255, 255, 255, 0.2);
       overflow: hidden;
     }

    .form-card .card {
      border: none;
      border-radius: 12px;
    }

         .form-card .card-header {
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
       border-bottom: 1px solid #dee2e6;
       border-radius: 16px 16px 0 0;
       padding: 25px;
       box-shadow: 0 2px 10px rgba(0,0,0,0.05);
     }

    .form-card .card-header h5 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

         .form-card .card-body {
       padding: 35px;
     }

    .stock-form .form-group {
      margin-bottom: 25px;
    }

    .stock-form .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stock-form .form-label i {
      color: #007bff;
    }

         .stock-form .form-control {
       border-radius: 12px;
       border: 2px solid #e9ecef;
       padding: 14px 18px;
       transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       font-size: 0.95rem;
       background: white;
       color: #495057;
     }

     .stock-form .form-control:focus {
       border-color: #667eea;
       box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
       background: white;
       transform: translateY(-1px);
       color: #495057;
     }

     .stock-form .form-control:hover {
       border-color: #667eea;
       background: white;
       color: #495057;
     }

     /* Enhanced Dropdown Styles */
     .stock-form .form-select {
       border-radius: 12px;
       border: 2px solid #e9ecef;
       padding: 14px 18px;
       transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       font-size: 0.95rem;
       background: white;
       color: #495057;
       background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23667eea' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
       background-repeat: no-repeat;
       background-position: right 12px center;
       background-size: 16px 12px;
       padding-right: 40px;
       cursor: pointer;
     }

     .stock-form .form-select:focus {
       border-color: #667eea;
       box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
       background-color: white;
       transform: translateY(-1px);
       color: #495057;
     }

     .stock-form .form-select:hover {
       border-color: #667eea;
       background-color: white;
       color: #495057;
     }

     .stock-form .form-select option {
       background: white;
       color: #495057;
       padding: 12px;
       font-size: 0.95rem;
     }

     .stock-form .form-select option:hover {
       background: #f8f9fa;
       color: #667eea;
     }

     .stock-form .form-select option:checked {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
     }

     /* Placeholder text styling */
     .stock-form .form-select:invalid,
     .stock-form .form-select option[value=""] {
       color: #6c757d;
     }

     .stock-form .form-select option:not([value=""]) {
       color: #495057;
     }

    .stock-form .form-control.is-invalid {
      border-color: #dc3545;
    }

    .stock-form .invalid-feedback {
      font-size: 0.875rem;
      color: #dc3545;
      margin-top: 5px;
    }

    .form-row {
      display: flex;
      margin-left: -10px;
      margin-right: -10px;
    }

    .form-row .form-group {
      flex: 1;
      padding-left: 10px;
      padding-right: 10px;
    }

    .search-input-container {
      position: relative;
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }

    .search-result-item {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f8f9fa;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .search-result-item:hover {
      background-color: #f8f9fa;
    }

         .form-actions {
       display: flex;
       justify-content: flex-end;
       gap: 15px;
       margin-top: 35px;
       padding-top: 25px;
       border-top: 2px solid #f1f3f4;
     }

     .form-actions .btn {
       border-radius: 25px;
       padding: 14px 28px;
       font-weight: 600;
       transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
       border: 2px solid transparent;
       font-size: 0.95rem;
       min-width: 120px;
     }

     .form-actions .btn:hover {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(0,0,0,0.15);
     }

     .form-actions .btn-primary {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       border-color: #667eea;
     }

     .form-actions .btn-primary:hover {
       background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
       border-color: #5a6fd8;
     }

     .form-actions .btn-secondary {
       background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
       border-color: #6c757d;
     }

     .form-actions .btn-secondary:hover {
       background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
       border-color: #5a6268;
     }

     /* View Stock Modal Styles */
     .info-buttons-section {
       border-top: 1px solid #dee2e6;
       padding-top: 20px;
     }

     .section-title {
       color: #495057;
       font-weight: 600;
       margin-bottom: 15px;
       display: flex;
       align-items: center;
       gap: 8px;
     }

           .info-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px 15px;
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        font-weight: 600;
        border: 2px solid transparent;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        min-height: 100px;
        justify-content: center;
      }

      .info-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border-color: rgba(102, 126, 234, 0.3);
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      }

           .info-btn i {
        font-size: 2rem;
        margin-bottom: 5px;
      }

      .info-btn span {
        font-size: 0.95rem;
        text-align: center;
        line-height: 1.2;
      }

           .info-display-area {
        border-top: 2px solid #f1f3f4;
        padding-top: 25px;
        margin-top: 25px;
      }

      .info-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        padding: 15px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 12px;
        border-left: 4px solid #667eea;
      }

      .info-header i {
        font-size: 1.4rem;
        color: #667eea;
      }

     .info-content {
       line-height: 1.6;
       color: #495057;
     }

     .info-content ul {
       margin-bottom: 0;
       padding-left: 20px;
     }

     .info-content li {
       margin-bottom: 8px;
       color: #495057;
     }

     .info-content .badge {
       margin-left: 5px;
       font-weight: 600;
       padding: 6px 12px;
       border-radius: 20px;
     }

     .info-content .text-success {
       color: #28a745 !important;
       font-weight: 600;
     }

     .info-content .text-warning {
       color: #ffc107 !important;
       font-weight: 600;
     }

     .info-content .text-danger {
       color: #dc3545 !important;
       font-weight: 600;
     }

         .info-content .text-info {
      color: #17a2b8 !important;
      font-weight: 600;
    }

    .info-content .text-muted {
      color: #6c757d !important;
    }

    .in-use-info .badge {
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .in-use-info .badge-warning {
      background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
      color: white;
      border: 2px solid #ffc107;
    }

    .in-use-info .badge-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
      color: white;
      border: 2px solid #6c757d;
    }

    .badge-success {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: 2px solid #28a745;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

     /* Enhanced Modal Content Styles */
     .stock-details-grid {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
       gap: 20px;
       margin-bottom: 25px;
     }

     .detail-item {
       background: white;
       padding: 20px;
       border-radius: 12px;
       box-shadow: 0 4px 15px rgba(0,0,0,0.08);
       border: 1px solid #f1f3f4;
       transition: all 0.3s ease;
     }

     .detail-item:hover {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(0,0,0,0.12);
     }

     .detail-label {
       font-size: 0.85rem;
       color: #6c757d;
       font-weight: 500;
       text-transform: uppercase;
       letter-spacing: 0.5px;
       margin-bottom: 8px;
     }

     .detail-value {
       font-size: 1.1rem;
       color: #495057;
       font-weight: 600;
       margin-bottom: 0;
     }

     .detail-value.highlight {
       color: #667eea;
       font-size: 1.2rem;
     }

     .detail-value.success {
       color: #28a745;
     }

     .detail-value.warning {
       color: #ffc107;
     }

     .detail-value.danger {
       color: #dc3545;
     }

     /* Modal text color fixes */
     .modal-body {
       color: #495057;
     }

     .modal-body h1, .modal-body h2, .modal-body h3, .modal-body h4, .modal-body h5, .modal-body h6 {
       color: #333;
     }

     .modal-body p {
       color: #495057;
     }

     .modal-body strong {
       color: #333;
       font-weight: 600;
     }
   `]
})
export class StockListComponent implements OnInit {
  Role = Role;
  stocks: any[] = [];
  items: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  locations: any[] = [];
  pcs: any[] = [];
  pcComponents: any[] = [];
  filteredStocks: any[] = [];
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;
  showAddStockModal = false;

  // Highlight tracking
  highlightedItemId: number | null = null;
  showViewStockModal = false;
  showEditStockModal = false;
  selectedStock: any = null;
  currentInfoType: string = '';

  // Add Stock Form Properties
  stockModel = {
    itemId: undefined as number | undefined,
    quantity: undefined as number | undefined,
    price: undefined as number | undefined,
    locationId: undefined as number | undefined,
    remarks: ''
  };
  stockSubmitted = false;
  stockLoading = false;
  totalPrice = 0;

  // Edit Stock Form Properties
  editStockModel = {
    id: undefined as number | undefined,
    itemId: undefined as number | undefined,
    quantity: undefined as number | undefined,
    price: undefined as number | undefined,
    locationId: undefined as number | undefined,
    remarks: ''
  };
  editStockSubmitted = false;
  editStockLoading = false;
  editTotalPrice = 0;

  constructor(
    private stockService: StockService,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private locationService: StorageLocationService,
    private pcService: PCService,
    private pcComponentService: PCComponentService,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadData();
    
    // Check for query parameters to highlight specific items
    this.route.queryParams.subscribe(params => {
      if (params['highlightItem']) {
        this.highlightedItemId = Number(params['highlightItem']);
        // Scroll to the highlighted item after data loads
        setTimeout(() => {
          this.scrollToHighlightedItem();
        }, 1000);
      }
    });
    
    // Listen for stock data changes from PC components
    window.addEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }

  // Modal control methods
  openAddStockModal() {
    this.showAddStockModal = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeAddStockModal() {
    this.showAddStockModal = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
    this.resetStockForm();
  }

  // View Stock Modal methods
  openViewStockModal(stock: any) {
    this.selectedStock = stock;
    this.showViewStockModal = true;
    this.currentInfoType = '';
    document.body.style.overflow = 'hidden';
  }

  closeViewStockModal() {
    this.showViewStockModal = false;
    this.selectedStock = null;
    this.currentInfoType = '';
    document.body.style.overflow = 'auto';
  }

  // Edit Stock Modal methods
  openEditStockModal(stock: any) {
    this.editStockModel = {
      id: stock.id,
      itemId: stock.itemId,
      quantity: stock.quantity,
      price: stock.price,
      locationId: stock.locationId,
      remarks: stock.remarks || ''
    };
    this.editTotalPrice = stock.quantity * stock.price;
    this.showEditStockModal = true;
    this.editStockSubmitted = false;
    this.editStockLoading = false;
    document.body.style.overflow = 'hidden';
  }

  closeEditStockModal() {
    this.showEditStockModal = false;
    this.editStockModel = {
      id: undefined,
      itemId: undefined,
      quantity: undefined,
      price: undefined,
      locationId: undefined,
      remarks: ''
    };
    this.editStockSubmitted = false;
    this.editStockLoading = false;
    this.editTotalPrice = 0;
    document.body.style.overflow = 'auto';
  }

  // Info display methods
  showAvailabilityInfo() {
    this.currentInfoType = 'availability';
  }

  showDisposeInfo() {
    this.currentInfoType = 'dispose';
  }

  showInUseInfo() {
    this.currentInfoType = 'inuse';
  }

  getInfoAlertClass(): string {
    switch (this.currentInfoType) {
      case 'availability': return 'alert-info';
      case 'dispose': return 'alert-warning';
      case 'inuse': return 'alert-success';
      default: return 'alert-info';
    }
  }

  getInfoIcon(): string {
    switch (this.currentInfoType) {
      case 'availability': return 'fas fa-boxes';
      case 'dispose': return 'fas fa-recycle';
      case 'inuse': return 'fas fa-desktop';
      default: return 'fas fa-info-circle';
    }
  }

  scrollToHighlightedItem() {
    if (this.highlightedItemId) {
      const element = document.querySelector(`[data-item-id="${this.highlightedItemId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary highlight effect
        element.classList.add('highlighted-item');
        setTimeout(() => {
          element.classList.remove('highlighted-item');
          // Clear the highlight after animation
          this.highlightedItemId = null;
        }, 3000);
      }
    }
  }

  // Method to navigate to dispose page for a specific stock
  navigateToDispose(stock: any) {
    this.router.navigate(['/dispose'], { 
      queryParams: { 
        stockEntryId: stock.id,
        autoOpenModal: 'true'
      } 
    });
  }

  getInfoTitle(): string {
    switch (this.currentInfoType) {
      case 'availability': return 'Stock Availability Information';
      case 'dispose': return 'Disposal Information';
      case 'inuse': return 'In-Use Components Information';
      default: return 'Information';
    }
  }

  getInfoContent(): string {
    if (!this.selectedStock) return '';

    switch (this.currentInfoType) {
      case 'availability':
        return this.getAvailabilityContent();
      case 'dispose':
        return this.getDisposeContent();
      case 'inuse':
        return this.getInUseContent();
      default:
        return '';
    }
  }

  getAvailabilityContent(): string {
    const itemId = this.selectedStock.itemId;
    const summary = this.getStockSummary(itemId);
    const totalStock = this.getAvailableStock(itemId);
    const inUseQuantity = this.getInUseCount(itemId);
    const availableQuantity = Math.max(0, totalStock - inUseQuantity);

    return `
      <div class="availability-details">
        <ul>
          <li><strong>Total Stock:</strong> <span class="badge badge-primary">${summary.total} units</span></li>
          <li><strong>Available for Use:</strong> <span class="badge badge-success">${summary.available} units</span></li>
          <li><strong>Currently In Use:</strong> <span class="badge badge-warning">${summary.inUse} units</span></li>
          <li><strong>Used in PCs:</strong> <span class="badge badge-info">${summary.usedInPCs} PC(s)</span></li>
        </ul>
        <div class="mt-3">
          <small class="text-muted">
            <i class="fas fa-info-circle"></i> 
            Availability is calculated as: Total Stock - Items Currently In Use
          </small>
        </div>
      </div>
    `;
  }

  getDisposeContent(): string {
    if (this.selectedStock.disposeId && this.selectedStock.disposal) {
      const disposal = this.selectedStock.disposal;
      return `
        <div class="disposal-details">
          <ul>
            <li><strong>Disposal Status:</strong> 
              <span class="badge badge-danger">Disposed</span>
            </li>
            <li><strong>Disposal Date:</strong> 
              <span class="text-info">${new Date(disposal.disposalDate).toLocaleDateString()}</span>
            </li>
            <li><strong>Disposal Value:</strong> 
              <span class="text-warning">php${disposal.disposalValue?.toFixed(2) || '0.00'}</span>
            </li>
            <li><strong>Total Disposal Value:</strong> 
              <span class="text-warning">php${((disposal.disposalValue || 0) * this.selectedStock.quantity).toFixed(2)}</span>
            </li>
            <li><strong>Reason:</strong> 
              <span class="text-muted">${disposal.reason || 'No reason provided'}</span>
            </li>
            <li><strong>Returned to Stock:</strong> 
              ${disposal.returnedToStock ? 
                '<span class="badge badge-success">Yes</span>' : 
                '<span class="badge badge-secondary">No</span>'}
            </li>
          </ul>
        </div>
      `;
    } else {
      return `
        <div class="disposal-details">
          <div class="text-center">
            <i class="fas fa-check-circle text-success" style="font-size: 2rem;"></i>
            <p class="mt-2"><strong>This stock item has not been disposed.</strong></p>
            <p class="text-muted">The item is currently available in inventory.</p>
          </div>
        </div>
      `;
    }
  }

  getInUseContent(): string {
    const itemId = this.selectedStock.itemId;
    const components = this.pcComponents.filter(component => component.itemId === itemId);
    
    if (components.length === 0) {
      return `
        <div class="inuse-details">
          <div class="text-center">
            <i class="fas fa-box text-muted" style="font-size: 2rem;"></i>
            <p class="mt-2"><strong>This item is not currently in use.</strong></p>
            <p class="text-muted">The item is available for allocation to PCs.</p>
          </div>
        </div>
      `;
    }

    const totalQuantity = components.reduce((total, component) => total + component.quantity, 0);
    const pcCount = components.length;

    let content = `
      <div class="inuse-details">
        <div class="summary mb-3">
          <ul>
            <li><strong>Total Quantity In Use:</strong> <span class="badge badge-warning">${totalQuantity} units</span></li>
            <li><strong>Number of PCs Using This Item:</strong> <span class="badge badge-info">${pcCount} PC(s)</span></li>
          </ul>
        </div>
    `;

    // Group by PC for better organization
    const pcGroups = new Map();
    components.forEach(component => {
      const pcId = component.pcId;
      if (!pcGroups.has(pcId)) {
        pcGroups.set(pcId, []);
      }
      pcGroups.get(pcId).push(component);
    });

    content += '<div class="pc-details"><strong>PC Details:</strong><ul>';
    pcGroups.forEach((components, pcId) => {
      const pc = this.pcs.find(p => p.id === pcId);
      const pcName = pc ? pc.name : `PC ${pcId}`;
      const totalQty = components.reduce((sum, comp) => sum + comp.quantity, 0);
      
      content += `
        <li><strong>${pcName}:</strong> <span class="badge badge-secondary">${totalQty} units</span></li>
      `;
    });
    content += '</ul></div></div>';

    return content;
  }

  // Add Stock Form Methods
  resetStockForm() {
    this.stockModel = {
      itemId: undefined,
      quantity: undefined,
      price: undefined,
      locationId: undefined,
      remarks: ''
    };
    this.stockSubmitted = false;
    this.stockLoading = false;
    this.totalPrice = 0;
  }

  saveStock() {
    this.stockSubmitted = true;

    // stop here if form is invalid
    if (!this.stockModel.itemId || !this.stockModel.quantity || !this.stockModel.price || !this.stockModel.locationId) {
      return;
    }

    this.stockLoading = true;

    // Create the stock object
    const stockData = {
      itemId: this.stockModel.itemId,
      quantity: this.stockModel.quantity,
      price: this.stockModel.price,
      locationId: this.stockModel.locationId,
      remarks: this.stockModel.remarks
    };

    this.stockService.create(stockData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Stock added successfully');
          this.closeAddStockModal();
          this.loadData(); // Refresh the stock list
        },
        error: error => {
          this.alertService.error(error);
          this.stockLoading = false;
        }
      });
  }

  onItemChange() {
    // Reset total price when item changes
    this.calculateTotalPrice();
  }

  onQuantityChange() {
    // Recalculate total price when quantity changes
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    if (this.stockModel.quantity && this.stockModel.price) {
      this.totalPrice = this.stockModel.quantity * this.stockModel.price;
    } else {
      this.totalPrice = 0;
    }
  }

  // Edit Stock Form Methods
  onEditQuantityChange() {
    this.calculateEditTotalPrice();
  }

  onEditPriceChange() {
    this.calculateEditTotalPrice();
  }

  calculateEditTotalPrice() {
    if (this.editStockModel.quantity && this.editStockModel.price) {
      this.editTotalPrice = this.editStockModel.quantity * this.editStockModel.price;
    } else {
      this.editTotalPrice = 0;
    }
  }

  saveEditStock() {
    this.editStockSubmitted = true;

    // stop here if form is invalid
    if (!this.editStockModel.locationId || !this.editStockModel.quantity || !this.editStockModel.price) {
      return;
    }

    this.editStockLoading = true;

    // Create the stock update object
    const stockData = {
      itemId: this.editStockModel.itemId,
      quantity: this.editStockModel.quantity,
      price: this.editStockModel.price,
      locationId: this.editStockModel.locationId,
      remarks: this.editStockModel.remarks
    };

    this.stockService.update(this.editStockModel.id!, stockData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Stock updated successfully');
          this.closeEditStockModal();
          this.loadData(); // Refresh the stock list
        },
        error: error => {
          this.alertService.error(error);
          this.editStockLoading = false;
        }
      });
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }

  loadData() {
    this.loadStocks();
    this.loadItems();
    this.loadCategories();
    this.loadBrands();
    this.loadLocations();
    this.loadPCs();
    this.loadPCComponents();
  }

  loadStocks() {
    this.stockService.getAll()
      .pipe(first())
      .subscribe({
        next: (stocks) => {
          console.log('=== STOCK DATA DEBUG ===');
          console.log('Raw stock entries loaded:', stocks);
          console.log('Total stocks received:', stocks.length);
          
          // Log each stock entry structure
          stocks.forEach((stock, index) => {
            console.log(`Stock ${index + 1}:`, {
              id: stock.id,
              itemId: stock.itemId,
              quantity: stock.quantity,
              disposeId: stock.disposeId,
              hasDisposal: !!stock.disposal,
              itemName: stock.item?.name
            });
          });
          
          // Log returned items specifically
          const returnedItems = stocks.filter(s => s.disposeId === null);
          console.log('Returned items (disposeId: null):', returnedItems.length);
          returnedItems.forEach(item => {
            console.log('Returned item:', {
              id: item.id,
              name: item.item?.name,
              quantity: item.quantity,
              disposeId: item.disposeId
            });
          });
          
          // Log disposal items
          const disposalItems = stocks.filter(s => s.disposeId !== null);
          console.log('Disposal items (disposeId not null):', disposalItems.length);
          
          this.stocks = stocks;
          this.applyFilters();
          
          console.log('=== END STOCK DATA DEBUG ===');
        },
        error: error => {
          console.error('Error loading stocks:', error);
          this.alertService.error(error);
        }
      });
  }

  loadItems() {
    this.itemService.getAll()
      .pipe(first())
      .subscribe({
        next: (items) => {
          this.items = items;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadCategories() {
    this.categoryService.getAll()
      .pipe(first())
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadBrands() {
    this.brandService.getAll()
      .pipe(first())
      .subscribe({
        next: (brands) => {
          this.brands = brands;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadLocations() {
    this.locationService.getAll()
      .pipe(first())
      .subscribe({
        next: (locations) => {
          this.locations = locations;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadPCs() {
    this.pcService.getAll()
      .pipe(first())
      .subscribe({
        next: (pcs) => {
          this.pcs = pcs;
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  loadPCComponents() {
    this.pcComponentService.getAll()
      .pipe(first())
      .subscribe({
        next: (components) => {
          this.pcComponents = components;
          console.log('PC Components loaded:', this.pcComponents.length);
        },
        error: error => {
          console.error('Error loading PC Components:', error);
          this.pcComponents = [];
        }
      });
  }

  applyFilters() {
    let filtered = [...this.stocks];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(stock => {
        const itemName = this.getItemName(stock.itemId).toLowerCase();
        return itemName.includes(this.searchTerm.toLowerCase());
      });
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(stock => {
        const item = this.items.find(i => i.id === stock.itemId);
        return item && item.categoryId == this.selectedCategory;
      });
    }

    this.filteredStocks = filtered;
    this.currentPage = 1;
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  refreshData() {
    this.loadData();
    this.alertService.success('Data refreshed successfully');
  }

  getAdditionsCount(): number {
    return this.stocks.filter(stock => !stock.disposeId).length;
  }

  getDisposalsCount(): number {
    return this.stocks.filter(stock => stock.disposeId && stock.disposal).length;
  }

  getReturnedDisposalsCount(): number {
    return this.stocks.filter(stock => stock.disposeId && stock.disposal && stock.disposal.returnedToStock).length;
  }

  getTotalValue(): number {
    return this.stocks.reduce((total, stock) => {
      if (stock.disposeId && stock.disposal) {
        // For disposal entries, use disposal value
        return total + (stock.disposal.disposalValue * stock.quantity);
      } else {
        // For addition entries, use regular price
        return total + (stock.price * stock.quantity);
      }
    }, 0);
  }

  getPCComponentsCount(): number {
    return this.pcComponents.length;
  }

  getItemName(itemId: number): string {
    const item = this.items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  }

  getCategoryName(stock: any): string {
    const item = this.items.find(i => i.id === stock.itemId);
    if (!item) return 'Unknown';
    
    const category = this.categories.find(c => c.id === item.categoryId);
    return category ? category.name : 'Unknown Category';
  }

  getBrandName(stock: any): string {
    const item = this.items.find(i => i.id === stock.itemId);
    if (!item) return 'Unknown';
    
    const brand = this.brands.find(b => b.id === item.brandId);
    return brand ? brand.name : 'Unknown Brand';
  }

  getLocationName(stock: any): string {
    const location = this.locations.find(l => l.id === stock.locationId);
    return location ? location.name : 'Unknown Location';
  }

  getDisposalInfo(stock: any): any {
    if (stock.disposal) {
      return {
        reason: stock.disposal.reason || 'No reason provided',
        date: stock.disposal.disposalDate,
        value: stock.disposal.disposalValue,
        returned: stock.disposal.returnedToStock,
        user: stock.disposal.user ? `${stock.disposal.user.firstName} ${stock.disposal.user.lastName}` : 'Unknown'
      };
    }
    return null;
  }

  isItemInUse(itemId: number): boolean {
    // Check if any PC component is using this item
    return this.pcComponents.some(component => component.itemId === itemId);
  }

  isItemEffectivelyAvailable(stock: any): boolean {
    // An item is effectively available if:
    // 1. It was never disposed (no disposeId)
    // 2. It was disposed but returned to stock (disposeId exists but disposal.returnedToStock is true)
    // 3. It was disposed but the disposal record shows it was returned to stock
    if (!stock.disposeId) {
      return true; // Never disposed
    }
    
    // If it has a disposeId, check if it was returned to stock
    if (stock.disposal && stock.disposal.returnedToStock) {
      return true; // Disposed but returned to stock
    }
    
    // If no disposal data is available but it has a disposeId, 
    // we need to check if this is a return entry (has disposeId but should be treated as available)
    // This happens when the backend creates a new stock entry for returned items
    return false; // Currently disposed
  }

  getInUseCount(itemId: number): number {
    // Count total quantity used in PC components for this item
    return this.pcComponents
      .filter(component => component.itemId === itemId)
      .reduce((total, component) => total + component.quantity, 0);
  }

  getInUseDetails(itemId: number): string {
    const components = this.pcComponents.filter(component => component.itemId === itemId);
    if (components.length === 0) {
      return 'Available';
    }
    
    const totalQuantity = components.reduce((total, component) => total + component.quantity, 0);
    const pcCount = components.length;
    
    return `${totalQuantity} units in ${pcCount} PC${pcCount > 1 ? 's' : ''}`;
  }

  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    
    const userRole = account.role;
    return roles.some(role => role === userRole);
  }

  // Debug method to check stock display conditions
  debugStockDisplay(stock: any): any {
    const debug = {
      id: stock.id,
      itemName: stock.item?.name,
      quantity: stock.quantity,
      disposeId: stock.disposeId,
      shouldShowGreenBadge: !stock.disposeId && stock.quantity > 0,
      shouldShowStockSummary: !stock.disposeId,
      shouldShowDisposeButton: !stock.disposeId && this.hasRole([this.Role.SuperAdmin, this.Role.Admin]),
      hasDisposal: !!stock.disposal
    };
    console.log('Stock display debug:', debug);
    return debug;
  }


  disposeStock(stock: any) {
    console.log('Dispose stock clicked for stock:', stock);
    this.router.navigate(['/dispose/add'], { 
      queryParams: { 
        itemId: stock.itemId,
        availableStock: this.getAvailableStock(stock.itemId)
      }
    });
  }

  getAvailableStock(itemId: number): number {
    const itemStocks = this.stocks.filter(s => s.itemId === itemId);
    // Sum all positive quantities
    return itemStocks.filter(s => s.quantity > 0).reduce((sum, s) => sum + s.quantity, 0);
  }

  getStockSummary(itemId: number): { total: number; available: number; inUse: number; usedInPCs: number } {
    const totalStock = this.getAvailableStock(itemId);
    const inUseQuantity = this.getInUseCount(itemId);
    const availableQuantity = Math.max(0, totalStock - inUseQuantity);
    const usedInPCs = this.pcComponents.filter(component => component.itemId === itemId).length;
    
    return {
      total: totalStock,
      available: availableQuantity,
      inUse: inUseQuantity,
      usedInPCs: usedInPCs
    };
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredStocks.length / this.itemsPerPage);
  }

  get paginatedStocks(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStocks.slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const end = Math.min(this.totalPages, start + maxPages - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Handle stock data changes from PC components
  private handleStockDataChange(event: CustomEvent) {
    console.log('Stock data change detected:', event.detail);
    console.log('Refreshing stock list data...');
    
    // Refresh all data to get updated stock quantities
    this.loadData();
    
    // Show a brief notification with more details
    const message = event.detail?.message || 'Stock data updated';
    this.alertService.info(`${message} - quantities refreshed globally`);
    
    // Broadcast the change to other components that might need updating
    this.broadcastStockChange(event.detail);
  }

  // Method to notify other components about stock data changes
  private notifyStockDataChange() {
    // Dispatch a custom event that other components can listen to
    const event = new CustomEvent('stockDataChanged', {
      detail: {
        timestamp: new Date().getTime(),
        message: 'Stock deleted - stock data updated'
      }
    });
    window.dispatchEvent(event);
    console.log('Stock data change event dispatched from stock list component');
  }

  // Broadcast stock changes to all components that might need updating
  private broadcastStockChange(detail: any) {
    // Dispatch additional events for specific components
    const events = [
      {
        name: 'pcStockDataChanged',
        detail: { ...detail, target: 'pc-components' }
      },
      {
        name: 'disposeStockDataChanged', 
        detail: { ...detail, target: 'dispose' }
      },
      {
        name: 'stockEditDataChanged',
        detail: { ...detail, target: 'stock-edit' }
      }
    ];

    events.forEach(eventInfo => {
      const event = new CustomEvent(eventInfo.name, {
        detail: eventInfo.detail
      });
      window.dispatchEvent(event);
      console.log(`Broadcasting ${eventInfo.name} event`);
    });
  }
}
