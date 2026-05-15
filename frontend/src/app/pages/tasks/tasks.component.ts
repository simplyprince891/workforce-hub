import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskRequest, TaskResponse } from '../../services/task.service';
import { EmployeeService, EmployeeResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Tasks" pageSubtitle="Strategic tracking and execution">
      <div header-actions *ngIf="canManageTasks()">
        <button class="btn-premium" (click)="openModal()" style="height: 3rem;">
          <i class="fas fa-plus me-2"></i> Create Task
        </button>
      </div>

      <div class="row g-4 mb-4">
        <!-- Todo Column -->
        <div class="col-md-4">
          <div class="h-100">
            <h5 class="display-font fs-6 mb-4 d-flex align-items-center gap-2 text-muted">
              <span class="badge-premium badge-premium-blue" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">{{ getTasksByStatus('PENDING').length }}</span> 
              To Do
            </h5>
            <div class="glass-card mb-3 p-3 animate-fade-in" *ngFor="let task of getTasksByStatus('PENDING')">
              <div class="d-flex justify-content-between mb-3">
                <span class="badge-premium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                <span class="text-muted small x-small fw-bold">{{ task.deadline | date:'MMM d' }}</span>
              </div>
              <h6 class="mb-3"><a [routerLink]="['/tasks', task.id]" class="text-black text-decoration-none fw-bold">{{ task.title }}</a></h6>
              <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div class="small text-muted d-flex align-items-center gap-2">
                  <div class="avatar bg-black text-white x-small" style="width: 20px; height: 20px; font-size: 8px;">{{ (task.assignedToName || 'U').charAt(0) }}</div>
                  <span class="x-small fw-bold">{{ task.assignedToName || 'Unassigned' }}</span>
                </div>
                <div *ngIf="canUpdateTask(task)">
                  <select class="modern-input x-small py-1 px-2 border-0 bg-light" (change)="updateStatus(task.id, $event)" style="width: auto;">
                    <option value="PENDING" selected>To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="glass-card p-4 text-center" *ngIf="getTasksByStatus('PENDING').length === 0">
              <p class="mb-0 text-muted small">No pending tasks</p>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="col-md-4">
          <div class="h-100">
            <h5 class="display-font fs-6 mb-4 d-flex align-items-center gap-2 text-muted">
              <span class="badge-premium badge-premium-blue" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">{{ getTasksByStatus('IN_PROGRESS').length }}</span> 
              In Progress
            </h5>
            <div class="glass-card mb-3 p-3 animate-fade-in border-start border-4 border-primary" *ngFor="let task of getTasksByStatus('IN_PROGRESS')">
              <div class="d-flex justify-content-between mb-3">
                <span class="badge-premium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                <span class="text-muted small x-small fw-bold">{{ task.deadline | date:'MMM d' }}</span>
              </div>
              <h6 class="mb-3"><a [routerLink]="['/tasks', task.id]" class="text-black text-decoration-none fw-bold">{{ task.title }}</a></h6>
              <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div class="small text-muted d-flex align-items-center gap-2">
                  <div class="avatar bg-black text-white x-small" style="width: 20px; height: 20px; font-size: 8px;">{{ (task.assignedToName || 'U').charAt(0) }}</div>
                  <span class="x-small fw-bold">{{ task.assignedToName || 'Unassigned' }}</span>
                </div>
                <div *ngIf="canUpdateTask(task)">
                  <select class="modern-input x-small py-1 px-2 border-0 bg-light" (change)="updateStatus(task.id, $event)" style="width: auto;">
                    <option value="PENDING">To Do</option>
                    <option value="IN_PROGRESS" selected>In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="glass-card p-4 text-center" *ngIf="getTasksByStatus('IN_PROGRESS').length === 0">
              <p class="mb-0 text-muted small">No tasks in progress</p>
            </div>
          </div>
        </div>

        <!-- Done Column -->
        <div class="col-md-4">
          <div class="h-100">
            <h5 class="display-font fs-6 mb-4 d-flex align-items-center gap-2 text-muted">
              <span class="badge-premium badge-premium-green" style="width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">{{ getTasksByStatus('DONE').length }}</span> 
              Completed
            </h5>
            <div class="glass-card mb-3 p-3 animate-fade-in opacity-75" *ngFor="let task of getTasksByStatus('DONE')">
              <div class="d-flex justify-content-between mb-3">
                <span class="badge-premium badge-premium-green">Completed</span>
                <span class="text-muted small x-small fw-bold">{{ task.deadline | date:'MMM d' }}</span>
              </div>
              <h6 class="mb-3"><a [routerLink]="['/tasks', task.id]" class="text-muted text-decoration-line-through">{{ task.title }}</a></h6>
              <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div class="small text-muted d-flex align-items-center gap-2">
                  <div class="avatar bg-light text-muted x-small" style="width: 20px; height: 20px; font-size: 8px;">{{ (task.assignedToName || 'U').charAt(0) }}</div>
                  <span class="x-small">{{ task.assignedToName || 'Unassigned' }}</span>
                </div>
                <div *ngIf="canUpdateTask(task)">
                  <select class="modern-input x-small py-1 px-2 border-0 bg-light" (change)="updateStatus(task.id, $event)" style="width: auto;">
                    <option value="PENDING">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE" selected>Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="glass-card p-4 text-center" *ngIf="getTasksByStatus('DONE').length === 0">
              <p class="mb-0 text-muted small">No completed tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Modal -->
      <div class="modal-overlay-custom" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content-premium" (click)="$event.stopPropagation()">
          <div class="modal-header-premium">
            <h3 class="display-font">Create New Task</h3>
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
                  <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Assign To</label>
                  <select class="modern-input" name="assignedToId" [(ngModel)]="taskForm.assignedToId">
                    <option value="">Select Employee</option>
                    <option *ngFor="let emp of employees" [value]="emp.id">{{ emp.name }} ({{ emp.role }})</option>
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
              </div>
              <div class="mb-5">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Deadline</label>
                <input type="date" class="modern-input" name="deadline" [(ngModel)]="taskForm.deadline" required>
              </div>
              <div class="d-flex justify-content-end gap-3 pt-3 border-top">
                <button type="button" class="btn btn-link text-muted text-decoration-none fw-bold" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn-premium" style="height: 3rem; width: auto;">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class TasksComponent implements OnInit {
  tasks: TaskResponse[] = [];
  employees: EmployeeResponse[] = [];
  showModal = false;
  currentUser = this.authService.getCurrentUser();

  taskForm: any = {
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    deadline: ''
  };

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    if (this.canManageTasks()) {
      this.loadEmployees();
    }
  }

  loadTasks(): void {
    if (!this.currentUser) return;
    
    if (this.authService.hasRole(['ADMIN'])) {
      this.taskService.getAll(0, 100).subscribe(res => {
        this.tasks = res.content;
      });
    } else if (this.authService.hasRole(['MANAGER', 'TEAM_LEAD'])) {
      // Get tasks assigned by them and to them
      this.taskService.getByEmployee(this.currentUser.employeeId).subscribe((assignedToMe: any[]) => {
        this.taskService.getByManager(this.currentUser!.employeeId).subscribe((assignedByMe: any[]) => {
          // Merge and remove duplicates
          const all = [...assignedToMe, ...assignedByMe];
          this.tasks = Array.from(new Map(all.map(item => [item.id, item])).values());
        });
      });
    } else {
      // Regular employee
      this.taskService.getByEmployee(this.currentUser.employeeId).subscribe((res: any[]) => {
        this.tasks = res;
      });
    }
  }

  loadEmployees(): void {
    this.employeeService.getAll(0, 100).subscribe(res => {
      const all = res.content;
      if (this.authService.hasRole(['ADMIN'])) {
        this.employees = all;
      } else if (this.authService.hasRole(['MANAGER'])) {
        // Managers can assign to Team Leads and Employees
        this.employees = all.filter(e => e.role === 'TEAM_LEAD' || e.role === 'EMPLOYEE');
      } else if (this.authService.hasRole(['TEAM_LEAD'])) {
        // Team Leads can only assign to Employees
        this.employees = all.filter(e => e.role === 'EMPLOYEE');
      } else {
        this.employees = [];
      }
    });
  }

  getTasksByStatus(status: string): TaskResponse[] {
    return this.tasks.filter(t => t.status === status);
  }

  openModal(): void {
    this.taskForm = {
      title: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      deadline: new Date().toISOString().split('T')[0]
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    const request: TaskRequest = {
      ...this.taskForm,
      assignedById: this.currentUser?.employeeId
    };

    if (!request.assignedToId || (request.assignedToId as any) === '') {
      delete (request as any).assignedToId;
    }

    this.taskService.create(request).subscribe(() => {
      this.closeModal();
      this.loadTasks();
    });
  }

  updateStatus(taskId: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.taskService.updateStatus(taskId, status).subscribe(() => this.loadTasks());
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'badge-danger', 'MEDIUM': 'badge-warning', 'LOW': 'badge-info' };
    return map[priority] || 'badge-secondary';
  }

  canManageTasks(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER', 'TEAM_LEAD']);
  }

  canUpdateTask(task: TaskResponse): boolean {
    return this.canManageTasks() || this.currentUser?.employeeId === task.assignedToId;
  }
}