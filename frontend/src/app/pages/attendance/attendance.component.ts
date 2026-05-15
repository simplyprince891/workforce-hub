import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout/layout.component';
import { AuthService } from '../../services/auth.service';
import { AttendanceService, AttendanceResponse } from '../../services/attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Attendance" pageSubtitle="Track presence and workday efficiency">
      <div class="row g-4 mb-5" *ngIf="!isAdmin()">
        <!-- Check-in Card (For Employees) -->
        <div class="col-md-4">
          <div class="glass-card h-100 d-flex flex-column align-items-center justify-content-center p-5 text-center">
            <div class="display-font fs-3 mb-2">{{ currentTime | date:'hh:mm:ss a' }}</div>
            <div class="small text-muted text-uppercase fw-bold mb-4">{{ today | date:'fullDate' }}</div>
            
            <button *ngIf="!todayStatus?.checkInTime" class="btn-premium w-100" style="height: 4rem;" (click)="checkIn()">
              <i class="fas fa-sign-in-alt me-2"></i> Check In
            </button>
            <button *ngIf="todayStatus?.checkInTime && !todayStatus?.checkOutTime" class="btn-premium bg-danger w-100 border-danger" style="height: 4rem;" (click)="checkOut()">
              <i class="fas fa-sign-out-alt me-2"></i> Check Out
            </button>
            <div *ngIf="todayStatus?.checkOutTime" class="badge-premium badge-premium-green w-100 py-3">
              <i class="fas fa-check-circle me-2"></i> Shift Completed
            </div>
            
            <div class="mt-4 small text-muted" *ngIf="todayStatus?.checkInTime">
              <i class="fas fa-clock me-1 text-success"></i> Working since {{ todayStatus?.checkInTime }}
            </div>
          </div>
        </div>

        <!-- Stats Column -->
        <div class="col-md-8">
          <div class="row g-4 h-100">
            <div class="col-md-6">
              <div class="glass-card h-100">
                <h6 class="small fw-bold text-muted text-uppercase mb-4">Month Summary</h6>
                <div class="d-flex justify-content-between align-items-end">
                  <div>
                    <div class="display-font fs-2 text-success">{{ presentDays }}</div>
                    <div class="x-small text-muted">Days Present</div>
                  </div>
                  <div>
                    <div class="display-font fs-2 text-danger">{{ absentDays }}</div>
                    <div class="x-small text-muted">Days Absent</div>
                  </div>
                </div>
                <div class="progress mt-4" style="height: 4px;">
                  <div class="progress-bar bg-success" [style.width.%]="(presentDays / 30) * 100"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="glass-card h-100">
                <h6 class="small fw-bold text-muted text-uppercase mb-4">Work Hours</h6>
                <div class="display-font fs-2 text-black">--h</div>
                <div class="x-small text-muted">Total hours logged this month</div>
                <div class="mt-4 d-flex gap-2">
                  <span class="badge-premium badge-premium-green x-small">Policy: 8h/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-0">
        <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h3 class="display-font fs-5 mb-0">{{ isAdmin() ? 'Live Attendance Feed' : 'My Attendance Log' }}</h3>
          <span *ngIf="isAdmin()" class="badge-premium badge-premium-blue animate-pulse">Live</span>
        </div>
        <div class="table-responsive p-3">
          <table class="premium-table">
            <thead>
              <tr>
                <th *ngIf="isAdmin()">Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs" class="animate-fade-in">
                <td *ngIf="isAdmin()" class="fw-bold text-primary">{{ log.employeeName }}</td>
                <td [class.fw-bold]="!isAdmin()">{{ log.date | date:'mediumDate' }}</td>
                <td>
                  <span class="badge-premium" [ngClass]="{
                    'badge-premium-green': log.status === 'PRESENT',
                    'badge-premium-red': log.status === 'ABSENT',
                    'badge-premium-blue': log.status === 'ON_LEAVE'
                  }">{{ log.status }}</span>
                </td>
                <td class="small text-muted">{{ log.checkInTime || '--:--' }}</td>
                <td class="small text-muted">{{ log.checkOutTime || '--:--' }}</td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="logs.length === 0" class="p-5 text-center text-muted small">
            No attendance records found.
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class AttendanceComponent implements OnInit {
  today = new Date();
  currentTime = new Date();
  currentUser = this.authService.getCurrentUser();
  todayStatus: AttendanceResponse | null = null;
  logs: AttendanceResponse[] = [];
  
  presentDays = 0;
  absentDays = 0;

  constructor(
    private authService: AuthService, 
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    this.loadData();
  }

  loadData(): void {
    if (this.isAdmin()) {
      this.attendanceService.getAllTodayLogs().subscribe(res => {
        this.logs = res;
      });
    } else if (this.currentUser) {
      const empId = this.currentUser.employeeId;
      
      // Get today's status
      this.attendanceService.getTodayStatus(empId).subscribe(res => {
        this.todayStatus = res;
      });

      // Get month logs
      const now = new Date();
      this.attendanceService.getMonthLogs(empId, now.getMonth() + 1, now.getFullYear()).subscribe(res => {
        this.logs = res;
        this.presentDays = res.filter(l => l.status === 'PRESENT').length;
        this.absentDays = res.filter(l => l.status === 'ABSENT').length;
      });
    }
  }

  checkIn(): void {
    if (!this.currentUser) return;
    this.attendanceService.checkIn(this.currentUser.employeeId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Check-in error:', err);
        alert('Check-in failed: ' + (err.error?.message || 'Server error'));
      }
    });
  }

  checkOut(): void {
    if (!this.currentUser) return;
    this.attendanceService.checkOut(this.currentUser.employeeId).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Check-out error:', err);
        alert('Check-out failed: ' + (err.error?.message || 'Server error'));
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }
}
