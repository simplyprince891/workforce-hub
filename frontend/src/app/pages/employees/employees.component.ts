import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse, PagedResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">WorkForce Hub</a>
        <div class="d-flex">
          <span class="navbar-text me-3">{{ currentUser?.name }} ({{ currentUser?.role }})</span>
          <button class="btn btn-sm btn-outline-light" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
    
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-2 sidebar">
          <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" routerLink="/dashboard">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link active" routerLink="/employees">Employees</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/tasks">Tasks</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="page-header">Employees</h2>
            <a routerLink="/employees/add" class="btn btn-primary" *ngIf="canAddEmployee()">Add Employee</a>
          </div>
          
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <input type="text" class="form-control" placeholder="Search by name" [(ngModel)]="searchName">
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control" placeholder="Search by email" [(ngModel)]="searchEmail">
                </div>
                <div class="col-md-3">
                  <select class="form-select" [(ngModel)]="filterDept">
                    <option value="">All Departments</option>
                    <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-primary w-100" (click)="search()">Search</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let emp of employees">
                    <td>{{ emp.id }}</td>
                    <td>{{ emp.name }}</td>
                    <td>{{ emp.email }}</td>
                    <td>{{ emp.age }}</td>
                    <td>{{ emp.department }}</td>
                    <td><span class="badge" [class]="getRoleClass(emp.role)">{{ emp.role }}</span></td>
                    <td>{{ emp.salary | currency }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary me-1" [routerLink]="['/employees/edit', emp.id]" *ngIf="canEditEmployee()">Edit</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteEmployee(emp.id)" *ngIf="canDeleteEmployee()">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span>Showing {{ page + 1 }} of {{ totalPages }} pages</span>
            <nav>
              <ul class="pagination mb-0">
                <li class="page-item" [class.disabled]="page === 0">
                  <button class="page-link" (click)="goToPage(page - 1)">Previous</button>
                </li>
                <li class="page-item" *ngFor="let p of [].constructor(totalPages); let i = index" 
                    [class.active]="i === page">
                  <button class="page-link" (click)="goToPage(i)">{{ i + 1 }}</button>
                </li>
                <li class="page-item" [class.disabled]="page >= totalPages - 1">
                  <button class="page-link" (click)="goToPage(page + 1)">Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
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
    if (this.searchName || this.searchEmail) {
      this.employeeService.search(this.searchName, this.searchEmail, this.page, this.size).subscribe(res => {
        this.employees = res.content;
        this.totalPages = res.totalPages;
      });
    } else if (this.filterDept) {
      this.employeeService.filterByDepartment(this.filterDept, this.page, this.size).subscribe(res => {
        this.employees = res.content;
        this.totalPages = res.totalPages;
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
    if (confirm('Are you sure?')) {
      this.employeeService.delete(id).subscribe(() => this.loadEmployees());
    }
  }

  getRoleClass(role: string): string {
    const map: any = { 'ADMIN': 'bg-danger', 'MANAGER': 'bg-primary', 'TEAM_LEAD': 'bg-info', 'EMPLOYEE': 'bg-success' };
    return map[role] || 'bg-secondary';
  }

  canAddEmployee(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  canEditEmployee(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  canDeleteEmployee(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}