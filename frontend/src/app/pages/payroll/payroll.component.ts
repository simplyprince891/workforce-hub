import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PayrollService, PayrollResponse } from '../../services/payroll.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Payroll" pageSubtitle="Compensation management and history">
      <div header-actions *ngIf="isAdmin()">
        <button class="btn btn-dark btn-sm rounded-pill px-3" (click)="generateBulkPayroll()" [disabled]="loading">
          <i class="fas fa-spinner fa-spin me-2" *ngIf="loading"></i>
          <i class="fas fa-bolt me-2" *ngIf="!loading"></i> Generate Monthly
        </button>
      </div>

      <!-- Filters & Summary -->
      <div class="glass-card mb-4" *ngIf="isAdmin()">
        <div class="row align-items-end g-3">
          <div class="col-md-3">
            <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Reporting Month</label>
            <select class="modern-input" [(ngModel)]="selectedMonth" (change)="loadAdminPayroll()">
              <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="small fw-bold text-muted text-uppercase mb-2 d-block">Year</label>
            <select class="modern-input" [(ngModel)]="selectedYear" (change)="loadAdminPayroll()">
              <option *ngFor="let y of years" [value]="y">{{ y }}</option>
            </select>
          </div>
          <div class="col-md-4 ms-auto">
            <div class="p-3 border rounded bg-light d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted small text-uppercase fw-bold d-block">Monthly Commitment</span>
                <span class="display-font fs-4 fw-bold text-black">{{ totalCost | currency:'INR' }}</span>
              </div>
              <i class="fas fa-chart-line text-muted opacity-50 fs-2"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-0 overflow-hidden">
        <div class="table-responsive p-3" *ngIf="payrolls.length > 0; else emptyState">
          <table class="premium-table">
            <thead>
              <tr>
                <th *ngIf="isAdmin()">Employee</th>
                <th>Period</th>
                <th>Gross Pay</th>
                <th>Deductions</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let pay of payrolls" class="animate-fade-in">
                <td *ngIf="isAdmin()">
                  <div class="fw-bold text-black">{{ pay.employeeName }}</div>
                  <div class="text-muted x-small text-uppercase">{{ pay.department }}</div>
                </td>
                <td>
                  <div class="small fw-bold">{{ getMonthName(pay.month) }} {{ pay.year }}</div>
                </td>
                <td class="small">{{ pay.grossSalary | currency:'INR' }}</td>
                <td class="small text-danger fst-italic">-{{ pay.totalDeductions | currency:'INR' }}</td>
                <td class="fw-bold text-black">{{ pay.netSalary | currency:'INR' }}</td>
                <td>
                  <span class="badge-premium" [ngClass]="getStatusClass(pay.status)">{{ pay.status }}</span>
                  <div class="x-small text-muted mt-1" *ngIf="pay.status === 'PAID'">
                    Paid on {{ pay.paidDate | date:'mediumDate' }}
                  </div>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <button [routerLink]="['/payroll', pay.id]" class="btn btn-link btn-sm text-black p-0" title="View Slip">
                      <i class="fas fa-file-invoice-dollar"></i>
                    </button>
                    
                    <ng-container *ngIf="isAdmin()">
                      <button class="btn btn-link btn-sm text-success p-0" *ngIf="pay.status === 'DRAFT'" 
                              (click)="approvePayroll(pay.id)" title="Approve">
                        <i class="fas fa-check-circle"></i>
                      </button>
                      <button class="btn btn-link btn-sm text-primary p-0" *ngIf="pay.status === 'APPROVED'" 
                              (click)="markAsPaid(pay.id)" title="Mark as Paid">
                        <i class="fas fa-money-bill-wave"></i>
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
            <i class="fas fa-money-check-alt display-4 mb-3 opacity-25"></i>
            <h5 class="display-font text-dark">No records found</h5>
            <p class="small" *ngIf="isAdmin()">Generate payroll to start tracking compensation.</p>
            <p class="small" *ngIf="!isAdmin()">You don't have any generated payslips yet.</p>
          </div>
        </ng-template>
      </div>
    </app-layout>
  `
})
export class PayrollComponent implements OnInit {
  payrolls: PayrollResponse[] = [];
  currentUser = this.authService.getCurrentUser();
  loading = false;
  
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years = [2024, 2025, 2026];
  
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  totalCost = 0;

  constructor(
    private payrollService: PayrollService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadAdminPayroll();
    } else {
      this.loadEmployeePayroll();
    }
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  loadAdminPayroll(): void {
    this.payrollService.getPayrollByMonth(this.selectedMonth, this.selectedYear).subscribe(res => {
      this.payrolls = res;
    });
    this.payrollService.getTotalPayrollForMonth(this.selectedMonth, this.selectedYear).subscribe(total => {
      this.totalCost = total;
    });
  }

  loadEmployeePayroll(): void {
    if (this.currentUser?.employeeId) {
      this.payrollService.getPayrollByEmployee(this.currentUser.employeeId).subscribe(res => {
        this.payrolls = res;
      });
    }
  }

  generateBulkPayroll(): void {
    if (confirm(`Generate payroll for all employees for ${this.getMonthName(this.selectedMonth)} ${this.selectedYear}?`)) {
      this.loading = true;
      this.payrollService.generateBulkPayroll(this.selectedMonth, this.selectedYear).subscribe({
        next: () => {
          this.loading = false;
          this.loadAdminPayroll();
          alert('Payroll generated successfully.');
        },
        error: (err) => {
          this.loading = false;
          alert('Error generating payroll: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }

  approvePayroll(id: number): void {
    this.payrollService.approvePayroll(id).subscribe(() => this.loadAdminPayroll());
  }

  markAsPaid(id: number): void {
    this.payrollService.markAsPaid(id).subscribe(() => this.loadAdminPayroll());
  }

  getMonthName(monthNum: number): string {
    return this.months[monthNum - 1];
  }

  getStatusClass(status: string): string {
    const map: any = { 'DRAFT': 'badge-premium-blue', 'APPROVED': 'badge-premium-blue', 'PAID': 'badge-premium-green' };
    return map[status] || 'badge-secondary';
  }
}
