import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, EmployeeResponse, EmployeeRequest } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
            <li class="nav-item"><a class="nav-link" routerLink="/tasks">Tasks</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <h2 class="page-header">{{ isEditMode ? 'Edit' : 'Add' }} Employee</h2>
          
          <div class="card">
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-control" formControlName="name"
                           [class.is-invalid]="form.get('name')?.touched && form.get('name')?.invalid">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email *</label>
                    <input type="email" class="form-control" formControlName="email"
                           [class.is-invalid]="form.get('email')?.touched && form.get('email')?.invalid">
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Age *</label>
                    <input type="number" class="form-control" formControlName="age"
                           [class.is-invalid]="form.get('age')?.touched && form.get('age')?.invalid">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Mobile *</label>
                    <input type="text" class="form-control" formControlName="mobile" maxlength="10"
                           [class.is-invalid]="form.get('mobile')?.touched && form.get('mobile')?.invalid">
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Username *</label>
                    <input type="text" class="form-control" formControlName="username"
                           [class.is-invalid]="form.get('username')?.touched && form.get('username')?.invalid">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Password {{ isEditMode ? '' : '*' }}</label>
                    <input type="password" class="form-control" formControlName="password">
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Department *</label>
                    <select class="form-select" formControlName="department">
                      <option value="">Select</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Salary *</label>
                    <input type="number" class="form-control" formControlName="salary">
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Role *</label>
                    <select class="form-select" formControlName="role">
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Manager</label>
                    <select class="form-select" formControlName="managerId">
                      <option [ngValue]="null">None</option>
                      <option *ngFor="let m of managers" [ngValue]="m.id">{{ m.name }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    {{ loading ? 'Saving...' : 'Save' }}
                  </button>
                  <a routerLink="/employees" class="btn btn-secondary">Cancel</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
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
}