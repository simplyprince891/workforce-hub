import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TaskService, TaskResponse } from '../../services/task.service';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { ExportService } from '../../services/export.service';
import { LeaveService } from '../../services/leave.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout pageTitle="Overview" pageSubtitle="Tracking progress and operations">
      <div header-actions *ngIf="canExport()" class="d-flex gap-2">
        <button class="btn btn-outline-dark btn-sm rounded-pill px-3" (click)="exportEmployees('pdf')">
          <i class="fas fa-file-pdf me-2"></i> Employees PDF
        </button>
        <button class="btn btn-dark btn-sm rounded-pill px-3" (click)="exportTasks('pdf')">
          <i class="fas fa-file-export me-2"></i> Tasks PDF
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="glass-card stat-widget h-100">
            <span class="stat-label">Total Tasks</span>
            <span class="stat-value">{{ stats.totalTasks }}</span>
            <div class="small text-muted mt-auto">System wide total</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="glass-card stat-widget h-100">
            <span class="stat-label">Pending</span>
            <span class="stat-value text-warning">{{ stats.pendingTasks }}</span>
            <div class="small text-muted mt-auto">Awaiting action</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="glass-card stat-widget h-100">
            <span class="stat-label">Completed</span>
            <span class="stat-value text-success">{{ stats.completedTasks }}</span>
            <div class="small text-muted mt-auto">Successfully done</div>
          </div>
        </div>
        <div class="col-md-3" *ngIf="isAdmin()">
          <div class="glass-card stat-widget h-100">
            <span class="stat-label">Organization</span>
            <span class="stat-value">{{ stats.totalEmployees }}</span>
            <div class="small text-muted mt-auto">Active accounts</div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-5" *ngIf="isAdmin() || isManager()">
        <div class="mb-4" [ngClass]="isAdmin() ? 'col-md-6' : 'col-md-12'">
          <div class="glass-card h-100">
            <h3 class="display-font fs-5 mb-4 border-bottom pb-2">Operational Analytics</h3>
            <div class="d-flex flex-column gap-4">
              <div class="chart-item">
                <div class="d-flex justify-content-between mb-2">
                  <span class="small fw-bold">Completed Tasks</span>
                  <span class="small">{{ getTaskPercent(stats.completedTasks) | number:'1.0-0' }}%</span>
                </div>
                <div class="progress" style="height: 4px;">
                  <div class="progress-bar bg-black" [style.width.%]="getTaskPercent(stats.completedTasks)"></div>
                </div>
              </div>
              <div class="chart-item">
                <div class="d-flex justify-content-between mb-2">
                  <span class="small fw-bold">In Progress</span>
                  <span class="small">{{ getTaskPercent(stats.inProgressTasks) | number:'1.0-0' }}%</span>
                </div>
                <div class="progress" style="height: 4px;">
                  <div class="progress-bar bg-dark" [style.width.%]="getTaskPercent(stats.inProgressTasks)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4" *ngIf="isAdmin()">
          <div class="glass-card h-100">
            <h3 class="display-font fs-5 mb-4 border-bottom pb-2">Leave Summary</h3>
            <div class="d-flex align-items-center mb-4 gap-4">
              <div class="display-font text-black" style="font-size: 3rem;">{{ leaveSummary.pending }}</div>
              <div class="small text-muted text-uppercase fw-bold letter-spacing-1">Requests<br>Pending</div>
            </div>
            <div class="row g-2 mt-2">
              <div class="col-6">
                <div class="p-2 border rounded text-center">
                  <div class="small text-muted">Approved</div>
                  <div class="fw-bold">{{ leaveSummary.approved }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="p-2 border rounded text-center">
                  <div class="small text-muted">Rejected</div>
                  <div class="fw-bold">{{ leaveSummary.rejected }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-0">
        <div class="p-4 d-flex justify-content-between align-items-center border-bottom">
          <h3 class="display-font fs-5 mb-0">Recent Activity</h3>
          <a routerLink="/tasks" class="btn btn-link btn-sm text-black text-decoration-none fw-bold">View All <i class="fas fa-arrow-right ms-1"></i></a>
        </div>
        
        <div class="table-responsive p-3" *ngIf="recentTasks.length > 0; else emptyState">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of recentTasks" class="animate-fade-in">
                <td>
                  <a [routerLink]="['/tasks', task.id]" class="text-decoration-none fw-bold text-black">
                    {{ task.title }}
                  </a>
                </td>
                <td><span class="badge-premium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span></td>
                <td><span class="badge-premium" [ngClass]="getStatusClass(task.status)">{{ task.status }}</span></td>
                <td class="small text-muted">{{ task.deadline | date:'mediumDate' }}</td>
                <td class="small">{{ task.assignedToName || 'Unassigned' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <ng-template #emptyState>
          <div class="p-5 text-center text-muted">
            <i class="fas fa-inbox display-4 mb-3 opacity-25"></i>
            <h5 class="display-font text-dark">No recent activity</h5>
            <p class="small">New tasks will appear here as they are created.</p>
          </div>
        </ng-template>
      </div>
    </app-layout>
  `
})
export class DashboardComponent implements OnInit {
  stats = {
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalEmployees: 0
  };
  
  leaveSummary: any = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };
  
  recentTasks: TaskResponse[] = [];
  currentUser = this.authService.getCurrentUser();

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private exportService: ExportService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentTasks();
  }

  loadStats(): void {
    if (this.isAdmin() || this.isManager()) {
      this.employeeService.getAll(0, 1).subscribe(res => {
        this.stats.totalEmployees = res.totalElements;
      });
      
      this.leaveService.getLeaveSummary().subscribe({
        next: (data) => this.leaveSummary = data,
        error: (err) => console.error('Leave summary error:', err)
      });
    }

    if (this.isAdmin()) {
      this.taskService.getAll(0, 100).subscribe(res => {
        this.calculateTaskStats(res.content);
      });
    } else if (this.authService.hasRole(['MANAGER', 'TEAM_LEAD'])) {
      this.taskService.getByEmployee(this.currentUser!.employeeId).subscribe((assignedToMe: any[]) => {
        this.taskService.getByManager(this.currentUser!.employeeId).subscribe((assignedByMe: any[]) => {
          const all = [...assignedToMe, ...assignedByMe];
          const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
          this.calculateTaskStats(unique);
        });
      });
    } else {
      this.taskService.getByEmployee(this.currentUser!.employeeId).subscribe((res: any[]) => {
        this.calculateTaskStats(res);
      });
    }
  }
  
  calculateTaskStats(tasks: any[]): void {
    this.stats.totalTasks = tasks.length;
    this.stats.pendingTasks = tasks.filter((t: any) => t.status === 'PENDING').length;
    this.stats.inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
    this.stats.completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  }
  
  getTaskPercent(val: number): number {
    if (!this.stats.totalTasks) return 0;
    return (val / this.stats.totalTasks) * 100;
  }
  
  getLeavePercent(val: number): number {
    if (!this.leaveSummary.total) return 0;
    return (val / this.leaveSummary.total) * 100;
  }

  loadRecentTasks(): void {
    if (!this.currentUser) return;
    
    if (this.isAdmin()) {
      this.taskService.getAll(0, 5).subscribe(res => {
        this.recentTasks = res.content;
      });
    } else if (this.authService.hasRole(['MANAGER', 'TEAM_LEAD'])) {
      this.taskService.getByEmployee(this.currentUser.employeeId).subscribe((assignedToMe: any[]) => {
        this.taskService.getByManager(this.currentUser!.employeeId).subscribe((assignedByMe: any[]) => {
          const all = [...assignedToMe, ...assignedByMe];
          const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
          // Sort by latest and take top 5
          this.recentTasks = unique.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
        });
      });
    } else {
      this.taskService.getByEmployee(this.currentUser.employeeId).subscribe((res: any[]) => {
        this.recentTasks = res.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
      });
    }
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'badge-premium-red', 'MEDIUM': 'badge-premium-blue', 'LOW': 'badge-premium-green' };
    return map[priority] || 'badge-secondary';
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING': 'badge-premium-blue', 'IN_PROGRESS': 'badge-premium-blue', 'DONE': 'badge-premium-green' };
    return map[status] || 'badge-secondary';
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isManager(): boolean {
    return this.authService.hasRole(['MANAGER']);
  }

  canExport(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER', 'TEAM_LEAD']);
  }

  exportEmployees(format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.exportService.exportEmployeesPdf().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.pdf';
        a.click();
      });
    } else {
      this.exportService.exportEmployeesExcel().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.xlsx';
        a.click();
      });
    }
  }

  exportTasks(format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.exportService.exportTasksPdf().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.pdf';
        a.click();
      });
    } else {
      this.exportService.exportTasksExcel().subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.xlsx';
        a.click();
      });
    }
  }
}