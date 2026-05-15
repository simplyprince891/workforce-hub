import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="text-center mb-5">
          <div class="logo-icon bg-black text-white rounded d-inline-flex align-items-center justify-content-center mb-4" style="width: 48px; height: 48px; font-size: 1.5rem;">
            <i class="fas fa-bolt"></i>
          </div>
          <h2 class="auth-title display-font">WorkForce</h2>
          <p class="auth-subtitle">Management Hub</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="stat-label mb-2 d-block">Username</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-user"></i></span>
              <input type="text" class="form-control with-icon" formControlName="username"
                     [class.is-invalid]="loginForm.get('username')?.touched && loginForm.get('username')?.invalid" placeholder="e.g. admin">
            </div>
            <div class="invalid-feedback small mt-1">Username is required</div>
          </div>
          
          <div class="mb-4">
            <label class="stat-label mb-2 d-block">Password</label>
            <div class="input-icon-wrapper">
              <span class="input-icon"><i class="fas fa-lock"></i></span>
              <input type="password" class="form-control with-icon" formControlName="password"
                     [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" placeholder="••••••••">
            </div>
            <div class="invalid-feedback small mt-1">Password is required</div>
          </div>
          
          <div *ngIf="error" class="custom-alert alert-danger mb-4">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>
          
          <button type="submit" class="btn-glow w-100" [disabled]="loading">
            <span *ngIf="loading"><i class="fas fa-spinner fa-spin me-2"></i> Authenticating...</span>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>
        
        <div class="text-center mt-5">
          <p class="auth-link-text">Don't have an account? 
            <a routerLink="/register" class="auth-link">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}