import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, EmployeeRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <h2 style="color: #1e3a5f; font-weight: 600;">Create Account</h2>
          <p style="color: #64748b;">Join WorkForce Hub</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" formControlName="name"
                   [class.is-invalid]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid">
            <div class="invalid-feedback">Name is required (min 2 chars)</div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email"
                   [class.is-invalid]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
            <div class="invalid-feedback">Valid email is required</div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Age</label>
              <input type="number" class="form-control" formControlName="age"
                     [class.is-invalid]="registerForm.get('age')?.touched && registerForm.get('age')?.invalid">
              <div class="invalid-feedback">Age must be 18-60</div>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Mobile</label>
              <input type="text" class="form-control" formControlName="mobile" maxlength="10"
                     [class.is-invalid]="registerForm.get('mobile')?.touched && registerForm.get('mobile')?.invalid">
              <div class="invalid-feedback">10 digit mobile required</div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" formControlName="username"
                   [class.is-invalid]="registerForm.get('username')?.touched && registerForm.get('username')?.invalid">
            <div class="invalid-feedback">Alphanumeric username required</div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password"
                   [class.is-invalid]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
            <div class="invalid-feedback">Password is required</div>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Department</label>
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
              <label class="form-label">Salary</label>
              <input type="number" class="form-control" formControlName="salary">
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select class="form-select" formControlName="role">
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="TEAM_LEAD">Team Lead</option>
            </select>
          </div>
          
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>
        
        <div class="text-center mt-3">
          <p style="color: #64748b;">Already have an account? 
            <a routerLink="/login" style="color: #1e3a5f;">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(60)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', Validators.required],
      department: ['', Validators.required],
      salary: ['', Validators.required],
      role: ['EMPLOYEE']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const data: EmployeeRequest = {
      ...this.registerForm.value,
      age: Number(this.registerForm.value.age),
      salary: Number(this.registerForm.value.salary)
    };

    this.authService.register(data).subscribe({
      next: () => {
        window.location.href = '/dashboard';
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}