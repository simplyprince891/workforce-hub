import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">WorkForce Hub</a>
        <div class="d-flex">
          <span class="navbar-text me-3">{{ user?.name }} ({{ user?.role }})</span>
          <button class="btn btn-sm btn-outline-light" (click)="logout()">Logout</button>
        </div>
      </div>
    </nav>
    
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-2 sidebar">
          <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link active" routerLink="/dashboard">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/employees">Employees</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/tasks">Tasks</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <h2 class="page-header">Dashboard</h2>
          
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalEmployees }}</div>
                <div class="stat-label">Total Employees</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalTasks }}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card">
                <div class="stat-value">{{ stats.pendingTasks }}</div>
                <div class="stat-label">Pending Tasks</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card">
                <div class="stat-value">{{ stats.completedTasks }}</div>
                <div class="stat-label">Completed Tasks</div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Quick Actions</h5>
                  <div class="d-grid gap-2">
                    <a routerLink="/employees/add" class="btn btn-primary">Add Employee</a>
                    <a routerLink="/tasks" class="btn btn-primary">View Tasks</a>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Export Data</h5>
                  <div class="d-grid gap-2">
                    <button class="btn btn-success" (click)="exportEmployeesPdf()">Export Employees PDF</button>
                    <button class="btn btn-success" (click)="exportTasksPdf()">Export Tasks PDF</button>
                    <button class="btn btn-info" (click)="exportEmployeesExcel()">Export Employees Excel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user = this.authService.getCurrentUser();
  stats = { totalEmployees: 0, totalTasks: 0, pendingTasks: 0, completedTasks: 0 };

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.employeeService.getAll(0, 1).subscribe(res => {
      this.stats.totalEmployees = res.totalElements;
    });
    
    this.taskService.getAll(0, 1).subscribe(res => {
      this.stats.totalTasks = res.totalElements;
      this.stats.pendingTasks = res.content.filter(t => t.status === 'PENDING').length;
      this.stats.completedTasks = res.content.filter(t => t.status === 'DONE').length;
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  exportEmployeesPdf(): void {
    import('../../services/export.service').then(m => {
      m.ExportService.prototype.exportEmployeesPdf().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.pdf';
        a.click();
      });
    });
  }

  exportTasksPdf(): void {
    import('../../services/export.service').then(m => {
      m.ExportService.prototype.exportTasksPdf().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.pdf';
        a.click();
      });
    });
  }

  exportEmployeesExcel(): void {
    import('../../services/export.service').then(m => {
      m.ExportService.prototype.exportEmployeesExcel().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.xlsx';
        a.click();
      });
    });
  }
}