import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse, PagedResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Staff Directory" pageSubtitle="Monitoring and managing the organization">
      <div header-actions>
        <a routerLink="/employees/add" class="btn btn-dark btn-sm rounded-pill px-3" *ngIf="canAddEmployee()">
          <i class="fas fa-user-plus me-2"></i> Add Employee
        </a>
      </div>

      <!-- Filters Section -->
      <div class="glass-card mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Search Name</label>
            <div class="position-relative">
              <i class="fas fa-search position-absolute text-muted" style="left: 1rem; top: 50%; transform: translateY(-50%);"></i>
              <input type="text" class="modern-input ps-5" placeholder="Employee name..." [(ngModel)]="searchName">
            </div>
          </div>
          <div class="col-md-3">
            <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Search Email</label>
            <div class="position-relative">
              <i class="fas fa-envelope position-absolute text-muted" style="left: 1rem; top: 50%; transform: translateY(-50%);"></i>
              <input type="text" class="modern-input ps-5" placeholder="Email address..." [(ngModel)]="searchEmail">
            </div>
          </div>
          <div class="col-md-3">
            <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Department</label>
            <select class="modern-input" [(ngModel)]="filterDept">
              <option value="">All Departments</option>
              <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-dark w-100 py-2" (click)="search()">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div class="glass-card p-0 overflow-hidden">
        <div class="table-responsive p-3" *ngIf="employees.length > 0; else emptyState">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Department</th>
                <th>Role</th>
                <th *ngIf="isAdmin() || isManager()">Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees" class="animate-fade-in">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar bg-black text-white" style="width: 40px; height: 40px; font-size: 14px;">
                      {{ emp.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="fw-bold text-black">{{ emp.name }}</div>
                      <div class="text-muted small">{{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="small fw-bold">{{ emp.department }}</td>
                <td><span class="badge-premium" [ngClass]="getRoleClass(emp.role)">{{ emp.role }}</span></td>
                <td *ngIf="isAdmin() || isManager()" class="fw-bold">{{ emp.salary | currency:'INR' }}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-link btn-sm text-black p-0" [routerLink]="['/employees/edit', emp.id]" *ngIf="canEditEmployee()">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger p-0" (click)="deleteEmployee(emp.id)" *ngIf="canDeleteEmployee()">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <ng-template #emptyState>
          <div class="p-5 text-center text-muted">
            <i class="fas fa-users display-4 mb-3 opacity-25"></i>
            <h5 class="display-font text-dark">No employees found</h5>
            <p class="small">Try adjusting your search filters or add a new employee.</p>
          </div>
        </ng-template>
        
        <div class="p-4 border-top d-flex justify-content-between align-items-center bg-light" *ngIf="totalPages > 0">
          <span class="text-muted small fw-bold">Page {{ page + 1 }} of {{ totalPages }}</span>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm rounded-pill px-3" [disabled]="page === 0" (click)="goToPage(page - 1)">
              <i class="fas fa-chevron-left me-1"></i> Prev
            </button>
            <button class="btn btn-dark btn-sm rounded-pill px-3" [disabled]="page >= totalPages - 1" (click)="goToPage(page + 1)">
              Next <i class="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeResponse[] = [];
  departments: string[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  searchName = '';
  searchEmail = '';
  filterDept = '';
  currentUser = this.authService.getCurrentUser();

  constructor(private employeeService: EmployeeService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.employeeService.getAll(this.page, this.size).subscribe(res => {
      this.employees = res.content;
      this.totalElements = res.totalElements;
      this.totalPages = res.totalPages;
    });
  }

  loadDepartments(): void {
    this.employeeService.getDepartments().subscribe(depts => this.departments = depts);
  }

  search(): void {
    this.page = 0; // Reset to first page on new search
    if (this.searchName || this.searchEmail) {
      this.employeeService.search(this.searchName || undefined, this.searchEmail || undefined, this.page, this.size).subscribe(res => {
        this.employees = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      });
    } else if (this.filterDept) {
      this.employeeService.filterByDepartment(this.filterDept, this.page, this.size).subscribe(res => {
        this.employees = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      });
    } else {
      this.loadEmployees();
    }
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadEmployees();
  }

  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.delete(id).subscribe(() => this.loadEmployees());
    }
  }

  getRoleClass(role: string): string {
    const map: any = { 'ADMIN': 'badge-premium-red', 'MANAGER': 'badge-premium-blue', 'TEAM_LEAD': 'badge-premium-blue', 'EMPLOYEE': 'badge-premium-green' };
    return map[role] || 'badge-secondary';
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isManager(): boolean {
    return this.authService.hasRole(['MANAGER']);
  }

  canAddEmployee(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  canEditEmployee(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  canDeleteEmployee(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }
}