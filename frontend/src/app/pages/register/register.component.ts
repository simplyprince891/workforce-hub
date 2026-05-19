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
    <div class="auth-container">
      <div class="auth-card animate-fade-up">
        <div class="text-center mb-4">
          <h2 class="auth-title display-font">Join Us</h2>
          <p class="auth-subtitle">Create your OpsFlow account</p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="stat-label mb-2 d-block">Full Name</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-user"></i></span>
              <input type="text" class="form-control with-icon" formControlName="name"
                     [class.is-invalid]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid" placeholder="John Doe">
            </div>
            <div class="invalid-feedback small mt-1">Name is required (min 2 chars)</div>
          </div>
          
          <div class="mb-3">
            <label class="stat-label mb-2 d-block">Email Address</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-envelope"></i></span>
              <input type="email" class="form-control with-icon" formControlName="email"
                     [class.is-invalid]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" placeholder="john@opsflow.com">
            </div>
            <div class="invalid-feedback small mt-1">Valid email is required</div>
          </div>
          
          <div class="row g-3 mb-3">
            <div class="col-6">
              <label class="stat-label mb-2 d-block">Age</label>
              <div class="input-icon-wrapper">
                <span class="input-icon"><i class="fas fa-calendar-alt"></i></span>
                <input type="number" class="form-control with-icon" formControlName="age"
                       [class.is-invalid]="registerForm.get('age')?.touched && registerForm.get('age')?.invalid" placeholder="25">
              </div>
            </div>
            <div class="col-6">
              <label class="stat-label mb-2 d-block">Mobile</label>
              <div class="input-icon-wrapper">
                <span class="input-icon"><i class="fas fa-phone"></i></span>
                <input type="text" class="form-control with-icon" formControlName="mobile" maxlength="10"
                       [class.is-invalid]="registerForm.get('mobile')?.touched && registerForm.get('mobile')?.invalid" placeholder="1234567890">
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="stat-label mb-2 d-block">Username</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-at"></i></span>
              <input type="text" class="form-control with-icon" formControlName="username"
                     [class.is-invalid]="registerForm.get('username')?.touched && registerForm.get('username')?.invalid" placeholder="johndoe">
            </div>
          </div>
          
          <div class="mb-4">
            <label class="stat-label mb-2 d-block">Password</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input type="password" class="form-control with-icon" formControlName="password"
                     [class.is-invalid]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid" placeholder="••••••••">
            </div>
          </div>
          
          <div *ngIf="error" class="custom-alert alert-danger mb-4">
            <i class="fas fa-exclamation-triangle"></i> {{ error }}
          </div>
          
          <button type="submit" class="btn-glow w-100" [disabled]="loading">
            <span *ngIf="loading"><i class="fas fa-spinner fa-spin me-2"></i> Creating Account...</span>
            <span *ngIf="!loading">Create Account</span>
          </button>
        </form>
        
        <div class="text-center mt-5">
          <p class="auth-link-text">Already have an account? 
            <a routerLink="/login" class="auth-link">Sign In</a>
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
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    // Set defaults since they were removed from the form
    const data: EmployeeRequest = {
      ...this.registerForm.value,
      age: Number(this.registerForm.value.age),
      department: 'Unassigned',
      salary: 0,
      role: 'EMPLOYEE'
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}