import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskResponse, SubtaskResponse } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">WorkForce Hub</a>
        <div class="d-flex">
          <span class="navbar-text me-3">{{ currentUser?.name }}</span>
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
            <li class="nav-item"><a class="nav-link" routerLink="/tasks">Tasks</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <a routerLink="/tasks" class="btn btn-secondary mb-3">Back to Tasks</a>
          
          <div class="row">
            <div class="col-md-8">
              <div class="card mb-4">
                <div class="card-body">
                  <h4 class="card-title">{{ task?.title }}</h4>
                  <p class="text-muted">{{ task?.description }}</p>
                  
                  <div class="row mt-3">
                    <div class="col-md-6">
                      <p><strong>Assigned By:</strong> {{ task?.assignedByName }}</p>
                      <p><strong>Assigned To:</strong> {{ task?.assignedToName }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Priority:</strong> <span class="badge" [class]="getPriorityClass(task?.priority || '')">{{ task?.priority }}</span></p>
                      <p><strong>Status:</strong> <span class="badge" [class]="getStatusClass(task?.status || '')">{{ task?.status }}</span></p>
                      <p><strong>Deadline:</strong> {{ task?.deadline }}</p>
                    </div>
                  </div>
                  
                  <div class="mt-3" *ngIf="canUpdateStatus()">
                    <label class="form-label">Update Status:</label>
                    <select class="form-select" style="max-width: 200px;" (change)="onStatusChange($event)">
                      <option value="PENDING" [selected]="task?.status === 'PENDING'">Pending</option>
                      <option value="IN_PROGRESS" [selected]="task?.status === 'IN_PROGRESS'">In Progress</option>
                      <option value="DONE" [selected]="task?.status === 'DONE'">Done</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Subtasks (Checklist)</h5>
                  
                  <div class="subtask-item" *ngFor="let subtask of task?.subtasks" 
                       [class.completed]="subtask.isCompleted">
                    <div class="d-flex align-items-center">
                      <input type="checkbox" class="form-check-input me-2" [checked]="subtask.isCompleted" 
                             (change)="toggleSubtask(subtask.id)">
                      <span class="flex-grow-1">{{ subtask.title }}</span>
                      <small class="text-muted me-2" *ngIf="subtask.notes">{{ subtask.notes }}</small>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteSubtask(subtask.id)">X</button>
                    </div>
                  </div>
                  
                  <div class="mt-3">
                    <div class="input-group">
                      <input type="text" class="form-control" placeholder="Add new subtask" 
                             [(ngModel)]="newSubtaskTitle">
                      <button class="btn btn-primary" (click)="addSubtask()">Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5>Task Info</h5>
                  <p><small class="text-muted">Created: {{ task?.createdAt | date:'short' }}</small></p>
                  <button class="btn btn-danger w-100" (click)="deleteTask()" *ngIf="canDelete()">Delete Task</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  task: TaskResponse | null = null;
  newSubtaskTitle = '';
  currentUser = this.authService.getCurrentUser();
  taskId = 0;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.taskId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTask();
  }

  loadTask(): void {
    this.taskService.getById(this.taskId).subscribe(t => this.task = t);
  }

  addSubtask(): void {
    if (!this.newSubtaskTitle.trim()) return;
    this.taskService.addSubtask({
      taskId: this.taskId,
      title: this.newSubtaskTitle,
      isCompleted: false
    }).subscribe(() => {
      this.newSubtaskTitle = '';
      this.loadTask();
    });
  }

  toggleSubtask(id: number): void {
    this.taskService.toggleSubtask(id).subscribe(() => this.loadTask());
  }

  deleteSubtask(id: number): void {
    this.taskService.deleteSubtask(id).subscribe(() => this.loadTask());
  }

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.taskService.updateStatus(this.taskId, status).subscribe(() => this.loadTask());
  }

  deleteTask(): void {
    if (confirm('Delete this task?')) {
      this.taskService.delete(this.taskId).subscribe(() => this.router.navigate(['/tasks']));
    }
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'bg-danger', 'MEDIUM': 'bg-warning', 'LOW': 'bg-info' };
    return map[priority] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING': 'bg-secondary', 'IN_PROGRESS': 'bg-primary', 'DONE': 'bg-success' };
    return map[status] || 'bg-secondary';
  }

  canUpdateStatus(): boolean {
    return this.currentUser?.employeeId === this.task?.assignedToId || 
           this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  canDelete(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}