import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, EmployeeResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout pageTitle="My Profile" pageSubtitle="Manage your account details">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="custom-card text-center p-4">
            <div class="avatar mx-auto mb-3" style="width: 100px; height: 100px; font-size: 36px;">
              {{ getInitials() }}
            </div>
            <h4 class="mb-1 text-primary fw-bold">{{ profile?.name }}</h4>
            <p class="text-muted mb-3">{{ profile?.role }}</p>
            
            <div class="d-flex justify-content-center gap-2 mb-3">
              <span class="badge-custom" [class]="getRoleClass(profile?.role || '')">{{ profile?.role }}</span>
              <span class="badge-custom badge-secondary">{{ profile?.department }}</span>
            </div>
          </div>
        </div>
        
        <div class="col-md-8 mb-4">
          <div class="custom-card">
            <div class="card-header-custom">
              <h5 class="card-title-custom mb-0">Personal Information</h5>
            </div>
            <div class="card-body-custom">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Full Name</div>
                <div class="col-sm-9 fw-medium">{{ profile?.name }}</div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Email</div>
                <div class="col-sm-9"><a href="mailto:{{ profile?.email }}">{{ profile?.email }}</a></div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Mobile</div>
                <div class="col-sm-9">{{ profile?.mobile }}</div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Age</div>
                <div class="col-sm-9">{{ profile?.age }} years</div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Username</div>
                <div class="col-sm-9">&#64;{{ profile?.username }}</div>
              </div>
            </div>
          </div>
          
          <div class="custom-card mt-4">
            <div class="card-header-custom">
              <h5 class="card-title-custom mb-0">Employment Details</h5>
            </div>
            <div class="card-body-custom">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Department</div>
                <div class="col-sm-9">{{ profile?.department }}</div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Manager</div>
                <div class="col-sm-9">{{ profile?.managerName || 'None' }}</div>
              </div>
              <hr class="border-light">
              <div class="row mb-4">
                <div class="col-sm-3 text-muted">Joined Date</div>
                <div class="col-sm-9">{{ profile?.createdAt | date:'longDate' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ProfileComponent implements OnInit {
  profile: EmployeeResponse | null = null;
  currentUser = this.authService.getCurrentUser();

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (this.currentUser?.employeeId) {
      this.employeeService.getById(this.currentUser.employeeId).subscribe(res => {
        this.profile = res;
      });
    }
  }

  getInitials(): string {
    const name = this.profile?.name || '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRoleClass(role: string): string {
    const map: any = { 'ADMIN': 'badge-danger', 'MANAGER': 'badge-primary', 'TEAM_LEAD': 'badge-info', 'EMPLOYEE': 'badge-success' };
    return map[role] || 'badge-secondary';
  }
}