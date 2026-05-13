import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskResponse, PagedResponse } from '../../services/task.service';
import { EmployeeService, EmployeeResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tasks',
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
            <li class="nav-item"><a class="nav-link" routerLink="/employees">Employees</a></li>
            <li class="nav-item"><a class="nav-link active" routerLink="/tasks">Tasks</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="page-header">Tasks</h2>
            <button class="btn btn-primary" (click)="showAddModal = true" *ngIf="canCreateTask()">Add Task</button>
          </div>
          
          <div class="card">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let task of tasks">
                    <td>{{ task.id }}</td>
                    <td>{{ task.title }}</td>
                    <td>{{ task.assignedToName }}</td>
                    <td><span class="badge" [class]="getPriorityClass(task.priority)">{{ task.priority }}</span></td>
                    <td><span class="badge" [class]="getStatusClass(task.status)">{{ task.status }}</span></td>
                    <td>{{ task.deadline }}</td>
                    <td>
                      <a [routerLink]="['/tasks', task.id]" class="btn btn-sm btn-primary me-1">View</a>
                      <button class="btn btn-sm btn-success" (click)="updateStatus(task.id, 'DONE')" 
                              *ngIf="task.status !== 'DONE'">Complete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span>Page {{ page + 1 }} of {{ totalPages }}</span>
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
    
    <!-- Add Task Modal -->
    <div class="modal d-block" *ngIf="showAddModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Task</h5>
            <button type="button" class="btn-close" (click)="showAddModal = false"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="taskForm">
              <div class="mb-3">
                <label class="form-label">Title *</label>
                <input type="text" class="form-control" formControlName="title">
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" formControlName="description" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Assign To *</label>
                <select class="form-select" formControlName="assignedToId">
                  <option value="">Select Employee</option>
                  <option *ngFor="let emp of employees" [ngValue]="emp.id">{{ emp.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Priority *</label>
                <select class="form-select" formControlName="priority">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Deadline *</label>
                <input type="date" class="form-control" formControlName="deadline">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showAddModal = false">Cancel</button>
            <button class="btn btn-primary" (click)="createTask()" [disabled]="taskForm.invalid">Create</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showAddModal"></div>
  `
})
export class TasksComponent implements OnInit {
  tasks: TaskResponse[] = [];
  employees: EmployeeResponse[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  showAddModal = false;
  currentUser = this.authService.getCurrentUser();
  taskForm: any;

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {
    this.taskForm = {
      title: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM',
      deadline: ''
    };
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
  }

  loadTasks(): void {
    this.taskService.getAll(this.page, this.size).subscribe(res => {
      this.tasks = res.content;
      this.totalPages = res.totalPages;
    });
  }

  loadEmployees(): void {
    this.employeeService.getAll(0, 100).subscribe(res => {
      this.employees = res.content.filter(e => e.role !== 'ADMIN');
    });
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadTasks();
  }

  createTask(): void {
    if (!this.taskForm.assignedToId || !this.taskForm.deadline || !this.taskForm.title) return;
    
    this.taskService.create({
      title: this.taskForm.title,
      description: this.taskForm.description,
      assignedById: this.currentUser!.employeeId,
      assignedToId: Number(this.taskForm.assignedToId),
      priority: this.taskForm.priority,
      deadline: this.taskForm.deadline
    }).subscribe(() => {
      this.showAddModal = false;
      this.loadTasks();
      this.taskForm = { title: '', description: '', assignedToId: '', priority: 'MEDIUM', deadline: '' };
    });
  }

  updateStatus(id: number, status: string): void {
    this.taskService.updateStatus(id, status).subscribe(() => this.loadTasks());
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'bg-danger', 'MEDIUM': 'bg-warning', 'LOW': 'bg-info' };
    return map[priority] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING': 'bg-secondary', 'IN_PROGRESS': 'bg-primary', 'DONE': 'bg-success' };
    return map[status] || 'bg-secondary';
  }

  canCreateTask(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}