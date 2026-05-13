import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <h2 style="color: #1e3a5f; font-weight: 600;">WorkForce Hub</h2>
          <p style="color: #64748b;">Sign in to your account</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" class="form-control" formControlName="username" 
                   [class.is-invalid]="loginForm.get('username')?.touched && loginForm.get('username')?.invalid">
            <div class="invalid-feedback">Username is required</div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password"
                   [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
            <div class="invalid-feedback">Password is required</div>
          </div>
          
          <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <div class="text-center mt-3">
          <p style="color: #64748b;">Don't have an account? 
            <a routerLink="/register" style="color: #1e3a5f;">Register</a>
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

  constructor(private fb: FormBuilder, private authService: AuthService) {
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
        window.location.href = '/dashboard';
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}