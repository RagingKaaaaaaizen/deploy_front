import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { first } from 'rxjs/operators';

import { DisposeService } from '../_services/dispose.service';
import { Dispose } from '../_models';
import { AccountService, AlertService, CategoryService, StorageLocationService, ItemService, StockService } from '@app/_services';
import { Role } from '../_models';

@Component({
  selector: 'app-dispose-list',
  templateUrl: './dispose-list.component.html',
  styles: [`
    .list-container {
      padding: 20px 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 15px;
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

    .header-actions .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
      font-size: 3rem;
      margin-bottom: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 1rem;
      font-weight: 500;
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

    .disposal-row {
      transition: all 0.3s ease;
    }

    .disposal-row:hover {
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

    .category-badge,
    .brand-badge,
    .location-badge,
    .user-badge,
    .date-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .quantity-badge {
      padding: 8px 16px;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-block;
      text-align: center;
      min-width: 80px;
    }

    .badge-danger {
      background: linear-gradient(135deg, #dc3545, #e83e8c);
      color: white;
    }

    .price-value,
    .total-value {
      font-weight: 600;
      color: #333;
    }

    .reason-text {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #495057;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .action-buttons .btn {
      padding: 8px 12px;
      font-size: 0.8rem;
      border-radius: 20px;
      transition: all 0.3s ease;
      min-width: 40px;
    }

    .action-buttons .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .action-buttons .btn-outline-success {
      color: #28a745;
      border-color: #28a745;
    }

    .action-buttons .btn-outline-success:hover {
      background-color: #28a745;
      border-color: #28a745;
      color: white;
    }

    .badge-success {
      background-color: #28a745;
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      margin-left: 0.5rem;
    }

    .badge-warning {
      background: linear-gradient(135deg, #ffa726, #ff9800);
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      margin-left: 0.5rem;
    }

    .spinner-border-sm {
      width: 0.8rem;
      height: 0.8rem;
      border-width: 0.1em;
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

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
    }

    .loading-state .spinner-border {
      color: #667eea;
    }

    .loading-state p {
      margin-top: 15px;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .list-container {
        padding: 10px 0;
      }

      .container {
        max-width: 100%;
        padding: 0 10px;
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
      pointer-events: auto;
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
      background: white;
    }

    /* CRITICAL: Modal Form Controls - High Contrast and Visibility */
    .modal-body .form-control,
    .modal-body .form-select,
    .modal-body select,
    .modal-body input,
    .modal-body textarea {
      background-color: #ffffff !important;
      color: #000000 !important;
      border: 2px solid #007bff !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      box-sizing: border-box !important;
    }

    /* Force all form controls in modal to have visible text */
    .modal-body form .form-control,
    .modal-body form select,
    .modal-body form input,
    .modal-body form textarea {
      background-color: #ffffff !important;
      color: #000000 !important;
      border: 2px solid #007bff !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      transition: all 0.3s ease !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      box-sizing: border-box !important;
    }

    /* Additional specificity for select elements */
    .modal-body select.form-control,
    .modal-body form select.form-control {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
      background-position: right 0.5rem center !important;
      background-repeat: no-repeat !important;
      background-size: 1.5em 1.5em !important;
      padding-right: 2.5rem !important;
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    /* Force all select elements to have proper styling */
    .modal-body select,
    .modal-body form select {
      background-color: #ffffff !important;
      color: #000000 !important;
      border: 2px solid #007bff !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      box-sizing: border-box !important;
    }

    .modal-body .form-control:focus,
    .modal-body .form-select:focus,
    .modal-body select:focus,
    .modal-body input:focus,
    .modal-body textarea:focus,
    .modal-body form .form-control:focus,
    .modal-body form .form-select:focus,
    .modal-body form select:focus,
    .modal-body form input:focus,
    .modal-body form textarea:focus {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #0056b3 !important;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
      outline: none !important;
    }

    .modal-body .form-control::placeholder,
    .modal-body .form-select::placeholder,
    .modal-body input::placeholder,
    .modal-body textarea::placeholder,
    .modal-body form .form-control::placeholder,
    .modal-body form .form-select::placeholder,
    .modal-body form input::placeholder,
    .modal-body form textarea::placeholder {
      color: #666666 !important;
      font-weight: 500 !important;
      opacity: 1 !important;
    }

    .modal-body .form-control.is-invalid {
      border-color: #dc3545 !important;
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    .modal-body .form-label {
      color: #000000 !important;
      font-weight: 700 !important;
      font-size: 16px !important;
      margin-bottom: 10px !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .modal-body .form-label i {
      color: #007bff !important;
    }

    .modal-body .form-text {
      color: #666666 !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      margin-top: 5px !important;
    }

    .modal-body .invalid-feedback {
      color: #dc3545 !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      margin-top: 5px !important;
    }

    .modal-body .alert {
      color: #000000 !important;
      font-weight: 600 !important;
      font-size: 14px !important;
      border-radius: 8px !important;
      padding: 15px 20px !important;
      margin-bottom: 20px !important;
    }

    .modal-body .alert-info {
      background-color: #d1ecf1 !important;
      color: #0c5460 !important;
      border: 2px solid #bee5eb !important;
    }

    .modal-body .alert-warning {
      background-color: #fff3cd !important;
      color: #856404 !important;
      border: 2px solid #ffeaa7 !important;
    }

    /* Dropdown Options - High Contrast */
    .modal-body select option,
    .modal-body form select option {
      background-color: #ffffff !important;
      color: #000000 !important;
      font-weight: 600 !important;
      padding: 8px 12px !important;
      border: none !important;
      font-size: 14px !important;
    }

    .modal-body select option:hover,
    .modal-body form select option:hover {
      background-color: #f8f9fa !important;
      color: #000000 !important;
    }

    .modal-body select option:checked,
    .modal-body form select option:checked {
      background-color: #007bff !important;
      color: #ffffff !important;
    }

    /* Force all option elements to be visible */
    .modal-body option,
    .modal-body form option {
      background-color: #ffffff !important;
      color: #000000 !important;
      font-weight: 600 !important;
      padding: 8px 12px !important;
      border: none !important;
      font-size: 14px !important;
    }

    /* Additional CSS to ensure text visibility in all browsers */
    .modal-body * {
      color: inherit !important;
    }

    /* Force text color for all form elements */
    .modal-body input,
    .modal-body select,
    .modal-body textarea,
    .modal-body option {
      color: #000000 !important;
      background-color: #ffffff !important;
    }

    /* Ensure dropdown text is visible */
    .modal-body select option {
      color: #000000 !important;
      background-color: #ffffff !important;
    }

    /* Force visibility for all text elements */
    .modal-body .form-control,
    .modal-body .form-select,
    .modal-body select,
    .modal-body input,
    .modal-body textarea,
    .modal-body option {
      color: #000000 !important;
      background-color: #ffffff !important;
      font-weight: 600 !important;
      font-size: 16px !important;
    }

    /* Button Styles */
    .modal-body .btn {
      border-radius: 8px !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      font-size: 16px !important;
      transition: all 0.3s ease !important;
      border: 2px solid transparent !important;
      min-width: 120px !important;
    }

    .modal-body .btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }

    .modal-body .btn-danger {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
      border-color: #dc3545 !important;
      color: white !important;
    }

    .modal-body .btn-danger:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%) !important;
      border-color: #c82333 !important;
      color: white !important;
    }

    .modal-body .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%) !important;
      border-color: #ffc107 !important;
      color: #212529 !important;
    }

    .modal-body .btn-warning:hover {
      background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%) !important;
      border-color: #e0a800 !important;
      color: #212529 !important;
    }

    .modal-body .btn-secondary {
      background: linear-gradient(135deg, #6c757d 0%, #495057 100%) !important;
      border-color: #6c757d !important;
      color: white !important;
    }

    .modal-body .btn-secondary:hover {
      background: linear-gradient(135deg, #5a6268 0%, #343a40 100%) !important;
      border-color: #5a6268 !important;
      color: white !important;
    }

    .modal-body .btn-outline-info {
      background: transparent !important;
      border-color: #17a2b8 !important;
      color: #17a2b8 !important;
    }

    .modal-body .btn-outline-info:hover {
      background: #17a2b8 !important;
      border-color: #17a2b8 !important;
      color: white !important;
    }

    .modal-body .spinner-border-sm {
      width: 1rem !important;
      height: 1rem !important;
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

      .modal-body .btn {
        width: 100%;
        margin-bottom: 10px;
      }
    }
  `]
})
export class DisposeListComponent implements OnInit {
  Role = Role;
  disposals: Dispose[] = [];
  filteredDisposals: Dispose[] = [];
  categories: any[] = [];
  locations: any[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedCategory = '';
  selectedLocation = '';
  currentPage = 1;
  itemsPerPage = 10;
  Math = Math;

  // Modal properties
  showAddDisposalModal = false;
  showReturnToStockModal = false;
  showViewDisposalModal = false;
  form: FormGroup;
  returnForm: FormGroup;
  items: any[] = [];
  stockEntries: any[] = [];
  availableStockEntries: any[] = [];
  availableStock: number = 0;
  submitted = false;
  returnSubmitted = false;
  isEditMode = false;
  disposalId: number | null = null;
  selectedItemPrice: number = 0;
  selectedDisposal: any = null;

  constructor(
    private disposeService: DisposeService,
    private categoryService: CategoryService,
    private locationService: StorageLocationService,
    private itemService: ItemService,
    private stockService: StockService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFormListeners();
    
    // Check for auto-open modal parameter
    this.route.queryParams.subscribe(params => {
      console.log('Route query params:', params);
      if (params['autoOpenModal'] === 'true' && params['stockEntryId']) {
        console.log('Auto-opening modal with stockEntryId:', params['stockEntryId']);
        // Auto-open the modal and select the stock entry
        setTimeout(() => {
          this.openAddDisposalModal();
          this.form.patchValue({ stockEntryId: Number(params['stockEntryId']) });
          console.log('Modal opened and stock entry selected:', params['stockEntryId']);
        }, 1000); // Wait for data to load
      }
    });
    
    // Listen for stock data changes from other components
    window.addEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }

  // Modal control methods
  openAddDisposalModal() {
    console.log('Opening add disposal modal...');
    this.showAddDisposalModal = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    console.log('Modal state:', this.showAddDisposalModal);
    console.log('Available stock entries count:', this.availableStockEntries.length);
    
    // Reset form and available stock first
    this.resetForm();
    this.availableStock = 0;
    this.selectedItemPrice = 0;
    
    // Refresh stock data when modal opens to ensure we have the latest data
    this.loadStockEntries();
  }

  closeAddDisposalModal() {
    this.showAddDisposalModal = false;
    document.body.style.overflow = 'auto'; // Restore scrolling
    this.resetForm();
  }

  // Return to Stock Modal methods
  returnToStock(disposal: any) {
    console.log('Opening return to stock modal for disposal:', disposal);
    this.selectedDisposal = disposal;
    this.showReturnToStockModal = true;
    document.body.style.overflow = 'hidden';
    
    // Set the maximum quantity in the form
    this.returnForm.patchValue({
      quantity: disposal.quantity,
      remarks: ''
    });
  }

  closeReturnToStockModal() {
    this.showReturnToStockModal = false;
    document.body.style.overflow = 'auto';
    this.selectedDisposal = null;
    this.returnForm.reset();
    this.returnSubmitted = false;
  }

  returnAll() {
    if (this.selectedDisposal) {
      this.returnForm.patchValue({
        quantity: this.selectedDisposal.quantity
      });
    }
  }

  getReturnTotalValue(): number {
    const quantity = this.returnForm.get('quantity')?.value || 0;
    // Ensure disposalValue is properly converted to number
    const disposalValue = this.selectedDisposal?.disposalValue;
    
    // Handle malformed strings like '05800.001800.00'
    let price = 0;
    if (disposalValue) {
      const valueStr = disposalValue.toString();
      // Remove any extra decimal points and keep only the first one
      const cleanValue = valueStr.replace(/\.(?=.*\.)/g, '');
      const parsed = parseFloat(cleanValue);
      price = isNaN(parsed) ? 0 : parsed;
    }
    
    const total = quantity * price;
    console.log('getReturnTotalValue debug:', {
      quantity,
      disposalValue,
      price,
      total
    });
    return total;
  }

  getDisposalValue(): number {
    // Ensure disposalValue is properly converted to number for currency pipe
    const disposalValue = this.selectedDisposal?.disposalValue;
    if (!disposalValue) return 0;
    
    // Handle malformed strings like '05800.001800.00'
    const valueStr = disposalValue.toString();
    // Remove any extra decimal points and keep only the first one
    const cleanValue = valueStr.replace(/\.(?=.*\.)/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  getDisposalValueForItem(disposal: any): number {
    // Ensure disposalValue is properly converted to number for currency pipe
    const disposalValue = disposal?.disposalValue;
    if (!disposalValue) return 0;
    
    // Handle malformed strings like '05800.001800.00'
    const valueStr = disposalValue.toString();
    // Remove any extra decimal points and keep only the first one
    const cleanValue = valueStr.replace(/\.(?=.*\.)/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  getTotalValueForItem(disposal: any): number {
    // Ensure totalValue is properly converted to number for currency pipe
    const totalValue = disposal?.totalValue;
    if (!totalValue) return 0;
    
    // Handle malformed strings like '05800.001800.00'
    const valueStr = totalValue.toString();
    // Remove any extra decimal points and keep only the first one
    const cleanValue = valueStr.replace(/\.(?=.*\.)/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  onReturnSubmit() {
    this.returnSubmitted = true;
    
    if (this.returnForm.invalid || !this.selectedDisposal) {
      return;
    }

    this.loading = true;
    const formData = this.returnForm.value;
    
    console.log('Returning to stock:', {
      disposalId: this.selectedDisposal.id,
      quantity: formData.quantity,
      remarks: formData.remarks
    });

    // Call the backend service to return to stock
    this.disposeService.returnToStockPartial(this.selectedDisposal.id, formData.quantity, formData.remarks)
      .pipe(first())
      .subscribe({
        next: (result) => {
          console.log('Return to stock successful:', result);
          this.alertService.success('Items returned to stock successfully!');
          this.closeReturnToStockModal();
          this.loadData(); // Refresh the disposal list
        },
        error: (error) => {
          console.error('Error returning to stock:', error);
          this.alertService.error('Failed to return items to stock: ' + (error.error?.message || error.message || 'Unknown error'));
          this.loading = false;
        }
      });
  }

  private resetForm() {
    this.form.reset();
    this.submitted = false;
    this.availableStock = 0;
    this.selectedItemPrice = 0;
  }

  initForm() {
    this.form = this.formBuilder.group({
      stockEntryId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1), this.validateQuantity.bind(this)]],
      locationId: ['', Validators.required],
      reason: ['']
    });

    this.returnForm = this.formBuilder.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
      remarks: ['']
    });
  }

  // Custom validator for quantity
  validateQuantity(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const quantity = control.value;
    const stockEntryId = this.form?.get('stockEntryId')?.value;
    
    if (!stockEntryId) return null;
    
    // Convert stockEntryId to number for proper comparison
    const numericStockEntryId = Number(stockEntryId);
    const selectedStock = this.availableStockEntries.find(stock => stock.id === numericStockEntryId);
    if (!selectedStock) return null;
    
    if (quantity > selectedStock.quantity) {
      return { maxQuantity: { max: selectedStock.quantity, actual: quantity } };
    }
    
    return null;
  }

    setupFormListeners() {
    // Listen for stock entry changes to get available quantity
    this.form.get('stockEntryId')?.valueChanges.subscribe(stockEntryId => {
      console.log('Stock entry ID changed to:', stockEntryId);
      if (stockEntryId) {
        this.checkSelectedStockQuantity(stockEntryId);
      } else {
        this.availableStock = 0;
        this.selectedItemPrice = 0;
        console.log('No stock entry selected, available stock set to 0');
      }
    });

    // Listen for quantity changes to update total value
    this.form.get('quantity')?.valueChanges.subscribe(quantity => {
      console.log('Quantity changed to:', quantity);
      // Trigger change detection for total value calculation
      this.form.updateValueAndValidity();
    });
  }

  checkSelectedStockQuantity(stockEntryId: number | string) {
    console.log('=== CHECKING STOCK QUANTITY ===');
    console.log('Stock entry ID (raw):', stockEntryId, 'Type:', typeof stockEntryId);
    console.log('Available stock entries count:', this.availableStockEntries.length);
    console.log('Available stock entries:', this.availableStockEntries);
    
    // Convert stockEntryId to number to ensure proper comparison
    const numericStockEntryId = Number(stockEntryId);
    console.log('Stock entry ID (converted):', numericStockEntryId, 'Type:', typeof numericStockEntryId);
    
    // Log all stock entry IDs for debugging
    this.availableStockEntries.forEach((stock, index) => {
      console.log(`Stock ${index}: ID = ${stock.id} (${typeof stock.id}), Quantity = ${stock.quantity}, Item = ${stock.item?.name}`);
    });
    
    const selectedStock = this.availableStockEntries.find(stock => stock.id === numericStockEntryId);
    console.log('Selected stock found:', !!selectedStock);
    console.log('Selected stock details:', selectedStock);
    
    if (selectedStock) {
      this.availableStock = selectedStock.quantity;
      this.selectedItemPrice = selectedStock.price || 0;
      
      // Auto-populate location from the selected stock entry
      this.form.patchValue({ 
        quantity: selectedStock.quantity,
        locationId: selectedStock.locationId 
      });
      
      console.log('✅ Available stock set to:', this.availableStock);
      console.log('✅ Selected item price:', this.selectedItemPrice);
      console.log('✅ Auto-populated location:', selectedStock.locationId);
    } else {
      this.availableStock = 0;
      this.selectedItemPrice = 0;
      console.log('❌ No stock found for ID:', stockEntryId);
      console.log('❌ Available stock set to 0');
    }
  }

  ngOnDestroy() {
    // Clean up event listener
    window.removeEventListener('stockDataChanged', this.handleStockDataChange.bind(this));
  }

  // Handle stock data changes from other components
  private handleStockDataChange(event: CustomEvent) {
    console.log('Stock data change detected in dispose list component:', event.detail);
    
    // Refresh disposal data when stock changes
    this.loadData();
    
    // Show a brief notification
    this.alertService.info('Stock data updated - disposal records refreshed');
  }

  loadData() {
    console.log('Loading all data...');
    this.loadDisposals();
    this.loadCategories();
    this.loadLocations();
    this.loadItems();
    this.loadStockEntries();
  }

  loadDisposals() {
    this.loading = true;
    console.log('Loading disposal records...');
    
    this.disposeService.getAll()
      .pipe(first())
      .subscribe({
        next: (disposals) => {
          console.log('=== DISPOSALS LOADED ===');
          console.log('Total disposals received:', disposals.length);
          console.log('First disposal object:', disposals[0]);
          console.log('First disposal ID:', disposals[0]?.id);
          console.log('First disposal ID type:', typeof disposals[0]?.id);
          
          // Filter out disposals with 0 quantity or fully returned to stock
          this.disposals = disposals.filter(disposal => {
            const shouldShow = disposal.quantity > 0 && !disposal.returnedToStock;
            if (!shouldShow) {
              console.log(`Filtering out disposal ${disposal.id}: quantity=${disposal.quantity}, returnedToStock=${disposal.returnedToStock}`);
            }
            return shouldShow;
          });
          console.log('Filtered disposals (quantity > 0 and not returned):', this.disposals.length);
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading disposals:', error);
          this.loading = false;
          this.alertService.error('Error loading disposal records: ' + (error.error?.message || error.message || 'Unknown error'));
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

  loadStockEntries() {
    console.log('=== LOADING STOCK ENTRIES ===');
    this.stockService.getAll()
      .pipe(first())
      .subscribe({
        next: (stockEntries) => {
          console.log('Raw stock entries loaded:', stockEntries);
          console.log('Total stock entries:', stockEntries.length);
          
          // Filter out entries with no available quantity and only show available stock entries
          this.availableStockEntries = stockEntries.filter(entry => {
            // A stock entry is available for disposal if:
            // 1. It has quantity > 0 (has items to dispose)
            // Note: Stock entries can be partially disposed, so we allow entries with disposeId
            // as long as they still have remaining quantity
            const hasQuantity = entry.quantity > 0;
            
            const isAvailable = hasQuantity;
            
            console.log(`Stock entry ${entry.id}: quantity = ${entry.quantity}, disposeId = ${entry.disposeId}, isAvailable = ${isAvailable}`);
            console.log('Stock entry data:', {
              id: entry.id,
              itemId: entry.itemId,
              item: entry.item,
              quantity: entry.quantity,
              createdAt: entry.createdAt,
              disposeId: entry.disposeId
            });
            return isAvailable;
          });
          console.log('Available stock entries:', this.availableStockEntries);
          console.log('Available stock entries count:', this.availableStockEntries.length);
          
          // Log the first few entries in detail
          if (this.availableStockEntries.length > 0) {
            console.log('First available stock entry details:', {
              id: this.availableStockEntries[0].id,
              itemName: this.availableStockEntries[0].item?.name,
              quantity: this.availableStockEntries[0].quantity,
              createdAt: this.availableStockEntries[0].createdAt,
              itemObject: this.availableStockEntries[0].item
            });
          } else {
            console.log('No available stock entries found');
          }
          
          // If modal is open and we have stock entries, check if there's a selected stock entry
          if (this.showAddDisposalModal && this.availableStockEntries.length > 0) {
            const currentStockEntryId = this.form.get('stockEntryId')?.value;
            if (currentStockEntryId) {
              console.log('Modal is open, re-checking selected stock entry:', currentStockEntryId);
              this.checkSelectedStockQuantity(currentStockEntryId);
            } else {
              console.log('Modal is open but no stock entry selected yet');
            }
          }
        },
        error: error => {
          console.error('Error loading stock entries:', error);
          this.alertService.error('Error loading stock entries: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
  }

  applyFilters() {
    let filtered = [...this.disposals];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(disposal => {
        const itemName = (disposal.item?.name || 'Unknown Item').toLowerCase();
        const reason = (disposal.reason || '').toLowerCase();
        return itemName.includes(this.searchTerm.toLowerCase()) || 
               reason.includes(this.searchTerm.toLowerCase());
      });
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(disposal => {
        const categoryName = disposal.item?.category?.name || '';
        return categoryName.toLowerCase().includes(this.selectedCategory.toLowerCase());
      });
    }

    // Location filter
    if (this.selectedLocation) {
      filtered = filtered.filter(disposal => {
        return disposal.locationId == Number(this.selectedLocation);
      });
    }

    this.filteredDisposals = filtered;
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

  getThisMonthDisposals(): number {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return this.disposals.filter(disposal => {
      const disposalDate = new Date(disposal.disposalDate);
      return disposalDate.getMonth() === thisMonth && disposalDate.getFullYear() === thisYear;
    }).length;
  }

  viewDisposal(id: number) {
    console.log('=== VIEW DISPOSAL CLICKED ===');
    console.log('ID received:', id);
    console.log('ID type:', typeof id);
    
    if (!id) {
      console.error('No ID provided for view disposal');
      this.alertService.error('Invalid disposal ID');
      return;
    }
    
    // Find the disposal by ID
    const disposal = this.disposals.find(d => d.id === id);
    if (!disposal) {
      console.error('Disposal not found with ID:', id);
      this.alertService.error('Disposal not found');
      return;
    }
    
    // Set selected disposal and show modal
    this.selectedDisposal = disposal;
    this.showViewDisposalModal = true;
    console.log('Showing disposal modal for:', disposal);
  }

  closeViewDisposalModal() {
    this.showViewDisposalModal = false;
    this.selectedDisposal = null;
  }

  editDisposal(id: number) {
    console.log('=== EDIT DISPOSAL CLICKED ===');
    console.log('ID received:', id);
    console.log('ID type:', typeof id);
    console.log('Current route:', this.router.url);
    
    if (!id) {
      console.error('No ID provided for edit disposal');
      this.alertService.error('Invalid disposal ID');
      return;
    }
    
    try {
    this.router.navigate(['/dispose/edit', id]);
      console.log('Navigation attempted to:', `/dispose/edit/${id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      this.alertService.error('Failed to navigate to disposal edit');
    }
  }

  deleteDisposal(id: number) {
    console.log('Delete disposal clicked for ID:', id);
    if (confirm('Are you sure you want to delete this disposal record?')) {
      this.disposeService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.alertService.success('Disposal record deleted successfully');
            this.loadDisposals();
          },
          error: (error) => {
            console.error('Error deleting disposal:', error);
            this.alertService.error('Error deleting disposal record');
          }
        });
    }
  }



  hasRole(roles: Role[]): boolean {
    const account = this.accountService.accountValue;
    if (!account) return false;
    return roles.some(role => role === account.role);
  }

  getTotalDisposalValue(): number {
    return this.disposals.reduce((sum, disposal) => sum + (disposal.totalValue || 0), 0);
  }

  getTotalDisposedItems(): number {
    return this.disposals.reduce((sum, disposal) => sum + (disposal.quantity || 0), 0);
  }

  viewStockInfo(itemId: number) {
    console.log('View stock info clicked for item ID:', itemId);
    
    // Find stock entries for this item
    const itemStocks = this.availableStockEntries.filter(stock => stock.itemId === itemId);
    
    if (itemStocks.length > 0) {
      // Show stock info in a modal or alert
      const stockInfo = itemStocks.map(stock => 
        `Stock ID: ${stock.id} - Quantity: ${stock.quantity} units - Added: ${new Date(stock.createdAt).toLocaleDateString()}`
      ).join('\n');
      
      this.alertService.info(`Stock Information for Item ID ${itemId}:\n\n${stockInfo}`);
    } else {
      this.alertService.error('No stock entries found for this item.');
    }
  }

  addNewDisposal() {
    console.log('Add new disposal clicked');
    this.openAddDisposalModal();
  }

  // Form submission and validation
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    
    // Get the selected stock entry to validate and get additional data
    // Convert to number since HTML select returns string but stock.id is number
    const numericStockEntryId = Number(formData.stockEntryId);
    const selectedStock = this.availableStockEntries.find(stock => stock.id === numericStockEntryId);
    
    if (!selectedStock) {
      this.alertService.error('Selected stock entry not found');
      return;
    }

    // Validate quantity
    if (formData.quantity > selectedStock.quantity) {
      this.alertService.error(`Cannot dispose ${formData.quantity} units. Only ${selectedStock.quantity} units available in this stock entry`);
      return;
    }

    // Prepare the data for the backend
    const disposalData = {
      stockEntryId: formData.stockEntryId,
      quantity: formData.quantity,
      locationId: formData.locationId,
      reason: formData.reason || ''
    };
    
    console.log('=== FRONTEND: SENDING DISPOSAL DATA ===');
    console.log('Form data:', formData);
    console.log('Selected stock:', selectedStock);
    console.log('Disposal data being sent:', disposalData);
    console.log('Data types:', {
      stockEntryId: typeof disposalData.stockEntryId,
      quantity: typeof disposalData.quantity,
      locationId: typeof disposalData.locationId,
      reason: typeof disposalData.reason
    });
    
    this.disposeService.create(disposalData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Disposal created successfully');
          this.closeAddDisposalModal();
          this.loadDisposals();
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('stockDataChanged', {
            detail: {
              action: 'disposalCreated',
              stockEntryId: formData.stockEntryId,
              quantity: formData.quantity
            }
          }));
        },
        error: error => {
          console.error('Error creating disposal:', error);
          this.alertService.error('Error creating disposal record: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
  }

           disposeAll() {
      if (!this.form.value.stockEntryId) {
        this.alertService.error('Please select a stock entry first');
        return;
      }

      if (this.availableStock <= 0) {
        this.alertService.error('No stock available to dispose');
        return;
      }

      if (!confirm(`Are you sure you want to dispose ALL ${this.availableStock} available units?`)) {
        return;
      }

      this.form.patchValue({ quantity: this.availableStock });
      this.onSubmit();
    }

  refreshStockData() {
    const currentStockEntryId = this.form.get('stockEntryId')?.value;
    if (currentStockEntryId) {
      this.checkSelectedStockQuantity(currentStockEntryId);
    }
  }

  debugStockData() {
    console.log('=== DEBUG STOCK DATA ===');
    console.log('Available stock entries:', this.availableStockEntries);
    console.log('Form value:', this.form.value);
    console.log('Available stock:', this.availableStock);
    console.log('Selected item price:', this.selectedItemPrice);
    
    const currentStockEntryId = this.form.get('stockEntryId')?.value;
    if (currentStockEntryId) {
      console.log('Current stock entry ID:', currentStockEntryId);
      this.checkSelectedStockQuantity(currentStockEntryId);
    } else {
      console.log('No stock entry selected');
    }
    
    // Test: Try to find a stock entry by ID
    if (this.availableStockEntries.length > 0) {
      const firstStock = this.availableStockEntries[0];
      console.log('Testing with first stock entry:', firstStock);
      this.checkSelectedStockQuantity(firstStock.id);
    }
  }

  getSelectedStockLocation(): string {
    const stockEntryId = this.form.get('stockEntryId')?.value;
    if (!stockEntryId) return 'No stock entry selected';
    
    // Convert to number since HTML select returns string but stock.id is number
    const numericStockEntryId = Number(stockEntryId);
    const selectedStock = this.availableStockEntries.find(stock => stock.id === numericStockEntryId);
    if (!selectedStock) return 'Stock entry not found';
    
    return selectedStock.location?.name || 'Location not available';
  }

  getSelectedStock(): any {
    const stockEntryId = this.form.get('stockEntryId')?.value;
    if (!stockEntryId) return null;
    
    // Convert stockEntryId to number for proper comparison
    const numericStockEntryId = Number(stockEntryId);
    return this.availableStockEntries.find(stock => stock.id === numericStockEntryId);
  }

  getTotalValue(): number {
    const quantity = this.form.get('quantity')?.value || 0;
    return quantity * this.selectedItemPrice;
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredDisposals.length / this.itemsPerPage);
  }

  get paginatedDisposals(): Dispose[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredDisposals.slice(start, end);
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
} 