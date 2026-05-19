import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskRequest, TaskResponse } from '../../services/task.service';
import { EmployeeService, EmployeeResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';
import { HttpClient } from '@angular/common/http';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Tasks" pageSubtitle="Strategic tracking and execution">
      <div header-actions *ngIf="canManageTasks()">
        <button class="btn-premium me-2" (click)="exportToExcel()" style="height: 3rem; --color: #2563eb; border-color: #2563eb;">
          <i class="fas fa-file-excel me-2"></i> Export Excel
        </button>
        <button class="btn-premium" (click)="openCreateModal()" style="height: 3rem;">
          <i class="fas fa-plus me-2"></i> Create Task
        </button>
      </div>

      <div class="row g-4 mb-4">
        <!-- Columns: PENDING, IN_PROGRESS, DONE -->
        <div class="col-md-4" *ngFor="let col of [{id:'PENDING', title:'To Do'}, {id:'IN_PROGRESS', title:'In Progress'}, {id:'DONE', title:'Completed'}]">
          <div class="h-100">
            <h5 class="display-font fs-6 mb-4 d-flex align-items-center gap-2 text-muted">
              <span class="badge-premium" [ngClass]="col.id === 'DONE' ? 'badge-premium-green' : 'badge-premium-blue'" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">{{ getTasksByStatus(col.id).length }}</span> 
              {{ col.title }}
            </h5>
            
            <div class="glass-card mb-3 p-3 animate-fade-in" 
                 [ngClass]="{'border-start border-4 border-primary': col.id === 'IN_PROGRESS', 'opacity-75': col.id === 'DONE'}" 
                 *ngFor="let task of getTasksByStatus(col.id)">
              
              <div class="d-flex justify-content-between mb-2">
                <span class="badge-premium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                <div class="d-flex align-items-center gap-2">
                  <span class="text-muted small x-small fw-bold">{{ task.deadline | date:'MMM d' }}</span>
                  <button *ngIf="canManageTasks()" class="btn btn-sm btn-light p-1 border-0 shadow-sm" (click)="openEditModal(task)" style="width: 24px; height: 24px; border-radius: 4px;" title="Edit Task">
                    <i class="fas fa-pencil-alt x-small"></i>
                  </button>
                </div>
              </div>
              
              <h6 class="mb-3">
                <a [routerLink]="['/tasks', task.id]" class="text-black text-decoration-none fw-bold" [ngClass]="{'text-muted text-decoration-line-through': col.id === 'DONE'}">
                  {{ task.title }}
                </a>
              </h6>

              <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div class="small text-muted d-flex align-items-center gap-2">
                  <div *ngIf="task.teamName" class="badge-premium badge-premium-blue x-small">Team: {{ task.teamName }}</div>
                  <ng-container *ngIf="!task.teamName">
                    <div class="avatar bg-black text-white x-small" style="width: 20px; height: 20px; font-size: 8px;">{{ (task.assignedToName || 'U').charAt(0) }}</div>
                    <span class="x-small fw-bold text-truncate" style="max-width: 80px;">{{ task.assignedToName || 'Unassigned' }}</span>
                  </ng-container>
                </div>
                
                <div *ngIf="canUpdateTask(task)">
                  <select class="modern-input x-small py-1 px-2 border-0 bg-light" (change)="updateStatus(task.id, $event)" style="width: auto;">
                    <option value="PENDING" [selected]="task.status === 'PENDING'">To Do</option>
                    <option value="IN_PROGRESS" [selected]="task.status === 'IN_PROGRESS'">In Progress</option>
                    <option value="DONE" [selected]="task.status === 'DONE'">Done</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Modal -->
      <div class="modal-overlay-custom" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content-premium" (click)="$event.stopPropagation()">
          <div class="modal-header-premium">
            <h3 class="display-font">{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h3>
            <button class="btn-link text-muted p-0 border-0 bg-transparent" (click)="closeModal()">
              <i class="fas fa-times fs-5"></i>
            </button>
          </div>
          <div class="modal-body-premium">
            <form (ngSubmit)="onSubmit()">
              <div class="mb-4">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Task Title</label>
                <input type="text" class="modern-input" name="title" [(ngModel)]="taskForm.title" required placeholder="Project milestone name...">
              </div>
              <div class="mb-4">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Description</label>
                <textarea class="modern-input" name="description" [(ngModel)]="taskForm.description" rows="3" placeholder="Define the scope and goals..."></textarea>
              </div>
              <div class="row g-3">
                <div class="col-md-6 mb-4">
                  <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Assign To Individual</label>
                  <select class="modern-input" name="assignedToId" [(ngModel)]="taskForm.assignedToId" [disabled]="taskForm.teamId">
                    <option [ngValue]="null">None</option>
                    <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.name }} ({{ emp.role }})</option>
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Assign To Team</label>
                  <select class="modern-input" name="teamId" [(ngModel)]="taskForm.teamId" [disabled]="taskForm.assignedToId">
                    <option [ngValue]="null">None</option>
                    <option *ngFor="let t of teams" [value]="t.id">{{ t.name }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Priority</label>
                  <select class="modern-input" name="priority" [(ngModel)]="taskForm.priority" required>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Deadline</label>
                  <input type="date" class="modern-input" name="deadline" [(ngModel)]="taskForm.deadline" required>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" class="btn btn-link text-muted text-decoration-none fw-bold" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn-premium" style="height: 3rem; width: auto;">
                  {{ isEditing ? 'Save Changes' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  employees: any[] = [];
  teams: any[] = [];
  showModal = false;
  isEditing = false;
  currentTaskId: number | null = null;
  currentUser = this.authService.getCurrentUser();

  taskForm: any = {
    title: '',
    description: '',
    assignedToId: null,
    teamId: null,
    priority: 'MEDIUM',
    status: 'PENDING',
    deadline: ''
  };

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private http: HttpClient,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    if (this.canManageTasks()) {
      this.loadEmployees();
      this.loadTeams();
    }
  }

  loadTasks(): void {
    if (!this.currentUser) return;
    this.taskService.getAll(0, 100).subscribe(res => {
      this.tasks = res.content;
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll(0, 100).subscribe(res => {
      this.employees = res.content;
    });
  }

  loadTeams(): void {
    this.http.get<any[]>('http://localhost:8080/api/teams').subscribe(res => {
      this.teams = res;
    });
  }

  getTasksByStatus(status: string): any[] {
    return this.tasks.filter(t => t.status === status);
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentTaskId = null;
    this.taskForm = {
      title: '',
      description: '',
      assignedToId: null,
      teamId: null,
      priority: 'MEDIUM',
      status: 'PENDING',
      deadline: new Date().toISOString().split('T')[0]
    };
    this.showModal = true;
  }

  openEditModal(task: any): void {
    this.isEditing = true;
    this.currentTaskId = task.id;
    this.taskForm = {
      title: task.title,
      description: task.description,
      assignedToId: task.assignedToId,
      teamId: task.teamId,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    const request: any = {
      ...this.taskForm,
      assignedById: this.currentUser?.employeeId
    };

    if (this.isEditing && this.currentTaskId) {
      this.taskService.update(this.currentTaskId, request).subscribe(() => {
        this.closeModal();
        this.loadTasks();
      });
    } else {
      this.taskService.create(request).subscribe(() => {
        this.closeModal();
        this.loadTasks();
      });
    }
  }

  updateStatus(taskId: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.taskService.updateStatus(taskId, status).subscribe(() => this.loadTasks());
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'badge-danger', 'MEDIUM': 'badge-warning', 'LOW': 'badge-info' };
    return map[priority] || 'badge-secondary';
  }

  exportToExcel(): void {
    this.exportService.exportTasksExcel().subscribe(blob => {
      this.exportService.downloadFile(blob, 'tasks_report.xlsx');
    });
  }

  canManageTasks(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER', 'TEAM_LEAD']);
  }

  canUpdateTask(task: any): boolean {
    return this.canManageTasks() || this.currentUser?.employeeId === task.assignedToId;
  }
}