import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">WorkForce Hub</a>
        <div class="d-flex">
          <span class="navbar-text me-3">{{ user?.name }}</span>
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
            <li class="nav-item"><a class="nav-link active" routerLink="/profile">Profile</a></li>
          </ul>
        </div>
        
        <div class="col-md-10 p-4">
          <h2 class="page-header">My Profile</h2>
          
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">User Information</h5>
                  <div class="mt-3">
                    <p><strong>Name:</strong> {{ user?.name }}</p>
                    <p><strong>Username:</strong> {{ user?.username }}</p>
                    <p><strong>Email:</strong> {{ user?.username }}@workforce.com</p>
                    <p><strong>Role:</strong> <span class="badge bg-primary">{{ user?.role }}</span></p>
                    <p><strong>Employee ID:</strong> {{ user?.employeeId }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">My Task Statistics</h5>
                  <div class="row mt-3">
                    <div class="col-6">
                      <div class="stat-card text-center">
                        <div class="stat-value">{{ taskStats.total }}</div>
                        <div class="stat-label">Total Tasks</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="stat-card text-center">
                        <div class="stat-value">{{ taskStats.pending }}</div>
                        <div class="stat-label">Pending</div>
                      </div>
                    </div>
                    <div class="col-6 mt-3">
                      <div class="stat-card text-center">
                        <div class="stat-value">{{ taskStats.inProgress }}</div>
                        <div class="stat-label">In Progress</div>
                      </div>
                    </div>
                    <div class="col-6 mt-3">
                      <div class="stat-card text-center">
                        <div class="stat-value">{{ taskStats.completed }}</div>
                        <div class="stat-label">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: AuthResponse | null = null;
  taskStats = { total: 0, pending: 0, inProgress: 0, completed: 0 };

  constructor(private authService: AuthService, private taskService: TaskService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.taskService.countByEmployee(this.user.employeeId).subscribe(count => {
        this.taskStats.total = count;
      });
      this.taskService.countByEmployeeAndStatus(this.user.employeeId, 'PENDING').subscribe(count => {
        this.taskStats.pending = count;
      });
      this.taskService.countByEmployeeAndStatus(this.user.employeeId, 'IN_PROGRESS').subscribe(count => {
        this.taskStats.inProgress = count;
      });
      this.taskService.countByEmployeeAndStatus(this.user.employeeId, 'DONE').subscribe(count => {
        this.taskStats.completed = count;
      });
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}