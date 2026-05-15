import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse, EmployeeRequest } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout [pageTitle]="isEditMode ? 'Edit Employee' : 'Add Employee'" [pageSubtitle]="isEditMode ? 'Update employee records' : 'Register a new employee'">
      <div header-actions>
        <a routerLink="/employees" class="btn btn-outline-secondary">
          <span>←</span> Back to Employees
        </a>
      </div>
      
      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="custom-card">
            <div class="card-body-custom p-5">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                
                <h5 class="mb-4 text-primary fw-bold border-bottom pb-2">Personal Details</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Full Name *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">👤</span>
                      <input type="text" class="form-control with-icon" formControlName="name"
                             [class.is-invalid]="form.get('name')?.touched && form.get('name')?.invalid" placeholder="John Doe">
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email Address *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">✉️</span>
                      <input type="email" class="form-control with-icon" formControlName="email"
                             [class.is-invalid]="form.get('email')?.touched && form.get('email')?.invalid" placeholder="john@example.com">
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Age *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">📅</span>
                      <input type="number" class="form-control with-icon" formControlName="age"
                             [class.is-invalid]="form.get('age')?.touched && form.get('age')?.invalid">
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Mobile Number *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">📱</span>
                      <input type="text" class="form-control with-icon" formControlName="mobile" maxlength="10"
                             [class.is-invalid]="form.get('mobile')?.touched && form.get('mobile')?.invalid">
                    </div>
                  </div>
                </div>
                
                <h5 class="mb-4 mt-5 text-primary fw-bold border-bottom pb-2">Account Setup</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Username *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">&#64;</span>
                      <input type="text" class="form-control with-icon" formControlName="username"
                             [class.is-invalid]="form.get('username')?.touched && form.get('username')?.invalid">
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Password {{ isEditMode ? '(Leave blank to keep current)' : '*' }}</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">🔒</span>
                      <input type="password" class="form-control with-icon" formControlName="password"
                             placeholder="{{ isEditMode ? '••••••••' : 'Enter password' }}">
                    </div>
                  </div>
                </div>
                
                <h5 class="mb-4 mt-5 text-primary fw-bold border-bottom pb-2">Employment Information</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Department *</label>
                    <select class="form-select form-control" formControlName="department">
                      <option value="">Select Department</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Annual Salary (INR) *</label>
                    <div class="input-icon-wrapper">
                      <span class="input-icon">₹</span>
                      <input type="number" class="form-control with-icon" formControlName="salary">
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">System Role *</label>
                    <select class="form-select form-control" formControlName="role">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN" *ngIf="isAdmin()">Admin</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Reporting Manager</label>
                    <select class="form-select form-control" formControlName="managerId">
                      <option [ngValue]="null">None</option>
                      <option *ngFor="let m of managers" [ngValue]="m.id">{{ m.name }}</option>
                    </select>
                  </div>
                </div>
                
                <div *ngIf="error" class="alert alert-danger custom-alert mt-3 mb-0">
                  <span class="alert-icon">⚠️</span> {{ error }}
                </div>
                
                <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                  <a routerLink="/employees" class="btn btn-outline-secondary">Cancel</a>
                  <button type="submit" class="btn btn-primary btn-glow px-4" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Saving...' : 'Save Employee' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class EmployeeFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  loading = false;
  error = '';
  managers: EmployeeResponse[] = [];
  currentUser = this.authService.getCurrentUser();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(60)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: [''],
      department: ['', Validators.required],
      salary: ['', Validators.required],
      role: ['EMPLOYEE'],
      managerId: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadEmployee(+id);
    }
    this.loadManagers();
  }

  loadEmployee(id: number): void {
    this.employeeService.getById(id).subscribe(emp => {
      this.form.patchValue({
        ...emp,
        managerId: emp.managerId || null
      });
      this.form.get('password')?.clearValidators();
    });
  }

  loadManagers(): void {
    this.employeeService.getByRole('MANAGER').subscribe(mgrs => this.managers = mgrs);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const data: EmployeeRequest = {
      ...this.form.value,
      age: Number(this.form.value.age),
      salary: Number(this.form.value.salary)
    };

    const request = this.isEditMode
      ? this.employeeService.update(+this.route.snapshot.paramMap.get('id')!, data)
      : this.employeeService.create(data);

    request.subscribe({
      next: () => this.router.navigate(['/employees']),
      error: (err) => {
        this.error = err.error?.message || 'Error saving employee';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }
}