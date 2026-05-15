import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { LeaveService, LeaveRequest } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Time Off" pageSubtitle="Absence tracking and leave requests">
      <div header-actions>
        <button class="btn btn-dark btn-sm rounded-pill px-3" (click)="openModal()">
          <i class="fas fa-plus-circle me-2"></i> New Request
        </button>
      </div>

      <div class="glass-card p-0 overflow-hidden">
        <div class="table-responsive p-3" *ngIf="leaves.length > 0; else emptyState">
          <table class="premium-table">
            <thead>
              <tr>
                <th *ngIf="isAdmin()">Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of leaves" class="animate-fade-in">
                <td *ngIf="isAdmin()" class="fw-bold">{{ leave.employeeName }}</td>
                <td><span class="badge-premium" [ngClass]="getBadgeClass(leave.type)">{{ leave.type }}</span></td>
                <td class="small fw-bold">{{ leave.startDate }} — {{ leave.endDate }}</td>
                <td class="small">{{ leave.days }} days</td>
                <td class="small text-muted" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ leave.reason }}</td>
                <td>
                  <span class="badge-premium" [ngClass]="getStatusClass(leave.status!)">{{ leave.status }}</span>
                  <small *ngIf="leave.adminRemarks" class="d-block text-muted x-small mt-1 fst-italic">
                    "{{ leave.adminRemarks }}"
                  </small>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <ng-container *ngIf="isAdmin() && leave.status === 'PENDING'">
                      <button class="btn btn-link btn-sm text-success p-0" (click)="updateStatus(leave.id!, 'APPROVED')">
                        <i class="fas fa-check-circle"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-danger p-0" (click)="updateStatus(leave.id!, 'REJECTED')">
                        <i class="fas fa-times-circle"></i>
                      </button>
                    </ng-container>
                    <ng-container *ngIf="leave.employeeId === currentUser.employeeId">
                      <button class="btn btn-link btn-sm text-muted p-0" (click)="withdrawLeave(leave.id!)">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </ng-container>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <ng-template #emptyState>
          <div class="p-5 text-center text-muted">
            <i class="fas fa-calendar-times display-4 mb-3 opacity-25"></i>
            <h5 class="display-font text-dark">No leave requests</h5>
            <p class="small">Requests will appear here after they are submitted.</p>
          </div>
        </ng-template>
      </div>

      <!-- Apply Leave Modal -->
      <div class="modal-overlay-custom" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content-premium" (click)="$event.stopPropagation()">
          <div class="modal-header-premium">
            <h3 class="display-font fs-4 mb-0">Request Absence</h3>
            <button class="btn-link text-muted p-0 border-0 bg-transparent" (click)="closeModal()">
              <i class="fas fa-times fs-5"></i>
            </button>
          </div>
          <div class="modal-body-premium">
            <div class="mb-4">
              <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Leave Type</label>
              <select [(ngModel)]="newLeave.type" class="modern-input">
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="PAID">Paid Privilege Leave</option>
              </select>
            </div>
            <div class="row g-3 mb-4">
              <div class="col-6">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Start Date</label>
                <input type="date" [(ngModel)]="newLeave.startDate" class="modern-input" />
              </div>
              <div class="col-6">
                <label class="small fw-bold text-muted text-uppercase mb-2 d-block">End Date</label>
                <input type="date" [(ngModel)]="newLeave.endDate" class="modern-input" />
              </div>
            </div>
            <div class="mb-4">
              <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Reason for Absence</label>
              <textarea [(ngModel)]="newLeave.reason" class="modern-input" rows="3" placeholder="Briefly explain the reason..."></textarea>
            </div>
            
            <button class="btn-premium w-100 py-3" (click)="submitLeave()" [disabled]="loading" style="height: auto; line-height: 1.5;">
              <i class="fas fa-spinner fa-spin me-2" *ngIf="loading"></i>
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class LeavesComponent implements OnInit {
  leaves: LeaveRequest[] = [];
  currentUser: any;
  showModal = false;
  loading = false;
  
  newLeave: any = {
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  };

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadLeaves();
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isAdminOrManager(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER', 'TEAM_LEAD']);
  }

  loadLeaves(): void {
    if (this.isAdmin()) {
      this.leaveService.getAllLeaves().subscribe(res => this.leaves = res);
    } else {
      this.leaveService.getLeavesByEmployee(this.currentUser.employeeId).subscribe(res => this.leaves = res);
    }
  }

  openModal(): void {
    this.newLeave = { type: 'CASUAL', startDate: '', endDate: '', reason: '' };
    this.showModal = true;
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.showModal = false;
    document.body.classList.remove('modal-open');
  }

  submitLeave(): void {
    if (!this.newLeave.startDate || !this.newLeave.endDate || !this.newLeave.reason) {
      alert('Please fill all fields');
      return;
    }
    this.loading = true;
    const req = {
      employeeId: this.currentUser.employeeId,
      ...this.newLeave
    };
    this.leaveService.applyForLeave(req).subscribe({
      next: () => {
        this.loading = false;
        this.closeModal();
        this.loadLeaves();
      },
      error: () => {
        this.loading = false;
        alert('Failed to submit leave request');
      }
    });
  }

  updateStatus(id: number, status: string): void {
    let remarks = '';
    if (status === 'REJECTED') {
      remarks = prompt('Enter rejection reason:') || '';
    } else {
      remarks = prompt('Enter approval remarks (optional):') || '';
    }
    
    this.leaveService.updateLeaveStatus(id, status, remarks).subscribe({
      next: () => this.loadLeaves(),
      error: () => alert('Failed to update status')
    });
  }

  withdrawLeave(id: number): void {
    if (confirm('Are you sure you want to withdraw this leave request?')) {
      this.leaveService.withdrawLeave(id).subscribe({
        next: () => this.loadLeaves(),
        error: () => alert('Failed to withdraw leave request')
      });
    }
  }

  getBadgeClass(type: string): string {
    const map: any = { 'CASUAL': 'badge-premium-blue', 'SICK': 'badge-premium-red', 'PAID': 'badge-premium-green' };
    return map[type] || 'badge-secondary';
  }

  getStatusClass(status: string): string {
    const map: any = { 'PENDING': 'badge-premium-blue', 'APPROVED': 'badge-premium-green', 'REJECTED': 'badge-premium-red' };
    return map[status] || 'badge-secondary';
  }
}
