import { Component, inject, OnInit } from '@angular/core';
import { EmployeeService } from '../../../services/employee.service';
import { AuthService } from '../../../services/auth.service';
import { Employee } from '../../../models/employee.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import {ButtonComponent} from '../../shared/button/button.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ButtonComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  employees: Employee[] = [];
  pagedEmployees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  showDeleteModal = false;
  selectedEmployee: Employee | null = null;

  currentPage: number = 1;
  pageSize: number = 10;
  active: boolean = true;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to view this page.");
      return;
    }
    this.loadEmployees();
  }

  currentUserId = this.authService.getUserId();
  loadEmployees(): void {
    this.employeeService.getEmployees(0, 100).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.filteredEmployees = [...this.employees]; // Kopija liste za paginaciju
        this.updatePagedEmployees();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to load employees. Please try again later.');
        this.employees = [];
      }
    });
  }

  updatePagedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedEmployees = this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.updatePagedEmployees();
  }

  openDeleteModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.selectedEmployee = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to delete employees.");
      return;
    }

    if (this.selectedEmployee) {
      this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
        next: () => {
          this.alertService.showAlert("success", "Employee deleted successfully.");
          this.loadEmployees();
          this.closeDeleteModal();
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to delete employee. Please try again.');
        }
      });
    }
  }

  register() {
    this.router.navigate(['/register-employee']);
  }

  deactivateEmployee(id: number, isActive: undefined | boolean): void {
    if (!this.isAdmin) {
      this.alertService.showAlert("error", "You are not authorized to change employee status.");
      return;
    }

    if (isActive) {
      // Deactivate employee
      this.employeeService.deactivateEmployee(id).subscribe({
        next: () => {
          this.updateEmployeeStatus(id, false); // Update UI immediately
          this.alertService.showAlert("success", "Employee deactivated successfully.");
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to deactivate employee. Please try again.');
        }
      });
    } else {
      // Activate employee
      this.employeeService.activateEmployee(id).subscribe({
        next: () => {
          this.updateEmployeeStatus(id, true); // Update UI immediately
          this.alertService.showAlert("success", "Employee activated successfully.");
        },
        error: () => {
          this.alertService.showAlert('error', 'Failed to activate employee. Please try again.');
        }
      });
    }
  }

  private updateEmployeeStatus(id: number, isActive: boolean): void {
    const employee = this.employees.find(emp => emp.id === id);
    if (employee) {
      employee.active = isActive;
    }
  }

  viewEmployeeDetails(id: number): void {
    if(id === this.currentUserId)
      this.router.navigate(['/employee', id]);
    else
      this.router.navigate(['/employees', id]);
  }
}
