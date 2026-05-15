import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="mb-4 d-flex align-items-center gap-2">
          <div class="logo-icon bg-black text-white rounded d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
            <i class="fas fa-bolt"></i>
          </div>
          <span class="logo-text fw-bold fs-5 display-font">WorkForce</span>
        </div>
        
        <nav class="flex-column d-flex gap-2 flex-grow-1">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-chart-pie w-20px"></i> <span class="nav-text">Dashboard</span>
          </a>
          <a routerLink="/employees" routerLinkActive="active" class="nav-link-custom" *ngIf="canViewEmployees()">
            <i class="fas fa-users w-20px"></i> <span class="nav-text">Employees</span>
          </a>
          <a routerLink="/tasks" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-tasks w-20px"></i> <span class="nav-text">Tasks</span>
          </a>
          <a routerLink="/payroll" routerLinkActive="active" class="nav-link-custom" *ngIf="canViewPayroll()">
            <i class="fas fa-wallet w-20px"></i> <span class="nav-text">Payroll</span>
          </a>
          <a routerLink="/leaves" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-calendar-alt w-20px"></i> <span class="nav-text">Leaves</span>
          </a>
          <a routerLink="/attendance" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-clock w-20px"></i> <span class="nav-text">Attendance</span>
          </a>
          <a routerLink="/teams" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-sitemap w-20px"></i> <span class="nav-text">Teams</span>
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link-custom">
            <i class="fas fa-user-circle w-20px"></i> <span class="nav-text">Profile</span>
          </a>
        </nav>
        
        <div class="mt-auto border-top pt-4">
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="avatar bg-black text-white">{{ getInitials() }}</div>
            <div class="user-details overflow-hidden">
              <div class="user-name text-truncate small fw-bold">{{ currentUser?.name }}</div>
              <div class="user-role text-muted x-small" style="font-size: 11px;">{{ currentUser?.role }}</div>
            </div>
          </div>
          <button class="btn w-100 btn-outline-dark btn-sm d-flex align-items-center justify-content-center gap-2" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </aside>
      
      <main class="main-content">
        <div class="animate-fade-in">
          <div class="d-flex justify-content-between align-items-end mb-5" *ngIf="pageTitle">
            <div>
              <h1 class="display-font mb-0" style="font-size: 2.5rem;">{{ pageTitle }}</h1>
              <p class="text-muted mb-0" *ngIf="pageSubtitle">{{ pageSubtitle }}</p>
            </div>
            <div class="header-actions">
              <ng-content select="[header-actions]"></ng-content>
            </div>
          </div>
          
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';
  
  currentUser = this.authService.getCurrentUser();

  constructor(private authService: AuthService, private router: Router) {}

  getInitials(): string {
    const name = this.currentUser?.name || '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  canViewPayroll(): boolean {
    return true; // Both admin and employee can view (employees see their own)
  }

  canViewEmployees(): boolean {
    return this.authService.hasRole(['ADMIN', 'MANAGER', 'TEAM_LEAD']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
