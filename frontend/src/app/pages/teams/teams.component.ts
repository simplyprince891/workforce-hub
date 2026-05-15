import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout/layout.component';
import { EmployeeService, EmployeeResponse } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface TeamResponse {
  id: number;
  name: string;
  description: string;
  managerName: string;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout pageTitle="Teams" pageSubtitle="Organizational structure and groupings">
      <div header-actions *ngIf="isAdmin() || isManager()">
        <button class="btn-premium" (click)="openModal()" style="height: 3rem;">
          <i class="fas fa-plus me-2"></i> Create Team
        </button>
      </div>

      <div class="row g-4">
        <div class="col-md-4" *ngFor="let team of teams">
          <div class="glass-card h-100 animate-fade-in">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="badge-premium badge-premium-blue x-small fw-bold">Active Team</div>
              <div class="text-muted x-small">ID: #{{ team.id }}</div>
            </div>
            <h4 class="display-font fs-5 mb-2">{{ team.name }}</h4>
            <p class="small text-muted mb-4">{{ team.description || 'No description provided.' }}</p>
            <div class="pt-3 border-top mt-auto">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar bg-black text-white x-small" style="width: 24px; height: 24px;">{{ (team.managerName || 'M').charAt(0) }}</div>
                <div>
                  <div class="x-small text-muted text-uppercase fw-bold">Managed By</div>
                  <div class="small fw-bold">{{ team.managerName || 'System Admin' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="glass-card p-5 text-center" *ngIf="teams.length === 0">
        <i class="fas fa-users display-4 mb-3 opacity-25"></i>
        <h5 class="display-font text-dark">No Teams Found</h5>
        <p class="small text-muted">Create your first team to start organizing your workforce.</p>
      </div>
    </app-layout>
  `
})
export class TeamsComponent implements OnInit {
  teams: any[] = [];
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.http.get<any[]>('http://localhost:8080/api/teams').subscribe(res => {
      this.teams = res;
    });
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isManager(): boolean {
    return this.authService.hasRole(['MANAGER']);
  }

  openModal(): void {
    alert('Team creation modal would open here. Logic in progress.');
  }
}
