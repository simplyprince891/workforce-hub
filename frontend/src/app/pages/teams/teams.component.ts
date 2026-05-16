import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout/layout.component';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FormsModule],
  template: `
    <app-layout pageTitle="Teams" pageSubtitle="Organizational structure and groupings">
      <div header-actions *ngIf="isAdmin() || isManager() || isLead()">
        <button class="btn-premium" (click)="createTeam()" style="height: 3rem;">
          <i class="fas fa-plus me-2"></i> Create Team
        </button>
      </div>

      <div class="row g-4">
        <div class="col-md-4" *ngFor="let team of teams">
          <div class="glass-card h-100 animate-fade-in pointer-on-hover" (click)="selectTeam(team)">
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

      <!-- Team Details / Member Management -->
      <div class="mt-5 glass-card p-4 animate-fade-in" *ngIf="selectedTeam">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h3 class="display-font fs-4 mb-1">{{ selectedTeam.name }} Members</h3>
            <p class="small text-muted mb-0">{{ selectedTeam.description }}</p>
          </div>
          <div class="d-flex gap-2">
            <!-- Add Member Selection (Only for Assigned Lead/Admin/Manager) -->
            <div *ngIf="showAddMemberDropdown" class="d-flex gap-2 animate-fade-in">
              <select class="form-select form-select-sm" [(ngModel)]="selectedEmployeeId" style="width: 200px;">
                <option value="">Select Employee...</option>
                <option *ngFor="let emp of selectableEmployees" [value]="emp.id">
                  {{ emp.name }} ({{ emp.department }})
                </option>
              </select>
              <button class="btn btn-sm btn-success" [disabled]="!selectedEmployeeId" (click)="confirmAddMember()">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn btn-sm btn-light" (click)="showAddMemberDropdown = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <button *ngIf="!showAddMemberDropdown && canManageTeam()" 
                    class="btn btn-sm btn-dark" (click)="toggleAddMember()">
              <i class="fas fa-user-plus me-2"></i> Add Member
            </button>

            <!-- Delete Team Button (Only for Assigned Lead/Admin/Manager) -->
            <button *ngIf="canManageTeam()" class="btn btn-sm btn-outline-danger" (click)="deleteCurrentTeam()">
              <i class="fas fa-trash me-2"></i> Delete Team
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th *ngIf="canManageTeam()" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of members">
                <td class="fw-bold">{{ member.name }}</td>
                <td><span class="badge-premium badge-premium-blue">{{ member.role }}</span></td>
                <td class="small">{{ member.department }}</td>
                <td *ngIf="canManageTeam()" class="text-end">
                  <button class="btn btn-link text-danger p-0" (click)="removeMember(member.id)" title="Remove from Team">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="members.length === 0" class="p-4 text-center text-muted small">
            No members assigned to this team yet.
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
  selectedTeam: any = null;
  members: any[] = [];
  
  // Member Selection State
  selectableEmployees: any[] = [];
  showAddMemberDropdown: boolean = false;
  selectedEmployeeId: string = '';
  
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

  selectTeam(team: any): void {
    this.selectedTeam = team;
    this.showAddMemberDropdown = false; // Reset dropdown on team change
    this.http.get<any[]>(`http://localhost:8080/api/teams/${team.id}/members`).subscribe(res => {
      this.members = res;
    });
  }

  createTeam(): void {
    const name = prompt('Enter Team Name:');
    if (!name) return;
    const desc = prompt('Enter Team Description:');
    
    this.http.post('http://localhost:8080/api/teams', { name, description: desc }, {
      params: { managerId: this.authService.getCurrentUser()?.employeeId || '' }
    }).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: () => alert('Failed to create team.')
    });
  }

  toggleAddMember(): void {
    this.showAddMemberDropdown = true;
    this.selectedEmployeeId = '';
    // Load only employees with role 'EMPLOYEE'
    this.http.get<any[]>('http://localhost:8080/api/employees/role/EMPLOYEE').subscribe({
      next: (res) => {
        // Filter out employees who are already in any team or just current team
        // Assuming user wants only unassigned employees? Or just not in THIS team.
        const memberIds = this.members.map(m => m.id);
        this.selectableEmployees = res.filter(e => !memberIds.includes(e.id));
      },
      error: () => alert('Failed to load employee list.')
    });
  }

  confirmAddMember(): void {
    if (!this.selectedTeam || !this.selectedEmployeeId) return;

    this.http.post(`http://localhost:8080/api/teams/${this.selectedTeam.id}/members/${this.selectedEmployeeId}`, {}).subscribe({
      next: () => {
        this.showAddMemberDropdown = false;
        this.selectTeam(this.selectedTeam);
      },
      error: () => alert('Failed to add member.')
    });
  }

  removeMember(employeeId: number): void {
    if (!this.selectedTeam || !confirm('Are you sure you want to remove this member from the team?')) return;

    this.http.delete(`http://localhost:8080/api/teams/${this.selectedTeam.id}/members/${employeeId}`).subscribe({
      next: () => {
        this.selectTeam(this.selectedTeam);
      },
      error: () => alert('Failed to remove member.')
    });
  }

  deleteCurrentTeam(): void {
    if (!this.selectedTeam || !confirm(`Are you sure you want to PERMANENTLY delete ${this.selectedTeam.name}? This will unassign all members.`)) return;

    this.http.delete(`http://localhost:8080/api/teams/${this.selectedTeam.id}`).subscribe({
      next: () => {
        this.selectedTeam = null;
        this.loadTeams();
      },
      error: () => alert('Failed to delete team.')
    });
  }

  canManageTeam(): boolean {
    if (!this.selectedTeam) return false;
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    // Admin and Manager can manage everything
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;

    // Team Leads can ONLY manage teams they are assigned to
    return user.role === 'TEAM_LEAD' && user.employeeId === this.selectedTeam.managerId;
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isManager(): boolean {
    return this.authService.hasRole(['MANAGER']);
  }

  isLead(): boolean {
    return this.authService.hasRole(['TEAM_LEAD']);
  }
}
