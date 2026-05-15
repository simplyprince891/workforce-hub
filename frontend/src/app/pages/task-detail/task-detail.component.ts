import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, TaskResponse, SubtaskResponse } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Task Execution" [pageSubtitle]="task?.title || 'Loading...'">
      <div header-actions>
        <a routerLink="/tasks" class="btn btn-outline-dark btn-sm rounded-pill px-3">
          <i class="fas fa-arrow-left me-2"></i> Back to Tasks
        </a>
      </div>

      <div class="row g-4">
        <div class="col-md-8">
          <div class="glass-card mb-4 p-4 p-md-5">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 class="display-font fs-1 mb-2">{{ task?.title }}</h2>
                <div class="d-flex gap-2">
                  <span class="badge-premium" [ngClass]="getPriorityClass(task?.priority || '')">{{ task?.priority }} Priority</span>
                  <span class="badge-premium" [ngClass]="getStatusClass(task?.status || '')">{{ task?.status }}</span>
                </div>
              </div>
            </div>
            
            <p class="text-secondary fs-5" style="white-space: pre-wrap; line-height: 1.8;">{{ task?.description }}</p>
            
            <div class="mt-5 pt-5 border-top">
              <div class="row text-sm">
                <div class="col-sm-6 mb-3">
                  <span class="small fw-bold text-muted text-uppercase d-block mb-2">Ownership</span>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar bg-black text-white" style="width: 32px; height: 32px;">{{ task?.assignedByName?.charAt(0) || '?' }}</div>
                    <div>
                      <div class="fw-bold text-black small">{{ task?.assignedByName }}</div>
                      <div class="text-muted x-small">Assigned By</div>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6 mb-3">
                  <span class="small fw-bold text-muted text-uppercase d-block mb-2">Assignment</span>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar bg-black text-white" style="width: 32px; height: 32px;">{{ task?.assignedToName?.charAt(0) || '?' }}</div>
                    <div>
                      <div class="fw-bold text-black small">{{ task?.assignedToName }}</div>
                      <div class="text-muted x-small">Assigned To</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4" *ngIf="canUpdateStatus()">
              <label class="small fw-bold text-muted text-uppercase d-block mb-2">Update Progress</label>
              <select class="modern-input w-auto px-4" (change)="onStatusChange($event)">
                <option value="PENDING" [selected]="task?.status === 'PENDING'">To Do</option>
                <option value="IN_PROGRESS" [selected]="task?.status === 'IN_PROGRESS'">In Progress</option>
                <option value="DONE" [selected]="task?.status === 'DONE'">Completed</option>
              </select>
            </div>
          </div>


          <!-- Discussion Section -->
          <div class="glass-card mt-4 p-0">
            <div class="p-4 border-bottom">
              <h3 class="display-font fs-5 mb-0">Collaboration</h3>
            </div>
            <div class="p-4">
              <div class="comments-list">
                <div class="text-center p-5 text-muted" *ngIf="!task?.comments || task!.comments.length === 0">
                  <i class="fas fa-comments fs-1 opacity-25 mb-3"></i>
                  <p class="small">No discussion points yet. Start the conversation below.</p>
                </div>
                
                <div class="comment-item mb-4" *ngFor="let comment of task?.comments">
                  <div class="d-flex gap-3">
                    <div class="avatar bg-black text-white" style="width: 40px; height: 40px; flex-shrink: 0;">
                      {{ comment.authorName.charAt(0) }}
                    </div>
                    <div class="flex-grow-1 p-3 rounded" style="background: #f9f9f9; border: 1px solid #eee;">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-black small">{{ comment.authorName }} <span class="text-muted fw-normal ms-1">({{ comment.authorRole }})</span></span>
                        <small class="text-muted x-small">{{ comment.createdAt | date:'short' }}</small>
                      </div>
                      <p class="mb-0 text-secondary small" style="line-height: 1.6;">{{ comment.content }}</p>
                      <button class="btn btn-link btn-sm text-danger p-0 mt-2" 
                              *ngIf="canDeleteComment(comment.authorId)" 
                              (click)="deleteComment(comment.id)">
                        <i class="fas fa-trash-alt x-small"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-top">
                <form (ngSubmit)="addComment()" class="d-flex gap-3">
                  <div class="avatar bg-black text-white" style="width: 40px; height: 40px; flex-shrink: 0;">
                    {{ currentUser?.name?.charAt(0) || 'U' }}
                  </div>
                  <div class="flex-grow-1">
                    <textarea class="modern-input" rows="2" placeholder="Contribute to the discussion..." 
                              name="newCommentText" [(ngModel)]="newCommentText" required></textarea>
                    <div class="text-end mt-2">
                      <button type="submit" class="btn btn-dark btn-sm rounded-pill px-4" [disabled]="!newCommentText.trim() || submittingComment">
                        <i class="fas fa-paper-plane me-2" *ngIf="!submittingComment"></i>
                        <i class="fas fa-spinner fa-spin me-2" *ngIf="submittingComment"></i>
                        Post Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <!-- Checklist Card -->
          <div class="glass-card mb-4 p-0 overflow-hidden">
            <div class="p-4 border-bottom bg-light">
              <h3 class="display-font fs-5 mb-0">Checklist</h3>
              <div class="progress mt-3" style="height: 4px;">
                <div class="progress-bar bg-black" [style.width.%]="getProgressPercentage()"></div>
              </div>
              <div class="text-end mt-1 x-small fw-bold text-uppercase text-muted letter-spacing-1">{{ getProgressPercentage() | number:'1.0-0' }}% Done</div>
            </div>
            
            <div class="p-4">
              <div class="d-flex flex-column gap-2 mb-4">
                <div class="d-flex align-items-center gap-3 p-2 rounded hover-bg-light" *ngFor="let subtask of task?.subtasks">
                  <input type="checkbox" class="form-check-input border-2 m-0" style="width: 20px; height: 20px;" [checked]="subtask.isCompleted" 
                         (change)="toggleSubtask(subtask.id)" [disabled]="!canUpdateTask()">
                  <div class="flex-grow-1">
                    <div class="small fw-bold" [class.text-decoration-line-through]="subtask.isCompleted" [class.text-muted]="subtask.isCompleted">
                      {{ subtask.title }}
                    </div>
                  </div>
                  <button class="btn btn-link btn-sm text-danger p-0" (click)="deleteSubtask(subtask.id)" *ngIf="canUpdateTask()">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <div class="text-center p-3 text-muted" *ngIf="!task?.subtasks || task!.subtasks.length === 0">
                <p class="x-small text-uppercase fw-bold mb-0">No checklist items</p>
              </div>
              
              <div class="mt-3 pt-3 border-top" *ngIf="canUpdateTask()">
                <form (ngSubmit)="addSubtask()" class="d-flex gap-2">
                  <input type="text" class="modern-input py-1 small" placeholder="New requirement..." 
                         name="newSubtaskTitle" [(ngModel)]="newSubtaskTitle" required>
                  <button type="submit" class="btn btn-dark btn-sm rounded" [disabled]="!newSubtaskTitle.trim() || submittingSubtask">
                    <i class="fas fa-plus"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="glass-card">
            <h3 class="display-font fs-5 mb-4">Meta Information</h3>
            <div class="d-flex flex-column gap-4">
              <div class="meta-item">
                <span class="x-small fw-bold text-muted text-uppercase d-block mb-1">Due Date</span>
                <div class="fw-bold text-black d-flex align-items-center gap-2" [class.text-danger]="isOverdue()">
                  <i class="far fa-calendar-alt"></i> {{ task?.deadline | date:'mediumDate' }}
                  <span *ngIf="isOverdue()" class="badge bg-danger rounded-pill x-small px-2">OVERDUE</span>
                </div>
              </div>
              <div class="meta-item">
                <span class="x-small fw-bold text-muted text-uppercase d-block mb-1">Initialized</span>
                <div class="small text-secondary">{{ task?.createdAt | date:'longDate' }}</div>
              </div>
              
              <div class="pt-4 border-top">
                <button class="btn btn-outline-danger btn-sm w-100 rounded-pill" (click)="deleteTask()" *ngIf="canDelete()">
                  <i class="fas fa-trash-alt me-2"></i> Terminate Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .checklist-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #edf2f7;
    }
    .checklist-item:last-child {
      border-bottom: none;
    }
    .checklist-item.completed .item-title {
      text-decoration: line-through;
      color: #a0aec0;
    }
    .custom-checkbox {
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 1rem;
      cursor: pointer;
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  task: TaskResponse | null = null;
  newSubtaskTitle = '';
  newCommentText = '';
  currentUser = this.authService.getCurrentUser();
  taskId = 0;

  submittingSubtask = false;

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
    if (!this.newSubtaskTitle.trim() || this.submittingSubtask) return;
    this.submittingSubtask = true;
    this.taskService.addSubtask({
      taskId: this.taskId,
      title: this.newSubtaskTitle,
      isCompleted: false
    }).subscribe({
      next: () => {
        this.newSubtaskTitle = '';
        this.submittingSubtask = false;
        this.loadTask();
      },
      error: () => {
        this.submittingSubtask = false;
        alert('Failed to add subtask');
      }
    });
  }

  toggleSubtask(id: number): void {
    // Optimistic UI update
    const subtask = this.task?.subtasks?.find(s => s.id === id);
    if (subtask) {
      subtask.isCompleted = !subtask.isCompleted;
    }
    
    this.taskService.toggleSubtask(id).subscribe({
      next: () => this.loadTask(),
      error: () => {
        // Revert on error
        if (subtask) subtask.isCompleted = !subtask.isCompleted;
        alert('Failed to update subtask');
      }
    });
  }

  deleteSubtask(id: number): void {
    this.taskService.deleteSubtask(id).subscribe(() => this.loadTask());
  }

  submittingComment = false;

  addComment(): void {
    if (!this.newCommentText.trim() || !this.currentUser || this.submittingComment) return;
    this.submittingComment = true;
    this.taskService.addComment(this.taskId, this.currentUser.employeeId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText = '';
        this.submittingComment = false;
        this.loadTask();
      },
      error: () => {
        this.submittingComment = false;
        alert('Failed to post comment. Please try again.');
      }
    });
  }

  deleteComment(id: number): void {
    if (confirm('Delete this comment?')) {
      this.taskService.deleteComment(id).subscribe({
        next: () => this.loadTask(),
        error: () => alert('Failed to delete comment.')
      });
    }
  }

  canDeleteComment(authorId: number): boolean {
    return this.currentUser?.employeeId === authorId || this.authService.hasRole(['ADMIN', 'MANAGER']);
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

  completedSubtasksCount(): number {
    return this.task?.subtasks?.filter(s => s.isCompleted).length || 0;
  }

  getProgressPercentage(): number {
    if (!this.task?.subtasks || this.task.subtasks.length === 0) return 0;
    return (this.completedSubtasksCount() / this.task.subtasks.length) * 100;
  }

  isOverdue(): boolean {
    if (!this.task?.deadline) return false;
    if (this.task.status === 'DONE') return false;
    return new Date(this.task.deadline).getTime() < new Date().getTime();
  }

  getPriorityClass(priority: string): string {
    const map: any = { 'HIGH': 'badge-premium-red', 'MEDIUM': 'badge-premium-blue', 'LOW': 'badge-premium-green' };
    return map[priority] || 'badge-secondary';
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING': 'badge-premium-blue', 'IN_PROGRESS': 'badge-premium-blue', 'DONE': 'badge-premium-green' };
    return map[status] || 'badge-secondary';
  }

  canUpdateTask(): boolean {
    return this.canUpdateStatus();
  }

  canUpdateStatus(): boolean {
    return this.currentUser?.employeeId === this.task?.assignedToId || 
           this.authService.hasRole(['ADMIN', 'MANAGER']);
  }

  canDelete(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER']);
  }
}